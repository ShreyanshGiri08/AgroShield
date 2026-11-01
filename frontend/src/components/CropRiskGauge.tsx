import React from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, Activity } from 'lucide-react';

interface CropRiskGaugeProps {
  riskData: any;
  language: string;
}

const t = {
  en: {
    loading: 'Calculating crop risk...',
    title: 'Crop Risk Assessment',
    subtitle: 'ICAR agronomic thresholds & live weather',
    stress: 'Environmental stress score',
    allGood: 'All agronomic conditions are within safe limits.',
    nearLimit: 'Some metrics are approaching critical thresholds for this growth stage.',
    rules: 'Evaluated factors:',
    severe: 'Severe Risk',
    high: 'High Risk',
    moderate: 'Moderate',
    low: 'Safe',
    observed: 'Observed:',
  },
  hi: {
    loading: 'ICAR नियमों के आधार पर जोखिम जांचा जा रहा है...',
    title: 'फसल जोखिम सूचकांक',
    subtitle: 'ICAR सीमाएं और सजीव मौसम',
    stress: 'पर्यावरणीय तनाव स्कोर',
    allGood: 'सभी मौसमी पैरामीटर सुरक्षित सीमा में हैं।',
    nearLimit: 'कुछ मानक तनाव सीमा के पास हैं — फसल पर नज़र रखें।',
    rules: 'जांचे गए कारण:',
    severe: 'अत्यधिक खतरा',
    high: 'ज़्यादा खतरा',
    moderate: 'मध्यम',
    low: 'सुरक्षित',
    observed: 'दर्ज:',
  },
};

export const CropRiskGauge: React.FC<CropRiskGaugeProps> = ({ riskData, language }) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  if (!riskData) {
    return (
      <div className="agro-card p-6 text-center text-[#5C4A30] py-10">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[#E07B39] animate-spin" />
          <span className="text-sm font-medium">{tx.loading}</span>
        </div>
      </div>
    );
  }

  const score = riskData.risk_score || 0;
  const level = riskData.risk_level || 'LOW';
  const factors = riskData.primary_factors || [];

  const styles: Record<string, { text: string; bg: string; border: string; bar: string; label: string }> = {
    SEVERE:   { text: 'text-red-800',    bg: 'bg-red-50',    border: 'border-red-200',    bar: 'bg-[#C0392B]', label: tx.severe },
    HIGH:     { text: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'bg-[#E07B39]', label: tx.high },
    MODERATE: { text: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-[#E09B39]', label: tx.moderate },
    LOW:      { text: 'text-green-800',  bg: 'bg-green-50',  border: 'border-green-200',  bar: 'bg-[#3A7D44]', label: tx.low },
  };
  const s = styles[level] || styles.LOW;

  return (
    <div className="agro-card p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#241909] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#E07B39] flex-shrink-0" />
            <span>{tx.title}</span>
          </h3>
          <p className="text-xs text-[#5C4A30] mt-0.5">{tx.subtitle}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
          {s.label} · {score}/100
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-[#5C4A30]">{tx.stress}</span>
          <span className="text-lg font-bold text-[#241909] tabular-nums">{score}<span className="text-sm font-normal text-[#5C4A30]">/100</span></span>
        </div>
        <div className="w-full h-2.5 bg-[#E8C99A] rounded-full overflow-hidden">
          <div
            className={`h-full ${s.bar} rounded-full transition-all duration-700`}
            style={{ width: `${Math.max(4, score)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#8A7A60]">
          <span>{isHi ? 'सुरक्षित' : 'Safe'}</span>
          <span>{isHi ? 'मध्यम' : 'Moderate'}</span>
          <span>{isHi ? 'खतरा' : 'Danger'}</span>
        </div>
      </div>

      {/* Summary */}
      <div className={`p-3.5 rounded-lg border text-sm font-medium leading-relaxed ${s.bg} ${s.border} ${s.text}`}>
        {level === 'LOW' ? tx.allGood : tx.nearLimit}
      </div>

      {/* Factors */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-[#5C4A30] uppercase tracking-wide block">
          {tx.rules}
        </span>
        {factors.length === 0 ? (
          <div className="flex items-center gap-2.5 text-sm font-medium text-green-800 p-3.5 rounded-lg bg-green-50 border border-green-200">
            <ShieldCheck className="w-4 h-4 text-[#3A7D44] flex-shrink-0" />
            <span>{tx.allGood}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {factors.map((f: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg border border-[#E8C99A] bg-[#FEFADC] text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#241909] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#E07B39] flex-shrink-0" />
                    {f.factor_name || f.rule_name || (isHi ? 'कृषि मानक' : 'Agronomic Factor')}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 flex-shrink-0 uppercase">
                    {f.severity || 'CAUTION'}
                  </span>
                </div>
                <p className="text-[#5C4A30] pl-5 text-xs leading-relaxed">
                  {f.description || f.advisory_text}
                </p>
                {f.threshold_breach && (
                  <span className="ml-5 font-mono text-xs text-[#1E472D] block">
                    {tx.observed} {f.threshold_breach}
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
