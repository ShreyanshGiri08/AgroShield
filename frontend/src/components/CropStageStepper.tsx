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
      min: 0, max: 25, sens: 'Moderate', sensHi: 'मध्यम संवेदनशीलता',
      guidance: 'Light watering. Watch for early pests.',
      guidanceHi: 'हल्की सिंचाई रखें। शुरुआती रस चूसने वाले कीड़ों पर नज़र रखें।',
    },
    {
      name: 'वानस्पतिक बढ़वार', en: 'Vegetative', range: '26–50 DAS',
      min: 26, max: 50, sens: 'Moderate', sensHi: 'मध्यम संवेदनशीलता',
      guidance: 'Weed and apply nitrogen as recommended.',
      guidanceHi: 'समय पर खरपतवार निकालें और अनुशंसित मात्रा में यूरिया/खाद दें।',
    },
    {
      name: 'फूल व कलियां आना', en: 'Flowering & Square', range: '51–100 DAS',
      min: 51, max: 100, sens: 'Critical', sensHi: 'अति-संवेदनशील अवस्था',
      guidance: 'Keep moisture steady. Waterlogging causes flower shedding.',
      guidanceHi: 'नमी समान रखें। खेत में पानी न भरने दें वरना फूल और कलियां झड़ने लगेंगी।',
    },
    {
      name: 'फल / दाना भराव', en: 'Boll/Grain Filling', range: '101–140 DAS',
      min: 101, max: 140, sens: 'High', sensHi: 'उच्च संवेदनशीलता',
      guidance: 'Stop irrigation near harvest. Protect from rain.',
      guidanceHi: 'कटाई से 15 दिन पूर्व सिंचाई बंद करें। अत्यधिक नमी से फसल को बचाएं।',
    },
    {
      name: 'परिपक्वता व कटाई', en: 'Harvest Maturity', range: '141–175 DAS',
      min: 141, max: 175, sens: 'Low', sensHi: 'कम संवेदनशीलता',
      guidance: 'Harvest on dry sunny days after morning dew dries.',
      guidanceHi: 'साफ धूप वाले दिन, सुबह की ओस सूखने के पश्चात ही कटाई व चुगाई करें।',
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
    ? `${hindiName} की अवस्था (${diffDays} दिन पूर्ण)`
    : `${cropName} Phenological Growth Stage (${diffDays} DAS)`;

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[#241909] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E07B39]" />
            <span>{title}</span>
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#5C4A30] mt-1">
            {isHi
              ? `बुवाई तिथि: ${sowingDate} • ICAR प्रमाणित फसल विकास कैलेंडर`
              : `Sowing Date: ${sowingDate} • ICAR Phenological Growth Calendar`}
          </p>
        </div>
        <span className="text-xs sm:text-sm font-black px-4 py-2 rounded-xl bg-[#F3B391] text-[#241909] border border-[#E07B39] shadow-sm self-start sm:self-auto">
          {isHi ? activeStage.name : activeStage.en}
          {' '}• {isHi ? activeStage.sensHi : activeStage.sens}
        </span>
      </div>

      {/* Stage Stepper Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {stages.map((stg, i) => {
          const isPassed = i < activeIdx;
          const isCurrent = i === activeIdx;

          return (
            <div
              key={stg.en}
              className={`p-4 rounded-2xl border-2 transition-all ${
                isCurrent
                  ? 'bg-[#F3B391] border-[#E07B39] shadow-md scale-[1.02]'
                  : isPassed
                  ? 'bg-[#F6D4BA] border-[#E8C99A]'
                  : 'bg-[#FEFADC] border-[#E8C99A] opacity-75'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isPassed ? (
                  <CheckCircle className="w-4 h-4 text-[#3A7D44] flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-[#241909] flex-shrink-0 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-[#B8A080] flex-shrink-0" />
                )}
                <span className={`font-black text-sm sm:text-base leading-tight ${
                  isCurrent ? 'text-[#241909]' : isPassed ? 'text-[#241909]' : 'text-[#5C4A30]'
                }`}>
                  {isHi ? stg.name : stg.en}
                </span>
              </div>
              <span className={`text-xs font-mono font-bold block ${isCurrent ? 'text-[#241909]' : 'text-[#5C4A30]'}`}>
                {stg.range}
              </span>
              {isCurrent && (
                <span className="inline-block text-xs font-black text-[#241909] bg-[#FEFADC] px-2.5 py-1 rounded-md mt-2 border border-[#E07B39]">
                  {isHi ? 'वर्तमान अवस्था' : 'Active Stage'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Guidance Callout */}
      <div className="flex items-start gap-3.5 bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-2xl p-5 text-sm sm:text-base text-[#241909] shadow-sm">
        <Calendar className="w-5 h-5 text-[#E07B39] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#241909] font-black">
            {isHi ? 'इस अवस्था के लिए मुख्य सलाह: ' : 'Recommended Action for Current Stage: '}
          </strong>
          <span className="font-semibold text-[#5C4A30]">
            {isHi ? activeStage.guidanceHi : activeStage.guidance}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CropStageStepper;
