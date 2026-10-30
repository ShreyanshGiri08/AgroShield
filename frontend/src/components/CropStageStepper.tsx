import React from 'react';
import { Sprout, CheckCircle2, AlertTriangle } from 'lucide-react';

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
  // Compute approximate DAS
  const sDate = new Date(sowingDate);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Sample verified cotton phenology schedule
  const stages = [
    { name: 'अंकुरण व पौध', en: 'Seedling', range: '0-25 days', min: 0, max: 25, sens: 'Moderate' },
    { name: 'शाखा व कलियां', en: 'Squaring', range: '26-50 days', min: 26, max: 50, sens: 'Moderate' },
    { name: 'फूल व गूलर बनना', en: 'Flowering & Boll', range: '51-100 days', min: 51, max: 100, sens: 'Critical' },
    { name: 'गूलर खुलना', en: 'Boll Opening', range: '101-140 days', min: 101, max: 140, sens: 'Low' },
    { name: 'परिपक्वता व चुनाई', en: 'Harvest', range: '141-175 days', min: 141, max: 175, sens: 'Low' },
  ];

  const currentIdx = stages.findIndex((s) => diffDays >= s.min && diffDays <= s.max);
  const activeIdx = currentIdx >= 0 ? currentIdx : 2; // Default to flowering if beyond or edge

  return (
    <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-sand/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-peach/40 flex items-center justify-center text-coffee">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-coffee">
              {language === 'hi' ? `${hindiName} विकास चक्र` : `${cropName} Phenology Stage`}
            </h3>
            <p className="text-xs text-pitch/60">
              {language === 'hi' ? `बुवाई तिथि: ${sowingDate}` : `Sown on: ${sowingDate}`} •{' '}
              <span className="font-bold text-coffee">
                {diffDays} {language === 'hi' ? 'दिन (DAS)' : 'Days After Sowing'}
              </span>
            </p>
          </div>
        </div>
        <span className="bg-coffee text-cornsilk text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-peach animate-ping" />
          <span>{stages[activeIdx][language === 'hi' ? 'name' : 'en']}</span>
        </span>
      </div>

      {/* Stepper bar */}
      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stages.map((stg, i) => {
            const isPassed = i < activeIdx;
            const isCurrent = i === activeIdx;

            return (
              <div
                key={stg.en}
                className={`p-3 rounded-xl border transition ${
                  isCurrent
                    ? 'bg-cornsilk border-peach ring-2 ring-peach/60 shadow-sm'
                    : isPassed
                    ? 'bg-cornsilk/50 border-sand/40 opacity-70'
                    : 'bg-sand/20 border-sand/30 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-pitch/50 tracking-wider">
                    Stage {i + 1}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-agri-safe" />
                  ) : isCurrent ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-peach text-coffee">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="text-xs font-bold text-coffee line-clamp-1">
                  {language === 'hi' ? stg.name : stg.en}
                </p>
                <p className="text-[10px] text-pitch/60 mt-0.5">{stg.range}</p>
                {isCurrent && stg.sens === 'Critical' && (
                  <div className="mt-2 flex items-center space-x-1 text-[10px] font-bold text-agri-warning">
                    <AlertTriangle className="w-3 h-3" />
                    <span>अति संवेदनशील</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
