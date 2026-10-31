import React from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';

interface CropStageStepperProps {
  cropName: string;
  hindiName?: string;
  sowingDate: string;
  language: string;
}

// Bilingual crop stage data with simple Hindi
const allStages: Record<string, Array<{
  name: string; en: string; range: string;
  min: number; max: number; sens: string; sensHi: string;
  guidance: string; guidanceHi: string;
}>> = {
  default: [
    {
      name: 'उगना', en: 'Seedling', range: '0–25 DAS',
      min: 0, max: 25, sens: 'Moderate', sensHi: 'मध्यम',
      guidance: 'Light watering. Watch for early pests.',
      guidanceHi: 'थोड़ा पानी दें। शुरुआती कीड़ों पर नज़र रखें।',
    },
    {
      name: 'बढ़वार', en: 'Vegetative', range: '26–50 DAS',
      min: 26, max: 50, sens: 'Moderate', sensHi: 'मध्यम',
      guidance: 'Weed and apply nitrogen as recommended.',
      guidanceHi: 'खरपतवार हटाएं और खाद दें।',
    },
    {
      name: 'फूल आना', en: 'Flowering', range: '51–100 DAS',
      min: 51, max: 100, sens: 'Critical', sensHi: 'ज़रूरी',
      guidance: 'Keep moisture steady. Watch for bollworm.',
      guidanceHi: 'नमी बनाए रखें। गूलर सुंडी पर ध्यान दें।',
    },
    {
      name: 'फल पकना', en: 'Boll/Grain Filling', range: '101–140 DAS',
      min: 101, max: 140, sens: 'High', sensHi: 'ज़्यादा',
      guidance: 'Stop irrigation near harvest. Protect from rain.',
      guidanceHi: 'कटाई से पहले पानी बंद करें। बारिश से बचाएं।',
    },
    {
      name: 'कटाई', en: 'Harvest', range: '141–175 DAS',
      min: 141, max: 175, sens: 'Low', sensHi: 'कम',
      guidance: 'Harvest on dry sunny days after morning dew dries.',
      guidanceHi: 'धूप में, ओस सूखने के बाद कटाई करें।',
    },
  ],
};

export const CropStageStepper: React.FC<CropStageStepperProps> = ({
  cropName,
  hindiName = 'फसल',
  sowingDate,
  language,
}) => {
  const sDate = new Date(sowingDate);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));

  const stages = allStages.default;
  const currentIdx = stages.findIndex((s) => diffDays >= s.min && diffDays <= s.max);
  const activeIdx = currentIdx >= 0 ? currentIdx : Math.min(stages.length - 1, Math.floor(diffDays / 35));
  const activeStage = stages[activeIdx];

  const title = language === 'hi'
    ? `${hindiName} की अवस्था (${diffDays} दिन)`
    : `${cropName} Growth Stage (${diffDays} DAS)`;

  return (
    <div className="agro-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8C99A] pb-3">
        <div>
          <h3 className="text-base font-bold text-[#241909]">{title}</h3>
          <p className="text-xs text-[#5C4A30] mt-0.5">
            {language === 'hi'
              ? `बुवाई: ${sowingDate} • ICAR फसल कैलेंडर`
              : `Sown: ${sowingDate} • ICAR Crop Calendar`}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#F3B391] text-[#241909] border border-[#E07B39]">
          {language === 'hi' ? activeStage.name : activeStage.en}
          {' '}• {language === 'hi' ? activeStage.sensHi : activeStage.sens}
        </span>
      </div>

      {/* Stage Stepper */}
      <div className="flex flex-col sm:flex-row gap-2">
        {stages.map((stg, i) => {
          const isPassed = i < activeIdx;
          const isCurrent = i === activeIdx;

          return (
            <div key={stg.en} className="flex-1 relative">
              {/* Connector line */}
              {i < stages.length - 1 && (
                <div className={`hidden sm:block absolute top-4 left-[calc(50%+16px)] right-[-calc(50%-16px)] h-0.5 z-0 ${
                  isPassed || isCurrent ? 'bg-[#F3B391]' : 'bg-[#E8C99A]'
                }`} style={{ width: 'calc(100% - 32px)', left: '50%' }} />
              )}

              <div className={`relative z-10 p-3 rounded-xl border text-xs transition-all ${
                isCurrent
                  ? 'bg-[#F3B391] border-[#E07B39] shadow-md'
                  : isPassed
                  ? 'bg-[#F6D4BA] border-[#E8C99A]'
                  : 'bg-[#FEFADC] border-[#E8C99A]'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {isPassed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-[#3A7D44] flex-shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#241909] flex-shrink-0 animate-pulse" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#E8C99A] flex-shrink-0" />
                  )}
                  <span className={`font-bold text-xs ${
                    isCurrent ? 'text-[#241909]' : isPassed ? 'text-[#5C4A30]' : 'text-[#B8A080]'
                  }`}>
                    {language === 'hi' ? stg.name : stg.en}
                  </span>
                </div>
                <span className={`text-[10px] font-mono ${isCurrent ? 'text-[#5C4A30]' : 'text-[#B8A080]'}`}>
                  {stg.range}
                </span>
                {isCurrent && (
                  <span className="block text-[10px] font-bold text-[#241909] mt-1">
                    {language === 'hi' ? '← अभी यहाँ' : '← Current'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidance callout */}
      <div className="flex items-start gap-3 bg-[#FEFADC] border border-[#E8C99A] rounded-xl p-4 text-sm text-[#5C4A30]">
        <Calendar className="w-4 h-4 text-[#E07B39] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#241909]">
            {language === 'hi' ? 'इस समय करें: ' : 'Action Now: '}
          </span>
          {language === 'hi' ? activeStage.guidanceHi : activeStage.guidance}
        </div>
      </div>
    </div>
  );
};

export default CropStageStepper;
