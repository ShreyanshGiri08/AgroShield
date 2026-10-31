import React from 'react';
import { Sprout, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CropStageStepperProps {
  cropName: string;
  hindiName?: string;
  sowingDate: string;
  language: string;
}

export const CropStageStepper: React.FC<CropStageStepperProps> = ({
  cropName,
  hindiName = 'कपास',
  sowingDate,
  language,
}) => {
  const sDate = new Date(sowingDate);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));

  const stages = [
    {
      name: 'अंकुरण व पौध',
      en: 'Seedling',
      range: '0-25 days',
      min: 0,
      max: 25,
      sens: 'Moderate',
      guidance: 'Ensure light irrigation and protect from early sap-sucking pests.',
      guidanceHi: 'हल्की सिंचाई रखें और रस चूसने वाले कीटों से रक्षा करें।',
    },
    {
      name: 'शाखा व कलियां',
      en: 'Squaring',
      range: '26-50 days',
      min: 26,
      max: 50,
      sens: 'Moderate',
      guidance: 'Weeding and nitrogen side-dressing recommended by ICAR.',
      guidanceHi: 'निराई-गुड़ाई करें और नाइट्रोजन की संस्तुत मात्रा दें।',
    },
    {
      name: 'फूल व गूलर बनना',
      en: 'Flowering & Boll',
      range: '51-100 days',
      min: 51,
      max: 100,
      sens: 'Critical',
      guidance: 'Most sensitive phase: avoid moisture stress and monitor for bollworms.',
      guidanceHi: 'सर्वाधिक संवेदनशील अवस्था: नमी की कमी न होने दें व गूलर सुंडी की निगरानी रखें।',
    },
    {
      name: 'गूलर खुलना',
      en: 'Boll Opening',
      range: '101-140 days',
      min: 101,
      max: 140,
      sens: 'Moderate',
      guidance: 'Stop irrigation to prevent boll rotting and promote uniform opening.',
      guidanceHi: 'सिंचाई बंद करें ताकि गूलर सड़न न हो और कपास साफ खुले।',
    },
    {
      name: 'परिपक्वता व चुनाई',
      en: 'Harvest & Picking',
      range: '141-175 days',
      min: 141,
      max: 175,
      sens: 'Low',
      guidance: 'Pick cotton in dry sunny weather after morning dew dries up.',
      guidanceHi: 'सुबह की ओस सूखने के बाद धूप में साफ चुनाई करें।',
    },
  ];

  const currentIdx = stages.findIndex((s) => diffDays >= s.min && diffDays <= s.max);
  const activeIdx = currentIdx >= 0 ? currentIdx : 2;
  const activeStage = stages[activeIdx];

  return (
    <div className="agri-card p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F3B391]/15">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#FEFADC] tracking-tight">
              {language === 'hi' ? `${hindiName} का विकास चक्र` : `${cropName} Phenology Timeline`}
            </h3>
            <p className="text-xs text-[#F6D4BA]/60 font-medium">
              {language === 'hi' ? `बुवाई तिथि: ${sowingDate}` : `Sown on: ${sowingDate}`} •{' '}
              <span className="font-extrabold text-[#F3B391]">
                {diffDays} {language === 'hi' ? 'दिन (DAS)' : 'Days After Sowing'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-[#F3B391] text-[#241909] text-xs font-black px-4 py-1.5 rounded-full flex items-center space-x-2 shadow-[0_0_12px_rgba(243,179,145,0.4)]">
            <span className="w-2 h-2 rounded-full bg-[#241909] animate-ping" />
            <span>{activeStage[language === 'hi' ? 'name' : 'en']}</span>
          </span>
          <span className="bg-amber-950/80 text-amber-300 border border-amber-600/50 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            {activeStage.sens} Sensitivity
          </span>
        </div>
      </div>

      {/* Stepper Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {stages.map((stg, i) => {
          const isPassed = i < activeIdx;
          const isCurrent = i === activeIdx;

          return (
            <div
              key={stg.en}
              className={`p-3.5 rounded-2xl border transition-all duration-300 relative ${
                isCurrent
                  ? 'bg-gradient-to-b from-[#241909] to-[#140D05] border-[#F3B391] ring-2 ring-[#F3B391]/50 shadow-[0_0_20px_rgba(243,179,145,0.25)]'
                  : isPassed
                  ? 'bg-[#0F1108]/60 border-emerald-500/20 opacity-80'
                  : 'bg-[#0F1108]/30 border-dashed border-white/10 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-[#F6D4BA]/50 tracking-wider">
                  Stage 0{i + 1}
                </span>
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F3B391] animate-pulse" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-white/30" />
                )}
              </div>

              <h4 className="text-xs font-black text-white leading-snug">
                {language === 'hi' ? stg.name : stg.en}
              </h4>
              <p className="text-[11px] text-[#F6D4BA]/70 mt-1 font-semibold">{stg.range}</p>

              {isCurrent && (
                <div className="mt-2 pt-2 border-t border-[#F3B391]/30 flex items-center space-x-1 text-[10px] font-black text-[#F3B391]">
                  <span>Active Phase</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Phase ICAR Guidance Callout */}
      <div className="bg-[#0F1108]/70 border border-[#F3B391]/25 rounded-2xl p-4 flex items-start space-x-3 text-xs shadow-inner">
        <AlertCircle className="w-4 h-4 text-[#F3B391] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-white block">
            {language === 'hi' ? 'ICAR विशेष संस्तुति (वर्तमान अवस्था):' : 'ICAR Stage Guidance:'}
          </span>
          <p className="text-[#F6D4BA]/85 mt-0.5 font-medium leading-relaxed">
            {language === 'hi' ? activeStage.guidanceHi : activeStage.guidance}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CropStageStepper;
