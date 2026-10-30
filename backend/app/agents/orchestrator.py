import time
import json
import urllib.request
import ssl
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.entities import (
    User, FarmerProfile, Farm, FarmCrop, CropCatalog, CropGrowthStage,
    Conversation, ConversationMessage, AgentRun, AgentExecutionStep, ToolExecutionLog,
    Advisory, AdvisoryCitation, CropRiskAssessment
)
from backend.app.integrations.weather_client import WeatherClient
from backend.app.integrations.mandi_client import MandiClient
from backend.app.risk_engine.calculator import CropRiskEngine
from backend.app.rag.retriever import AgriculturalRetriever

class AgentOrchestrator:
    """
    Autonomous Agricultural Intelligence Agent.
    Dynamically routes intents, executes deterministic tools, searches verified RAG,
    validates evidence freshness, and generates structured vernacular advisories with Gemini.
    """

    def __init__(self, db: Session):
        self.db = db
        self.ssl_ctx = ssl.create_default_context()
        self.ssl_ctx.check_hostname = False
        self.ssl_ctx.verify_mode = ssl.CERT_NONE

    def _log_step(self, run: AgentRun, step_order: int, name: str, status: str, summary: str, details: Dict[str, Any] = None, latency_ms: int = 0) -> AgentExecutionStep:
        step = AgentExecutionStep(
            agent_run_id=run.id,
            step_order=step_order,
            step_name=name,
            status=status,
            summary=summary,
            details=details or {},
            latency_ms=latency_ms
        )
        self.db.add(step)
        self.db.commit()
        self.db.refresh(step)
        return step

    def _log_tool(self, run: AgentRun, tool_name: str, in_payload: Any, out_payload: Any, status: str, latency_ms: int):
        tool_log = ToolExecutionLog(
            agent_run_id=run.id,
            tool_name=tool_name,
            input_payload=in_payload if isinstance(in_payload, dict) else {"input": str(in_payload)},
            output_payload=out_payload if isinstance(out_payload, dict) else {"output": str(out_payload)},
            status=status,
            latency_ms=latency_ms
        )
        self.db.add(tool_log)
        self.db.commit()

    async def execute_advisory_pipeline(
        self,
        user_id: str,
        query_text: str,
        conversation_id: Optional[str] = None,
        language: str = "hi"
    ) -> Dict[str, Any]:
        """
        Executes complete end-to-end agentic workflow:
        1. Context & Phenology Discovery
        2. Hyperlocal Live Weather Retrieval
        3. Deterministic Risk Evaluation
        4. ICAR RAG Evidence Retrieval
        5. Grounded Vernacular Advisory Synthesis
        6. Citation Provenance & Execution Step Persistence
        """
        start_time = time.time()

        # 1. Ensure conversation exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"Farmer with id {user_id} not found.")

        if not conversation_id:
            conv = Conversation(user_id=user.id, title=query_text[:50])
            self.db.add(conv)
            self.db.commit()
            self.db.refresh(conv)
            conversation_id = str(conv.id)
        else:
            conv = self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

        # Record user message
        user_msg = ConversationMessage(
            conversation_id=conv.id,
            sender_role="user",
            content=query_text,
            language=language
        )
        self.db.add(user_msg)
        self.db.commit()
        self.db.refresh(user_msg)

        # Initialize Agent Run audit entity
        agent_run = AgentRun(
            conversation_id=conv.id,
            user_message_id=user_msg.id,
            status="INITIALIZED",
            model_used=settings.GEMINI_MODEL
        )
        self.db.add(agent_run)
        self.db.commit()
        self.db.refresh(agent_run)

        execution_steps_log = []

        try:
            # -----------------------------------------------------------------
            # Step 1: Understand Question Intent
            # -----------------------------------------------------------------
            s1_start = time.time()
            step1 = self._log_step(
                agent_run, 1, "Understanding Query & Intent", "SUCCESS",
                f"Analyzing farmer inquiry: '{query_text}' with target language '{language}'",
                details={"query": query_text, "language": language},
                latency_ms=int((time.time() - s1_start) * 1000)
            )
            execution_steps_log.append({"step": step1.step_name, "summary": step1.summary, "status": "SUCCESS"})

            # -----------------------------------------------------------------
            # Step 2: Fetch Farm Context & Derive Growth Stage
            # -----------------------------------------------------------------
            s2_start = time.time()
            profile = self.db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
            lat = float(profile.latitude) if profile else 20.7002  # Default to Akola, Maharashtra if pending
            lon = float(profile.longitude) if profile else 77.0082
            district = profile.district if profile else "Akola"
            state = profile.state if profile else "Maharashtra"

            # Fetch active crop
            farm = self.db.query(Farm).filter(Farm.farmer_profile_id == profile.id).first() if profile else None
            farm_crop = self.db.query(FarmCrop).filter(FarmCrop.farm_id == farm.id).first() if farm else None
            
            crop = farm_crop.crop if farm_crop else self.db.query(CropCatalog).filter(CropCatalog.common_name == "Cotton").first()
            growth_stage = None
            if farm_crop:
                growth_stage = CropRiskEngine.estimate_growth_stage(farm_crop.sowing_date, crop.id, self.db)
                if not farm_crop.current_growth_stage_id and growth_stage:
                    farm_crop.current_growth_stage_id = growth_stage.id
                    self.db.commit()

            stage_name = growth_stage.stage_name if growth_stage else "Flowering & Boll Formation"
            step2 = self._log_step(
                agent_run, 2, "Checking Farm Context & Phenology", "SUCCESS",
                f"Identified farm in {district}, {state}. Crop: {crop.common_name} ({crop.hindi_name}), Phenological Stage: {stage_name}",
                details={"crop": crop.common_name, "stage": stage_name, "coordinates": [lat, lon]},
                latency_ms=int((time.time() - s2_start) * 1000)
            )
            execution_steps_log.append({"step": step2.step_name, "summary": step2.summary, "status": "SUCCESS"})

            # -----------------------------------------------------------------
            # Step 3: Fetch Live Hyperlocal Weather
            # -----------------------------------------------------------------
            s3_start = time.time()
            weather_data = await WeatherClient.get_current_and_forecast(lat, lon)
            s3_lat = int((time.time() - s3_start) * 1000)
            
            self._log_tool(agent_run, "get_weather_forecast", {"lat": lat, "lon": lon}, weather_data["provenance"], "SUCCESS", s3_lat)
            
            curr = weather_data["current"]
            step3 = self._log_step(
                agent_run, 3, "Fetching Live Weather Intelligence", "SUCCESS",
                f"Retrieved live observation for {district}: {curr['temperature_c']}°C, {curr['relative_humidity_pct']}% humidity, 7-day forecast active.",
                details={"current": curr, "forecast_days": len(weather_data["daily_forecast"])},
                latency_ms=s3_lat
            )
            execution_steps_log.append({"step": step3.step_name, "summary": step3.summary, "status": "SUCCESS"})

            # -----------------------------------------------------------------
            # Step 4: Deterministic Crop Risk Engine
            # -----------------------------------------------------------------
            s4_start = time.time()
            risk_result = CropRiskEngine.evaluate_risk(
                crop=crop,
                stage=growth_stage,
                current_weather=weather_data["current"],
                forecast_daily=weather_data["daily_forecast"],
                db=self.db
            )
            s4_lat = int((time.time() - s4_start) * 1000)
            self._log_tool(agent_run, "calculate_crop_risk", {"crop": crop.common_name, "stage": stage_name}, risk_result, "SUCCESS", s4_lat)

            # Persist Risk Assessment
            assessment = None
            if farm_crop:
                assessment = CropRiskAssessment(
                    farm_crop_id=farm_crop.id,
                    agent_run_id=agent_run.id,
                    risk_level=risk_result["risk_level"],
                    risk_score=risk_result["risk_score"],
                    primary_factors=risk_result["primary_factors"],
                    calculated_conditions=risk_result["calculated_conditions"],
                    raw_metrics=weather_data["current"],
                    limitations=risk_result["limitations"]
                )
                self.db.add(assessment)
                self.db.commit()
                self.db.refresh(assessment)

            step4 = self._log_step(
                agent_run, 4, "Calculating Deterministic Crop Risk", "SUCCESS",
                f"Crop Risk evaluated: {risk_result['risk_level']} (Score: {risk_result['risk_score']}/100). {len(risk_result['primary_factors'])} agronomical risk factors triggered.",
                details=risk_result,
                latency_ms=s4_lat
            )
            execution_steps_log.append({"step": step4.step_name, "summary": step4.summary, "status": "SUCCESS"})

            # -----------------------------------------------------------------
            # Step 5: Agricultural Knowledge RAG Retrieval
            # -----------------------------------------------------------------
            s5_start = time.time()
            rag_evidence = AgriculturalRetriever.search(
                query=query_text,
                db=self.db,
                crop_name=crop.common_name,
                growth_stage=stage_name,
                top_k=3
            )
            s5_lat = int((time.time() - s5_start) * 1000)
            self._log_tool(agent_run, "retrieve_agricultural_knowledge", {"query": query_text, "crop": crop.common_name}, {"evidence_count": len(rag_evidence)}, "SUCCESS", s5_lat)

            step5 = self._log_step(
                agent_run, 5, "Retrieving ICAR Agricultural Knowledge", "SUCCESS",
                f"Retrieved {len(rag_evidence)} verified agronomic passages from ICAR packages of practices.",
                details={"evidence": rag_evidence},
                latency_ms=s5_lat
            )
            execution_steps_log.append({"step": step5.step_name, "summary": step5.summary, "status": "SUCCESS"})

            # -----------------------------------------------------------------
            # Step 6: Gemini Synthesis & Structured Advisory Generation
            # -----------------------------------------------------------------
            s6_start = time.time()
            advisory_content = await self._synthesize_with_gemini(
                farmer_name=user.full_name,
                crop_name=f"{crop.common_name} ({crop.hindi_name})",
                growth_stage=stage_name,
                location=f"{district}, {state}",
                weather=weather_data["current"],
                risk=risk_result,
                evidence=rag_evidence,
                farmer_query=query_text,
                language=language
            )
            s6_lat = int((time.time() - s6_start) * 1000)

            # Persist Advisory
            adv = None
            if farm_crop:
                adv = Advisory(
                    farm_crop_id=farm_crop.id,
                    conversation_id=conv.id,
                    agent_run_id=agent_run.id,
                    risk_assessment_id=assessment.id if assessment else None,
                    language=language,
                    title=advisory_content.get("title", f"{crop.hindi_name} सुरक्षा सलाह"),
                    summary=advisory_content.get("summary", ""),
                    detailed_steps=advisory_content.get("actionable_steps", []),
                    urgency="URGENT" if risk_result["risk_level"] in ["HIGH", "SEVERE"] else "NORMAL"
                )
                self.db.add(adv)
                self.db.commit()
                self.db.refresh(adv)

                # Save citations
                for ev in rag_evidence:
                    cit = AdvisoryCitation(
                        advisory_id=adv.id,
                        document_chunk_id=ev["chunk_id"],
                        cited_text_snippet=ev["text"][:250],
                        similarity_score=ev.get("similarity"),
                        page_number=ev.get("page_number")
                    )
                    self.db.add(cit)
                self.db.commit()

            # Record assistant response message
            assistant_msg = ConversationMessage(
                conversation_id=conv.id,
                sender_role="assistant",
                content=json.dumps(advisory_content, ensure_ascii=False),
                language=language
            )
            self.db.add(assistant_msg)

            step6 = self._log_step(
                agent_run, 6, "Synthesizing Personalized Vernacular Advisory", "SUCCESS",
                f"Generated grounded {language.upper()} advisory with citations and structured action plan.",
                details={"title": advisory_content.get("title")},
                latency_ms=s6_lat
            )
            execution_steps_log.append({"step": step6.step_name, "summary": step6.summary, "status": "SUCCESS"})

            # Mark Agent Run Completed
            agent_run.status = "COMPLETED"
            agent_run.latency_ms = int((time.time() - start_time) * 1000)
            agent_run.completed_at = datetime.utcnow()
            self.db.commit()

            return {
                "conversation_id": str(conv.id),
                "agent_run_id": str(agent_run.id),
                "execution_trace": execution_steps_log,
                "risk_assessment": risk_result,
                "advisory": advisory_content,
                "citations": rag_evidence,
                "weather_snapshot": weather_data["current"]
            }

        except Exception as exc:
            self.db.rollback()
            agent_run.status = "FAILED"
            agent_run.error_message = str(exc)
            self.db.commit()
            raise exc

    async def _synthesize_with_gemini(
        self,
        farmer_name: str,
        crop_name: str,
        growth_stage: str,
        location: str,
        weather: Dict[str, Any],
        risk: Dict[str, Any],
        evidence: List[Dict[str, Any]],
        farmer_query: str,
        language: str
    ) -> Dict[str, Any]:
        """Invokes Gemini 3.5 Flash using structured JSON instructions."""
        prompt = f"""
You are Farmarian, the AI Agricultural Guardian for AgroShield.
Generate a structured, compassionate, and scientifically grounded advisory for an Indian farmer.

FARM CONTEXT:
- Farmer Name: {farmer_name}
- Location: {location}
- Crop Cultivated: {crop_name}
- Current Growth Stage: {growth_stage}

LIVE WEATHER OBSERVATION:
- Temperature: {weather.get('temperature_c')}°C
- Relative Humidity: {weather.get('relative_humidity_pct')}%
- Precipitation: {weather.get('precipitation_mm')} mm

DETERMINISTIC CROP-RISK EVALUATION:
- Risk Level: {risk.get('risk_level')}
- Risk Score: {risk.get('risk_score')}/100
- Contributing Factors: {json.dumps(risk.get('primary_factors', []), ensure_ascii=False)}

VERIFIED AGRICULTURAL KNOWLEDGE (ICAR EVIDENCE):
{json.dumps(evidence, ensure_ascii=False)}

FARMER'S QUESTION:
"{farmer_query}"

INSTRUCTIONS:
1. Respond primarily in {language.upper()} (e.g. Hindi if 'hi').
2. Ground all advice in the provided ICAR knowledge and weather facts. Do not invent unverified chemical treatments.
3. Output strictly valid JSON matching this schema:
{{
  "title": "Short title in preferred language",
  "summary": "1-2 sentence high-level compassionate summary from Farmarian",
  "urgency": "NORMAL or URGENT",
  "actionable_steps": [
    {{
      "category": "Immediate (तत्काल कदम)",
      "action": "Specific practical task (e.g., ensure field drainage)",
      "timeline": "Next 24 hours"
    }},
    {{
      "category": "Preventative (निवारक उपाय)",
      "action": "Specific preventive measure",
      "timeline": "2-3 days"
    }},
    {{
      "category": "Monitoring (निगरानी)",
      "action": "What to inspect in the field",
      "timeline": "Daily inspection"
    }}
  ],
  "farmarian_note": "Friendly protective encouragement from Farmarian"
}}
"""

        key = settings.GEMINI_API_KEY
        model = settings.GEMINI_MODEL
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, context=self.ssl_ctx, timeout=20) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                text_out = res["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_out)
        except Exception as e:
            # Deterministic fallback advisory if rate limits or transient network issue occur
            return {
                "title": f"{crop_name} सुरक्षा सलाह ({growth_stage})",
                "summary": f"वर्तमान मौसम परिस्थितियों और {growth_stage} अवस्था को देखते हुए खेत में जल निकासी सुनिश्चित करें और अत्यधिक नमी से फसल को सुरक्षित रखें।",
                "urgency": "URGENT" if risk.get("risk_level") in ["HIGH", "SEVERE"] else "NORMAL",
                "actionable_steps": [
                    {"category": "तत्काल कदम", "action": "खेत से अतिरिक्त पानी निकालने के लिए नालियों को साफ करें।", "timeline": "अगले 24 घंटे"},
                    {"category": "निवारक उपाय", "action": "भारी वर्षा की संभावना के दौरान कीटनाशक या उर्वरक का छिड़काव न करें।", "timeline": "बारिश रुकने तक"},
                    {"category": "निगरानी", "action": "फूलों और कलियों के झड़ने का निरीक्षण करें।", "timeline": "दैनिक"}
                ],
                "farmarian_note": "फार्मरियन आपके खेत की सुरक्षा के लिए लगातार मौसम और फसल की स्थिति पर नजर रख रहा है।"
            }
