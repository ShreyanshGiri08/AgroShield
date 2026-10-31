import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Numeric, Integer, Text, ForeignKey, CheckConstraint, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from backend.app.core.database import Base

# -----------------------------------------------------------------------------
# Module 1: User & Farm Management
# -----------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(15), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=False)
    preferred_language = Column(String(10), default="hi")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    memories = relationship("FarmerMemory", back_populates="user", cascade="all, delete-orphan")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    state = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False)
    sub_district = Column(String(50))
    village = Column(String(100), nullable=False)
    pin_code = Column(String(10))
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    experience_years = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
    farms = relationship("Farm", back_populates="farmer_profile", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_profile_id = Column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False)
    farm_name = Column(String(100), nullable=False)
    area_acres = Column(Numeric(6, 2), nullable=False)
    soil_type = Column(String(50))
    irrigation_source = Column(String(50))
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer_profile = relationship("FarmerProfile", back_populates="farms")
    crops = relationship("FarmCrop", back_populates="farm", cascade="all, delete-orphan")


class CropCatalog(Base):
    __tablename__ = "crop_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    common_name = Column(String(50), unique=True, nullable=False)
    hindi_name = Column(String(50), nullable=False)
    scientific_name = Column(String(100))
    crop_category = Column(String(30), nullable=False)
    season = Column(String(20), nullable=False)
    standard_duration_days = Column(Integer, nullable=False)
    min_temp_c = Column(Numeric(4, 1))
    max_temp_c = Column(Numeric(4, 1))
    optimal_rainfall_mm_min = Column(Numeric(6, 1))
    optimal_rainfall_mm_max = Column(Numeric(6, 1))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    growth_stages = relationship("CropGrowthStage", back_populates="crop", cascade="all, delete-orphan")


class CropGrowthStage(Base):
    __tablename__ = "crop_growth_stages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crop_catalog.id", ondelete="CASCADE"), nullable=False)
    stage_name = Column(String(50), nullable=False)
    stage_order = Column(Integer, nullable=False)
    start_day_offset = Column(Integer, nullable=False)
    end_day_offset = Column(Integer, nullable=False)
    water_sensitivity = Column(String(20), nullable=False)
    heat_sensitivity = Column(String(20), nullable=False)
    key_vulnerabilities = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    crop = relationship("CropCatalog", back_populates="growth_stages")


class FarmCrop(Base):
    __tablename__ = "farm_crops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crop_catalog.id", ondelete="RESTRICT"), nullable=False)
    variety_name = Column(String(100))
    sowing_date = Column(Date, nullable=False)
    expected_harvest_date = Column(Date)
    current_growth_stage_id = Column(UUID(as_uuid=True), ForeignKey("crop_growth_stages.id", ondelete="SET NULL"))
    current_status = Column(String(20), default="ACTIVE")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="crops")
    crop = relationship("CropCatalog")
    current_growth_stage = relationship("CropGrowthStage")
    risk_assessments = relationship("CropRiskAssessment", back_populates="farm_crop", cascade="all, delete-orphan")
    advisories = relationship("Advisory", back_populates="farm_crop", cascade="all, delete-orphan")


# -----------------------------------------------------------------------------
# Module 2: Data Source Registry & External Data Intelligence
# -----------------------------------------------------------------------------

class DataSourceRegistry(Base):
    __tablename__ = "data_source_registry"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_name = Column(String(100), unique=True, nullable=False)
    source_type = Column(String(30), nullable=False)
    endpoint_or_url = Column(Text, nullable=False)
    authentication_type = Column(String(30), default="NONE")
    is_active = Column(Boolean, default=True)
    attribution_text = Column(Text, nullable=False)
    last_verified_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="SET NULL"))
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    source_id = Column(UUID(as_uuid=True), ForeignKey("data_source_registry.id", ondelete="RESTRICT"), nullable=False)
    observation_timestamp = Column(DateTime(timezone=True), nullable=False)
    temperature_c = Column(Numeric(4, 1), nullable=False)
    relative_humidity_pct = Column(Numeric(4, 1))
    precipitation_mm = Column(Numeric(6, 2), default=0.0)
    wind_speed_kmh = Column(Numeric(5, 2))
    wind_direction_deg = Column(Integer)
    weather_code = Column(Integer)
    weather_description = Column(String(100))
    raw_response = Column(JSONB)
    fetched_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="SET NULL"))
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    source_id = Column(UUID(as_uuid=True), ForeignKey("data_source_registry.id", ondelete="RESTRICT"), nullable=False)
    forecast_date = Column(Date, nullable=False)
    temp_min_c = Column(Numeric(4, 1), nullable=False)
    temp_max_c = Column(Numeric(4, 1), nullable=False)
    precipitation_sum_mm = Column(Numeric(6, 2), nullable=False)
    precipitation_probability_pct = Column(Integer)
    max_wind_speed_kmh = Column(Numeric(5, 2))
    evapotranspiration_mm = Column(Numeric(5, 2))
    uv_index_max = Column(Numeric(4, 1))
    weather_code = Column(Integer)
    raw_response = Column(JSONB)
    fetched_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class MandiMarket(Base):
    __tablename__ = "mandi_markets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    market_name = Column(String(100), nullable=False)
    district = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    market_id = Column(UUID(as_uuid=True), ForeignKey("mandi_markets.id", ondelete="CASCADE"), nullable=False)
    commodity = Column(String(50), nullable=False)
    variety = Column(String(50))
    arrival_date = Column(Date, nullable=False)
    min_price = Column(Numeric(10, 2), nullable=False)
    max_price = Column(Numeric(10, 2), nullable=False)
    modal_price = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="Rs/Quintal")
    source_id = Column(UUID(as_uuid=True), ForeignKey("data_source_registry.id", ondelete="RESTRICT"), nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    market = relationship("MandiMarket")


# -----------------------------------------------------------------------------
# Module 3: Agricultural RAG & Vector Knowledge Base
# -----------------------------------------------------------------------------

class AgriculturalDocument(Base):
    __tablename__ = "agricultural_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    issuing_institution = Column(String(150), nullable=False)
    document_type = Column(String(50), nullable=False)
    publication_year = Column(Integer)
    source_url = Column(Text)
    document_hash = Column(String(64), unique=True, nullable=False)
    total_chunks = Column(Integer, default=0)
    doc_metadata = Column("metadata", JSONB, default={})
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    chunks = relationship("AgriculturalDocumentChunk", back_populates="document", cascade="all, delete-orphan")


class AgriculturalDocumentChunk(Base):
    __tablename__ = "agricultural_document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("agricultural_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    clean_text = Column(Text, nullable=False)
    page_number = Column(Integer)
    crop_name = Column(String(50))
    growth_stage = Column(String(50))
    topic = Column(String(50))
    region = Column(String(50))
    chunk_metadata = Column("metadata", JSONB, default={})
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    document = relationship("AgriculturalDocument", back_populates="chunks")
    embedding = relationship("DocumentEmbedding", back_populates="chunk", uselist=False, cascade="all, delete-orphan")


class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chunk_id = Column(UUID(as_uuid=True), ForeignKey("agricultural_document_chunks.id", ondelete="CASCADE"), unique=True, nullable=False)
    embedding = Column(Vector(384), nullable=False)
    model_name = Column(String(100), default="sentence-transformers/all-MiniLM-L6-v2")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    chunk = relationship("AgriculturalDocumentChunk", back_populates="embedding")


# -----------------------------------------------------------------------------
# Module 4: Agentic AI, Conversations & Execution Traces
# -----------------------------------------------------------------------------

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="SET NULL"))
    title = Column(String(150))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="conversation", cascade="all, delete-orphan")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    input_modality = Column(String(20), default="text")
    language = Column(String(10), default="hi")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_message_id = Column(UUID(as_uuid=True), ForeignKey("conversation_messages.id", ondelete="SET NULL"))
    status = Column(String(30), default="INITIALIZED")
    error_message = Column(Text)
    total_tokens = Column(Integer, default=0)
    latency_ms = Column(Integer)
    model_used = Column(String(50))
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True))

    conversation = relationship("Conversation", back_populates="agent_runs")
    steps = relationship("AgentExecutionStep", back_populates="agent_run", cascade="all, delete-orphan")
    tool_logs = relationship("ToolExecutionLog", back_populates="agent_run", cascade="all, delete-orphan")


class AgentExecutionStep(Base):
    __tablename__ = "agent_execution_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    step_order = Column(Integer, nullable=False)
    step_name = Column(String(100), nullable=False)
    status = Column(String(30), nullable=False)
    summary = Column(Text)
    details = Column(JSONB, default={})
    latency_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    agent_run = relationship("AgentRun", back_populates="steps")


class ToolExecutionLog(Base):
    __tablename__ = "tool_execution_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String(100), nullable=False)
    input_payload = Column(JSONB)
    output_payload = Column(JSONB)
    status = Column(String(20), nullable=False)
    latency_ms = Column(Integer, nullable=False)
    retry_count = Column(Integer, default=0)
    error_details = Column(Text)
    executed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    agent_run = relationship("AgentRun", back_populates="tool_logs")


# -----------------------------------------------------------------------------
# Module 5: Deterministic Crop Risk & Advisories
# -----------------------------------------------------------------------------

class RiskRuleDefinition(Base):
    __tablename__ = "risk_rule_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_code = Column(String(50), unique=True, nullable=False)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crop_catalog.id", ondelete="CASCADE"))
    stage_id = Column(UUID(as_uuid=True), ForeignKey("crop_growth_stages.id", ondelete="CASCADE"))
    condition_metric = Column(String(50), nullable=False)
    operator = Column(String(10), nullable=False)
    threshold_value_min = Column(Numeric(8, 2))
    threshold_value_max = Column(Numeric(8, 2))
    severity_level = Column(String(20), nullable=False)
    rationale = Column(Text, nullable=False)
    source_citation = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class CropRiskAssessment(Base):
    __tablename__ = "crop_risk_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_crop_id = Column(UUID(as_uuid=True), ForeignKey("farm_crops.id", ondelete="CASCADE"), nullable=False)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="SET NULL"))
    risk_level = Column(String(20), nullable=False)
    risk_score = Column(Numeric(5, 2), nullable=False)
    primary_factors = Column(JSONB, nullable=False)
    calculated_conditions = Column(JSONB, nullable=False)
    raw_metrics = Column(JSONB)
    limitations = Column(Text)
    assessed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    farm_crop = relationship("FarmCrop", back_populates="risk_assessments")


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_crop_id = Column(UUID(as_uuid=True), ForeignKey("farm_crops.id", ondelete="CASCADE"), nullable=False)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="SET NULL"))
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="SET NULL"))
    risk_assessment_id = Column(UUID(as_uuid=True), ForeignKey("crop_risk_assessments.id", ondelete="SET NULL"))
    language = Column(String(10), default="hi")
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    detailed_steps = Column(JSONB, nullable=False)
    urgency = Column(String(20), default="NORMAL")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    farm_crop = relationship("FarmCrop", back_populates="advisories")
    citations = relationship("AdvisoryCitation", back_populates="advisory", cascade="all, delete-orphan")


class AdvisoryCitation(Base):
    __tablename__ = "advisory_citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    advisory_id = Column(UUID(as_uuid=True), ForeignKey("advisories.id", ondelete="CASCADE"), nullable=False)
    document_chunk_id = Column(UUID(as_uuid=True), ForeignKey("agricultural_document_chunks.id", ondelete="RESTRICT"), nullable=False)
    cited_text_snippet = Column(Text, nullable=False)
    similarity_score = Column(Numeric(4, 3))
    page_number = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    advisory = relationship("Advisory", back_populates="citations")
    chunk = relationship("AgriculturalDocumentChunk")


class ScenarioAnalysis(Base):
    __tablename__ = "scenario_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_crop_id = Column(UUID(as_uuid=True), ForeignKey("farm_crops.id", ondelete="CASCADE"), nullable=False)
    base_assessment_id = Column(UUID(as_uuid=True), ForeignKey("crop_risk_assessments.id", ondelete="RESTRICT"), nullable=False)
    simulated_delta = Column(JSONB, nullable=False)
    scenario_risk_level = Column(String(20), nullable=False)
    scenario_risk_score = Column(Numeric(5, 2), nullable=False)
    comparison_summary = Column(Text, nullable=False)
    preventative_advice = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


# -----------------------------------------------------------------------------
# Module 6 & 7: Images, Feedback, Memory & Alerts
# -----------------------------------------------------------------------------

class CropImage(Base):
    __tablename__ = "crop_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_crop_id = Column(UUID(as_uuid=True), ForeignKey("farm_crops.id", ondelete="SET NULL"))
    storage_path = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(50), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class ImageAnalysisResult(Base):
    __tablename__ = "image_analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_id = Column(UUID(as_uuid=True), ForeignKey("crop_images.id", ondelete="CASCADE"), nullable=False)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="SET NULL"))
    detected_symptoms = Column(JSONB, nullable=False)
    possible_causes = Column(JSONB, nullable=False)
    confidence_level = Column(String(20), nullable=False)
    recommended_actions = Column(JSONB, nullable=False)
    uncertainty_disclaimer = Column(Text, nullable=False)
    analyzed_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class FarmerMemory(Base):
    __tablename__ = "farmer_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    memory_key = Column(String(100), nullable=False)
    memory_value = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    confidence_score = Column(Numeric(4, 2), default=1.0)
    last_validated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="memories")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_crop_id = Column(UUID(as_uuid=True), ForeignKey("farm_crops.id", ondelete="CASCADE"))
    alert_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    action_url = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")
