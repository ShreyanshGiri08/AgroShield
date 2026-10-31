import React from 'react';
import { Calendar } from 'lucide-react';

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
      range: '0–25 DAS',
      min: 0,
      max: 25,
      sens: 'Moderate',
      guidance: 'Light irrigation; monitor early sap-sucking pests.',
      guidanceHi: 'हल्की सिंचाई रखें; रस चूसने वाले कीटों की निगरानी करें।',
    },
    {
      name: 'शाखा व कलियां',
      en: 'Squaring',
      range: '26–50 DAS',
      min: 26,
      max: 50,
      sens: 'Moderate',
      guidance: 'Interculture weeding and recommended nitrogen application.',
      guidanceHi: 'निराई-गुड़ाई करें और संस्तुत नाइट्रोजन दें।',
    },
    {
      name: 'फूल व गूलर बनना',
      en: 'Flowering & Boll',
      range: '51–100 DAS',
      min: 51,
      max: 100,
      sens: 'Critical',
      guidance: 'Avoid moisture stress; monitor for pink bollworm infestation.',
      guidanceHi: 'नमी की कमी न होने दें; गूलर सुंडी की निगरानी रखें।',
    },
    {
      name: 'गूलर खुलना',
      en: 'Boll Opening',
      range: '101–140 DAS',
      min: 101,
      max: 140,
      sens: 'Moderate',
      guidance: 'Cease irrigation to prevent rotting and ensure clean fiber.',
      guidanceHi: 'सिंचाई बंद करें ताकि गूलर सड़न न हो और रेशा साफ रहे।',
    },
    {
      name: 'परिपक्वता व चुनाई',
      en: 'Harvest & Picking',
      range: '141–175 DAS',
      min: 141,
      max: 175,
      sens: 'Low',
      guidance: 'Pick after morning dew dries up under clear sunlight.',
      guidanceHi: 'सुबह की ओस सूखने के बाद धूप में साफ चुनाई करें।',
    },
  ];

  const currentIdx = stages.findIndex((s) => diffDays >= s.min && diffDays <= s.max);
  const activeIdx = currentIdx >= 0 ? currentIdx : 2;
  const activeStage = stages[activeIdx];

  return (
    <div className="matte-panel p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E3DDD1] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1A211B] font-display">
            {language === 'hi' ? `${hindiName} का फिनोलॉजिकल विकास चक्र` : `${cropName} Phenological Growth Timeline`}
          </h3>
          <p className="text-[11px] text-[#576258] mt-0.5">
            ICAR-CICR Crop Calendar • Sown: {sowingDate} ({diffDays} Days After Sowing)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#1E472D] text-[#F8F7F4]">
            {activeStage[language === 'hi' ? 'name' : 'en']}
          </span>
          <span className="text-[11px] font-mono text-[#576258]">
            {activeStage.sens} Sensitivity
          </span>
        </div>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {stages.map((stg, i) => {
          const isPassed = i < activeIdx;
          const isCurrent = i === activeIdx;

          return (
            <div
              key={stg.en}
              className={`p-3 rounded border text-xs transition-colors ${
                isCurrent
                  ? 'bg-[#EBF3EC] border-[#1E472D] shadow-sm'
                  : isPassed
                  ? 'bg-[#FFFFFF] border-[#E3DDD1] text-[#576258]'
                  : 'bg-[#F8F7F4] border-[#E3DDD1] text-[#859286]'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono text-[#859286] mb-1">
                <span>Phase 0{i + 1}</span>
                <span>{stg.range}</span>
              </div>
              <span className={`font-semibold block ${isCurrent ? 'text-[#1E472D]' : 'text-[#1A211B]'}`}>
                {language === 'hi' ? stg.name : stg.en}
              </span>
              {isCurrent && (
                <span className="text-[10px] text-[#1E472D] font-medium block mt-1">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Guidance Callout */}
      <div className="text-xs text-[#576258] bg-[#F8F7F4] p-3 rounded border border-[#E3DDD1] flex items-start space-x-2">
        <Calendar className="w-4 h-4 text-[#1E472D] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#1A211B]">
            {language === 'hi' ? 'वर्तमान अवस्था हेतु प्रबंधन निर्देश:' : 'Management Guidance for Current Stage:'}{' '}
          </span>
          <span>{language === 'hi' ? activeStage.guidanceHi : activeStage.guidance}</span>
        </div>
      </div>
    </div>
  );
};

export default CropStageStepper;
