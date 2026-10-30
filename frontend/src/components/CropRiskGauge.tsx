import React from 'react';
import { ShieldAlert, AlertOctagon, Info } from 'lucide-react';

interface CropRiskGaugeProps {
  riskData: any;
  language: string;
}

export const CropRiskGauge: React.FC<CropRiskGaugeProps> = ({ riskData, language }) => {
  if (!riskData) {
    return (
      <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-6 text-center text-pitch/60">
        जोखिम विश्लेषण लोड हो रहा है...
      </div>
    );
  }

  const score = riskData.risk_score || 10;
  const level = riskData.risk_level || 'LOW';
  const factors = riskData.primary_factors || [];

  const getStatusColor = (lvl: string) => {
    switch (lvl) {
      case 'SEVERE':
        return { bg: 'bg-agri-danger/10', text: 'text-agri-danger', border: 'border-agri-danger' };
      case 'HIGH':
        return { bg: 'bg-peach/30', text: 'text-peach-dark', border: 'border-peach' };
      case 'MODERATE':
        return { bg: 'bg-sand', text: 'text-coffee', border: 'border-sand-dark' };
      default:
        return { bg: 'bg-agri-safe/10', text: 'text-agri-safe', border: 'border-agri-safe' };
    }
  };

  const statusStyle = getStatusColor(level);

  return (
    <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-sand/60">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-peach-dark" />
          <h3 className="text-lg font-black text-coffee">
            {language === 'hi' ? 'फसल जोखिम स्थिति (डिटर्मिनिस्टिक इंजन)' : 'Crop Risk Assessment (Deterministic)'}
          </h3>
        </div>
        <span
          className={`text-xs font-black px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
        >
          {level} RISK ({score}/100)
        </span>
      </div>

      {/* Score Progress Bar */}
      <div className="my-5">
        <div className="flex justify-between text-xs font-semibold text-pitch/70 mb-1.5">
          <span>{language === 'hi' ? 'जोखिम सूचकांक' : 'Exposure Severity Index'}</span>
          <span>{score} / 100</span>
        </div>
        <div className="w-full h-3 bg-sand/60 rounded-full overflow-hidden p-0.5 border border-sand">
          <div
            className="h-full rounded-full transition-all duration-700 bg-peach-dark"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Triggered Factors */}
      {factors.length > 0 ? (
        <div className="space-y-2 mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-coffee/80 mb-2">
            {language === 'hi' ? 'सक्रिय जोखिम कारक (ICAR नियम)' : 'Active Triggered Agronomic Factors'}
          </h4>
          {factors.map((f: any, idx: number) => (
            <div
              key={idx}
              className="bg-cornsilk border border-sand/80 rounded-xl p-3 text-xs space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-coffee flex items-center space-x-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-peach-dark" />
                  <span>{f.rule_code}</span>
                </span>
                <span className="bg-sand text-coffee text-[10px] font-bold px-2 py-0.5 rounded">
                  {f.observed_value} (कटऑफ: {f.threshold_applied})
                </span>
              </div>
              <p className="text-pitch/80">{f.rationale}</p>
              {f.citation && (
                <p className="text-[10px] text-pitch/50 italic border-t border-sand/40 pt-1">
                  प्रमाण: {f.citation}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-cornsilk border border-sand/60 rounded-xl p-4 text-xs text-center text-pitch/70 flex items-center justify-center space-x-2">
          <Info className="w-4 h-4 text-agri-safe" />
          <span>
            {language === 'hi'
              ? 'वर्तमान मौसम पूर्वानुमान में कोई गंभीर मौसमी खतरा दर्ज नहीं हुआ है।'
              : 'No severe atmospheric hazard triggered for this crop stage.'}
          </span>
        </div>
      )}

      {/* Scientific Limitation Disclosure */}
      <p className="text-[10px] text-pitch/50 mt-4 border-t border-sand/40 pt-2 flex items-center space-x-1">
        <span>सूचना: यह जोखिम गणना ओपन-मेटिओ मौसम डेटा और ICAR मानकों पर आधारित है।</span>
      </p>
    </div>
  );
};
