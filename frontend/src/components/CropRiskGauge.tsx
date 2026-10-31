import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface CropRiskGaugeProps {
  riskData: any;
  language: string;
}

export const CropRiskGauge: React.FC<CropRiskGaugeProps> = ({ riskData, language }) => {
  if (!riskData) {
    return (
      <div className="matte-panel p-6 text-center text-[#576258] text-xs">
        {language === 'hi'
          ? 'ICAR नियमों पर आधारित फसल जोखिम की गणना हो रही है...'
          : 'Evaluating deterministic agronomic rules...'}
      </div>
    );
  }

  const score = riskData.risk_score || 0;
  const level = riskData.risk_level || 'LOW';
  const factors = riskData.primary_factors || [];

  const getStyle = (lvl: string) => {
    switch (lvl) {
      case 'SEVERE':
        return {
          text: 'text-[#9E2A2B]',
          bg: 'bg-[#F9ECEC]',
          border: 'border-[#9E2A2B]/40',
          barColor: 'bg-[#9E2A2B]',
          label: language === 'hi' ? 'गंभीर जोखिम' : 'Severe Risk',
        };
      case 'HIGH':
        return {
          text: 'text-[#995A1E]',
          bg: 'bg-[#FBF2E9]',
          border: 'border-[#995A1E]/40',
          barColor: 'bg-[#995A1E]',
          label: language === 'hi' ? 'उच्च जोखिम' : 'Elevated Risk',
        };
      case 'MODERATE':
        return {
          text: 'text-[#8A6318]',
          bg: 'bg-[#F9F5EA]',
          border: 'border-[#8A6318]/40',
          barColor: 'bg-[#8A6318]',
          label: language === 'hi' ? 'मध्यम जोखिम' : 'Moderate Sensitivity',
        };
      default:
        return {
          text: 'text-[#276738]',
          bg: 'bg-[#EDF6EF]',
          border: 'border-[#276738]/40',
          barColor: 'bg-[#276738]',
          label: language === 'hi' ? 'सामान्य / सुरक्षित' : 'Nominal / Favorable',
        };
    }
  };

  const currentStyle = getStyle(level);

  return (
    <div className="matte-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E3DDD1] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1A211B] font-display">
            {language === 'hi' ? 'फसल तनाव जोखिम सूचकांक' : 'Crop Stress Risk Assessment'}
          </h3>
          <p className="text-[11px] text-[#576258] mt-0.5">
            ICAR Deterministic Rule Engine • Zero Hallucination
          </p>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
        >
          {currentStyle.label} ({score}/100)
        </span>
      </div>

      {/* Progress Metric Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-[#576258] font-medium">
            {language === 'hi' ? 'वर्तमान समग्र संवेदनशीलता' : 'Cumulative Environmental Stress'}
          </span>
          <span className="font-mono font-semibold text-[#1A211B]">{score} / 100</span>
        </div>
        <div className="w-full h-2 bg-[#E3DDD1] rounded-full overflow-hidden">
          <div
            className={`h-full ${currentStyle.barColor} transition-all duration-500`}
            style={{ width: `${Math.max(4, score)}%` }}
          />
        </div>
      </div>

      {/* Agronomic Summary Statement */}
      <div className="p-3.5 rounded bg-[#F8F7F4] border border-[#E3DDD1] text-xs text-[#576258] leading-relaxed">
        {level === 'LOW' ? (
          <p>
            {language === 'hi'
              ? 'वर्तमान तापमान, मृदा नमी और वर्षा मान कपास के फूल व गूलर खिलने के लिए पूर्णतः अनुकूल हैं। किसी निवारक कीटनाशक की आवश्यकता नहीं है।'
              : 'Current thermal units and moisture levels are within optimal tolerance limits for cotton flowering and boll development.'}
          </p>
        ) : (
          <p>
            {language === 'hi'
              ? 'सूक्ष्म-जलवायु पैरामीटर तनाव सीमा के निकट हैं। संस्तुत प्रबंधन प्रोटोकॉल का पालन करें।'
              : 'Environmental metrics are nearing critical agronomic stress thresholds for this crop stage.'}
          </p>
        )}
      </div>

      {/* Triggered Factors Breakdown */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-semibold text-[#576258] uppercase tracking-wider block font-display">
          {language === 'hi' ? 'मूल्यांकित नियम (ICAR-CICR)' : 'Rule Evaluations (ICAR-CICR)'}
        </span>

        {factors.length === 0 ? (
          <div className="flex items-center space-x-2 text-xs text-[#276738] p-2.5 rounded bg-[#EDF6EF] border border-[#276738]/20">
            <ShieldCheck className="w-4 h-4 text-[#276738] flex-shrink-0" />
            <span className="font-medium">
              {language === 'hi'
                ? 'सभी 5 पर्यावरणीय सीमाएं सामान्य स्थिति में हैं।'
                : 'All 5 agronomic threshold rules verified nominal.'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {factors.map((f: any, idx: number) => (
              <div key={idx} className="p-3 rounded border border-[#E3DDD1] bg-[#FFFFFF] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1A211B] flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#995A1E]" />
                    <span>{f.factor_name || f.rule_name || 'Agronomic Parameter'}</span>
                  </span>
                  <span className="text-[10px] font-mono font-medium text-[#576258] uppercase">
                    {f.severity || 'Caution'}
                  </span>
                </div>
                <p className="text-[#576258] pl-5">{f.description || f.advisory_text}</p>
                {f.threshold_breach && (
                  <span className="ml-5 font-mono text-[11px] text-[#1E472D] block">
                    Observed: {f.threshold_breach}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRiskGauge;
