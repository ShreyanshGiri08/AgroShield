import React from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, Activity } from 'lucide-react';

interface CropRiskGaugeProps {
  riskData: any;
  language: string;
}

const t = {
  en: {
    loading: 'Calculating crop risk from ICAR rules...',
    title: 'Crop Environmental Stress Gauge',
    subtitle: 'Derived from ICAR agronomic thresholds & live weather',
    stress: 'Cumulative Environmental Stress:',
    allGood: 'All agronomic conditions are within safe optimal limits.',
    nearLimit: 'Environmental metrics are approaching critical stress thresholds for this growth stage.',
    rules: 'Evaluated ICAR Agronomic Factors:',
    severe: 'Severe Risk',
    high: 'High Risk',
    moderate: 'Moderate Risk',
    low: 'Safe / Nominal',
    observed: 'Observed Metric:',
  },
  hi: {
    loading: 'ICAR नियमों और मौसम के आधार पर जोखिम जांचा जा रहा है...',
    title: 'फसल सुरक्षा व तनाव सूचकांक',
    subtitle: 'ICAR अनुसंधान सीमाएं और सजीव मौसम का सीधा विश्लेषण',
    stress: 'समग्र पर्यावरणीय तनाव:',
    allGood: 'सभी मौसमी पैरामीटर सुरक्षित सीमा में हैं — फसल को अभी कोई खतरा नहीं है।',
    nearLimit: 'मौसम के कुछ मानक तनाव सीमा के पास हैं — फसल पर नज़र रखें।',
    rules: 'जांचे गए प्रमुख कृषि कारण:',
    severe: 'अत्यधिक खतरा',
    high: 'ज़्यादा खतरा',
    moderate: 'मध्यम तनाव',
    low: 'सुरक्षित व सामान्य',
    observed: 'दर्ज किया गया मान:',
  },
};

export const CropRiskGauge: React.FC<CropRiskGaugeProps> = ({ riskData, language }) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  if (!riskData) {
    return (
      <div className="agro-card p-6 text-center text-[#5C4A30] text-sm py-10">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-[#E07B39] animate-spin" />
          <span className="font-bold">{tx.loading}</span>
        </div>
      </div>
    );
  }

  const score = riskData.risk_score || 0;
  const level = riskData.risk_level || 'LOW';
  const factors = riskData.primary_factors || [];

  const styles: Record<string, { text: string; bg: string; border: string; bar: string; label: string }> = {
    SEVERE:   { text: 'text-red-900', bg: 'bg-red-100', border: 'border-red-300', bar: 'bg-[#C0392B]', label: tx.severe },
    HIGH:     { text: 'text-orange-950', bg: 'bg-orange-100', border: 'border-orange-300', bar: 'bg-[#E07B39]', label: tx.high },
    MODERATE: { text: 'text-yellow-950', bg: 'bg-yellow-100', border: 'border-yellow-300', bar: 'bg-[#E09B39]', label: tx.moderate },
    LOW:      { text: 'text-green-950', bg: 'bg-green-100', border: 'border-green-300', bar: 'bg-[#3A7D44]', label: tx.low },
  };
  const s = styles[level] || styles.LOW;

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#241909] flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#E07B39]" />
            <span>{tx.title}</span>
          </h3>
          <p className="text-sm font-semibold text-[#5C4A30] mt-1">{tx.subtitle}</p>
        </div>
        <span className={`text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full border ${s.bg} ${s.text} ${s.border} shadow-sm self-start sm:self-auto`}>
          {s.label} ({score}/100)
        </span>
      </div>

      {/* Numerical Progress Metric */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-baseline text-sm font-extrabold text-[#241909]">
          <span>{tx.stress}</span>
          <span className="text-lg font-black tabular-nums">{score} / 100</span>
        </div>
        <div className="w-full h-3.5 bg-[#E8C99A] rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full ${s.bar} rounded-full transition-all duration-700`}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-bold text-[#5C4A30]">
          <span>{isHi ? 'सुरक्षित (0)' : 'Safe (0)'}</span>
          <span>{isHi ? 'मध्यम (50)' : 'Moderate (50)'}</span>
          <span>{isHi ? 'अत्यधिक खतरा (100)' : 'Danger (100)'}</span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className={`p-4 rounded-xl border-2 text-sm sm:text-base font-bold leading-relaxed shadow-sm ${s.bg} ${s.border} ${s.text}`}>
        {level === 'LOW' ? tx.allGood : tx.nearLimit}
      </div>

      {/* Factors List */}
      <div className="space-y-3">
        <span className="text-xs sm:text-sm font-extrabold text-[#5C4A30] uppercase tracking-wide block">
          {tx.rules}
        </span>
        {factors.length === 0 ? (
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-green-950 p-4 rounded-xl bg-green-50 border border-green-200">
            <ShieldCheck className="w-5 h-5 text-[#3A7D44] flex-shrink-0" />
            <span>{tx.allGood}</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {factors.map((f: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border-2 border-[#E8C99A] bg-[#FEFADC] text-sm space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-[#241909] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#E07B39]" />
                    {f.factor_name || f.rule_name || (isHi ? 'कृषि मानक' : 'Agronomic Factor')}
                  </span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-orange-100 text-[#E07B39] border border-orange-200 uppercase">
                    {f.severity || 'CAUTION'}
                  </span>
                </div>
                <p className="text-[#5C4A30] pl-6 text-xs sm:text-sm font-medium leading-relaxed">
                  {f.description || f.advisory_text}
                </p>
                {f.threshold_breach && (
                  <span className="ml-6 font-mono text-xs font-bold text-[#1E472D] block">
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
