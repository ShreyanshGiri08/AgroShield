import React from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, SlidersHorizontal } from 'lucide-react';

interface CropRiskGaugeProps {
  riskData: any;
  language: string;
}

export const CropRiskGauge: React.FC<CropRiskGaugeProps> = ({ riskData, language }) => {
  if (!riskData) {
    return (
      <div className="agri-card p-8 text-center text-[#FEFADC]/60 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#F3B391] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">
          {language === 'hi'
            ? 'ICAR नियमों पर आधारित फसल जोखिम की गणना हो रही है...'
            : 'Evaluating deterministic agronomic rules...'}
        </p>
      </div>
    );
  }

  const score = riskData.risk_score || 0;
  const level = riskData.risk_level || 'LOW';
  const factors = riskData.primary_factors || [];

  const getTheme = (lvl: string) => {
    switch (lvl) {
      case 'SEVERE':
        return {
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-950/60',
          borderColor: 'border-rose-500/50',
          gaugeColor: '#f43f5e',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
          label: language === 'hi' ? 'गंभीर जोखिम' : 'Severe Risk',
        };
      case 'HIGH':
        return {
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-950/60',
          borderColor: 'border-amber-500/50',
          gaugeColor: '#f59e0b',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
          label: language === 'hi' ? 'उच्च जोखिम' : 'High Risk',
        };
      case 'MODERATE':
        return {
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-950/60',
          borderColor: 'border-yellow-500/50',
          gaugeColor: '#eab308',
          glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]',
          label: language === 'hi' ? 'मध्यम जोखिम' : 'Moderate Risk',
        };
      default:
        return {
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-950/60',
          borderColor: 'border-emerald-500/50',
          gaugeColor: '#10b981',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
          label: language === 'hi' ? 'सुरक्षित स्थिति' : 'Optimal Safety',
        };
    }
  };

  const theme = getTheme(level);

  return (
    <div className="agri-card p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F3B391]/15">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F3B391]/20 border border-[#F3B391]/40 flex items-center justify-center text-[#F3B391]">
            <ShieldAlert className="w-5 h-5 text-[#F3B391]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#FEFADC] tracking-tight">
              {language === 'hi' ? 'फसल जोखिम स्थिति' : 'Crop Risk Assessment'}
            </h3>
            <p className="text-xs text-[#F6D4BA]/60">
              {language === 'hi' ? 'डिटर्मिनिस्टिक एग्रोनॉमिक इंजन' : 'Deterministic Rule Engine (Zero Hallucination)'}
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${theme.bgColor} ${theme.textColor} ${theme.borderColor} ${theme.glow}`}
        >
          {theme.label} ({score}/100)
        </span>
      </div>

      {/* Radial Semi-Gauge & Score Display */}
      <div className="bg-gradient-to-r from-[#241909]/90 to-[#191106]/95 border border-[#F3B391]/25 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-6">
          {/* Custom SVG Arc Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#241909"
                strokeWidth="9"
                fill="none"
              />
              {/* Animated Value Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={theme.gaugeColor}
                strokeWidth="9"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 6px ${theme.gaugeColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white font-mono leading-none">{score}</span>
              <span className="text-[10px] font-bold text-[#F3B391] uppercase mt-0.5">Index</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-black text-white block">
              {level === 'LOW'
                ? language === 'hi' ? 'अनुकूल मौसम विंडो' : 'Favorable Agronomic Window'
                : language === 'hi' ? 'सतर्कता की आवश्यकता' : 'Precautionary Measures Required'}
            </span>
            <p className="text-xs text-[#F6D4BA]/80 max-w-sm font-medium">
              {level === 'LOW'
                ? language === 'hi'
                  ? 'वर्तमान तापमान और आर्द्रता कपास के फूल खिलने के लिए पूर्णतः अनुकूल हैं। कोई कीटनाशक छिड़काव व्यर्थ न करें।'
                  : 'Current temperature and moisture are within optimal ICAR limits for cotton flowering stage.'
                : language === 'hi'
                  ? 'मौसम में नमी या तापमान में विचलन देखा गया है। नीचे दिए गए ICAR सुझावों का पालन करें।'
                  : 'Deviations from ICAR thresholds detected. Review preventative actions below.'}
            </p>
          </div>
        </div>

        {/* Engine specs badge */}
        <div className="text-right w-full sm:w-auto bg-[#0F1108]/70 p-3.5 rounded-xl border border-white/10 shadow-inner">
          <div className="flex items-center sm:justify-end space-x-1.5 text-[11px] font-bold text-[#F3B391]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ICAR-CICR Rules</span>
          </div>
          <span className="text-xs font-black text-white block mt-0.5">
            {factors.length} {language === 'hi' ? 'सक्रिय नियम' : 'Rules Monitored'}
          </span>
        </div>
      </div>

      {/* Triggered Factors / Agronomic Threshold Rules */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#F3B391] flex items-center justify-between">
          <span>{language === 'hi' ? 'ICAR नियम विश्लेषण व अलर्ट' : 'ICAR Rule Breakdown & Alerts'}</span>
          <span className="text-[10px] text-emerald-400 font-semibold font-mono">Zero Hallucination</span>
        </h4>

        {factors.length === 0 ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">
              {language === 'hi'
                ? 'सभी 5 मौसमी पैरामीटर (तापमान, वर्षा, आर्द्रता, वायु वेग) सामान्य सुरक्षित सीमा में हैं।'
                : 'All 5 environmental parameters are well within safe thresholds for this growth stage.'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {factors.map((f: any, idx: number) => (
              <div
                key={idx}
                className="bg-[#0F1108]/70 border border-amber-500/30 rounded-xl p-3.5 text-xs space-y-1.5 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertOctagon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="font-black text-white">{f.factor_name || f.rule_name || 'Agronomic Factor'}</span>
                  </div>
                  <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {f.severity || 'ATTENTION'}
                  </span>
                </div>
                <p className="text-[#F6D4BA]/80 pl-6 font-medium">
                  {f.description || f.advisory_text || 'Parameters observed nearing stress threshold.'}
                </p>
                {f.threshold_breach && (
                  <div className="ml-6 mt-1 text-[11px] text-[#F3B391] font-mono bg-[#1E160C] px-2 py-1 rounded inline-block border border-white/5">
                    {f.threshold_breach}
                  </div>
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
