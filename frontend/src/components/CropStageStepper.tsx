import React from 'react';
import { Calendar, CheckCircle, Circle, Clock } from 'lucide-react';

interface CropStageStepperProps {
  cropName: string;
  hindiName?: string;
  sowingDate: string;
  language: string;
}

const allStages: Record<string, Array<{
  name: string; en: string; range: string;
  min: number; max: number; sens: string; sensHi: string;
  guidance: string; guidanceHi: string;
}>> = {
  default: [
    {
      name: 'उगना / अंकुरण', en: 'Seedling', range: '0–25 DAS',
      min: 0, max: 25, sens: 'Moderate', sensHi: 'मध्यम',
      guidance: 'Light watering. Watch for early pests.',
      guidanceHi: 'हल्की सिंचाई रखें। शुरुआती कीड़ों पर नज़र रखें।',
    },
    {
      name: 'वानस्पतिक बढ़वार', en: 'Vegetative', range: '26–50 DAS',
      min: 26, max: 50, sens: 'Moderate', sensHi: 'मध्यम',
      guidance: 'Weed and apply nitrogen as recommended.',
      guidanceHi: 'समय पर खरपतवार निकालें और अनुशंसित मात्रा में यूरिया दें।',
    },
    {
      name: 'फूल व कलियां आना', en: 'Flowering', range: '51–100 DAS',
      min: 51, max: 100, sens: 'Critical', sensHi: 'अति-संवेदनशील',
      guidance: 'Keep moisture steady. Waterlogging causes flower shedding.',
      guidanceHi: 'नमी समान रखें। खेत में पानी न भरने दें।',
    },
    {
      name: 'फल / दाना भराव', en: 'Grain Filling', range: '101–140 DAS',
      min: 101, max: 140, sens: 'High', sensHi: 'उच्च',
      guidance: 'Stop irrigation near harvest. Protect from rain.',
      guidanceHi: 'कटाई से 15 दिन पूर्व सिंचाई बंद करें।',
    },
    {
      name: 'परिपक्वता व कटाई', en: 'Harvest', range: '141–175 DAS',
      min: 141, max: 175, sens: 'Low', sensHi: 'कम',
      guidance: 'Harvest on dry sunny days after morning dew dries.',
      guidanceHi: 'साफ धूप वाले दिन सुबह की ओस सूखने पर कटाई करें।',
    },
  ],
};

export const CropStageStepper: React.FC<CropStageStepperProps> = ({
  cropName,
  hindiName = 'फसल',
  sowingDate,
  language,
}) => {
  const isHi = language === 'hi';
  const sDate = new Date(sowingDate);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));

  const stages = allStages.default;
  const currentIdx = stages.findIndex((s) => diffDays >= s.min && diffDays <= s.max);
  const activeIdx = currentIdx >= 0 ? currentIdx : Math.min(stages.length - 1, Math.floor(diffDays / 35));
  const activeStage = stages[activeIdx];

  const title = isHi
    ? `${hindiName} · ${diffDays} दिन`
    : `${cropName} · ${diffDays} DAS`;

  return (
    <div className="agro-card p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#241909] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E07B39] flex-shrink-0" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-[#5C4A30] mt-0.5">
            {isHi
              ? `बुवाई: ${sowingDate} · ICAR फसल विकास कैलेंडर`
              : `Sown: ${sowingDate} · ICAR Phenological Calendar`}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F3B391] text-[#241909] border border-[#E07B39] self-start sm:self-auto">
          {isHi ? activeStage.name : activeStage.en} · {isHi ? activeStage.sensHi : activeStage.sens}
        </span>
      </div>

      {/* Stage Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {stages.map((stg, i) => {
          const isPassed = i < activeIdx;
          const isCurrent = i === activeIdx;

          return (
            <div
              key={stg.en}
              className={`p-3.5 rounded-xl border-2 transition-colors ${
                isCurrent
                  ? 'bg-[#F3B391] border-[#E07B39]'
                  : isPassed
                  ? 'bg-[#F6D4BA] border-[#E8C99A]'
                  : 'bg-[#FEFADC] border-[#E8C99A] opacity-70'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {isPassed ? (
                  <CheckCircle className="w-4 h-4 text-[#3A7D44] flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 rounded-full bg-[#241909] flex-shrink-0 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-[#B8A080] flex-shrink-0" />
                )}
                <span className={`font-semibold text-sm leading-tight ${
                  isCurrent ? 'text-[#241909]' : isPassed ? 'text-[#3A2A18]' : 'text-[#7A6A50]'
                }`}>
                  {isHi ? stg.name : stg.en}
                </span>
              </div>
              <span className={`text-xs font-mono block ${isCurrent ? 'text-[#3A2A18]' : 'text-[#8A7A60]'}`}>
                {stg.range}
              </span>
              {isCurrent && (
                <span className="inline-block text-xs font-medium text-[#241909] bg-[#FEFADC] px-2 py-0.5 rounded mt-1.5 border border-[#E07B39]">
                  {isHi ? 'अभी' : 'Active'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Guidance */}
      <div className="flex items-start gap-3 bg-[#FFFDF5] border border-[#E8C99A] rounded-xl p-4 text-sm text-[#241909]">
        <Calendar className="w-4 h-4 text-[#E07B39] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-[#241909]">
            {isHi ? 'अभी करें: ' : 'Current recommendation: '}
          </strong>
          <span className="text-[#5C4A30]">
            {isHi ? activeStage.guidanceHi : activeStage.guidance}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CropStageStepper;
