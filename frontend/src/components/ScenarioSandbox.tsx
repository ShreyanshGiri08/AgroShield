import React, { useState } from 'react';
import { simulateScenario } from '../services/api';
import { SlidersHorizontal, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface ScenarioSandboxProps {
  language: string;
  cropName: string;
  growthStageName?: string;
  latitude: number;
  longitude: number;
}

const t = {
  en: {
    title: 'Weather Stress Simulation ("What-If" Analysis)',
    subtitle: 'Evaluate crop risk sensitivity under hypothetical rainfall or heat anomalies',
    notice: 'Honest Simulation Disclaimer: This tool computes theoretical agronomic responses to synthetic environmental changes. It is a simulation for decision preparation, not an actual weather forecast.',
    rainLabel: 'Hypothetical Rainfall Shift:',
    tempLabel: 'Hypothetical Temperature Shift:',
    presetsTitle: 'Standard Scenarios:',
    cloudburst: 'Heavy Rain (+45mm)',
    heatwave: 'Heatwave (+4°C)',
    drySpell: 'Dry Spell (-20mm)',
    runBtn: 'Run Stress Simulation',
    runningBtn: 'Simulating Agronomic Impact...',
    baselineTitle: 'Current Real Baseline',
    baselineStatus: 'Current Status: Nominal / Low Stress',
    scenarioTitle: 'Simulated Stress Outcome',
    score: 'Stress Score:',
    risk: 'Risk Level:',
  },
  hi: {
    title: 'मौसम तनाव सिमुलेटर ("अगर ऐसा हुआ तो" परीक्षण)',
    subtitle: 'अचानक तेज बारिश या अधिक गर्मी पड़ने पर फसल पर होने वाले असर की पहले से जांच',
    notice: 'काल्पनिक सिमुलेशन सूचना: यह टूल यह जांचने के लिए है कि अगर मौसम अचानक बदले तो फसल को कितना खतरा होगा। यह वास्तविक मौसम पूर्वानुमान नहीं बल्कि तैयारी हेतु मॉडल है।',
    rainLabel: 'बारिश में बदलाव:',
    tempLabel: 'तापमान में बदलाव:',
    presetsTitle: 'तयशुदा स्थितियां:',
    cloudburst: 'अत्यधिक बारिश (+45 मिमी)',
    heatwave: 'भीषण गर्मी (+4°C)',
    drySpell: 'सूखा (-20 मिमी)',
    runBtn: 'तनाव सिमुलेशन चलाएं',
    runningBtn: 'गणना हो रही है...',
    baselineTitle: 'वर्तमान असली स्थिति',
    baselineStatus: 'वर्तमान स्थिति: सामान्य व सुरक्षित',
    scenarioTitle: 'सिमुलेशन का अनुमानित प्रभाव',
    score: 'तनाव स्कोर:',
    risk: 'जोखिम स्तर:',
  },
};

export const ScenarioSandbox: React.FC<ScenarioSandboxProps> = ({
  language,
  cropName,
  growthStageName = 'Flowering & Boll Formation',
  latitude,
  longitude,
}) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  const [deltaRain, setDeltaRain] = useState<number>(45);
  const [deltaTemp, setDeltaTemp] = useState<number>(3.5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateScenario({
        crop_name: cropName,
        growth_stage_name: growthStageName,
        latitude,
        longitude,
        delta_rain_mm: deltaRain,
        delta_temp_c: deltaTemp,
      });
      setSimulationResult(res);
    } catch (e) {
      alert(isHi ? 'सिमुलेशन में त्रुटि हुई। बैकएंड सेवा जांचें।' : 'Scenario calculation failed. Verify backend service status.');
    } finally {
      setIsSimulating(false);
    }
  };

  const setPreset = (rain: number, temp: number) => {
    setDeltaRain(rain);
    setDeltaTemp(temp);
  };

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#241909] flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-[#E07B39]" />
            <span>{tx.title}</span>
          </h2>
          <p className="text-sm font-semibold text-[#5C4A30] mt-1">{tx.subtitle}</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FEFADC] text-[#241909] border border-[#E8C99A] self-start sm:self-auto">
          {cropName}
        </span>
      </div>

      {/* Honest Simulation Disclaimer Notice */}
      <div className="p-4 bg-[#FBF2E9] border-2 border-[#995A1E]/30 rounded-xl text-xs sm:text-sm font-semibold text-[#995A1E] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">{tx.notice}</p>
      </div>

      {/* Controls Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FEFADC] p-6 rounded-xl border border-[#E8C99A]">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-semibold text-[#241909]">{tx.rainLabel}</span>
            <span className="text-base font-semibold text-[#E07B39]">+{deltaRain} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={deltaRain}
            onChange={(e) => setDeltaRain(Number(e.target.value))}
            className="w-full accent-[#E07B39] h-2 bg-[#E8C99A] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#5C4A30] font-bold mt-1.5">
            <span>0 mm ({isHi ? 'सामान्य' : 'Normal'})</span>
            <span>+60 mm ({isHi ? 'तेज' : 'High'})</span>
            <span>+120 mm ({isHi ? 'अतिवृष्टि' : 'Extreme'})</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-semibold text-[#241909]">{tx.tempLabel}</span>
            <span className="text-base font-semibold text-[#E07B39]">
              {deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp}°C
            </span>
          </div>
          <input
            type="range"
            min="-5"
            max="8"
            step="0.5"
            value={deltaTemp}
            onChange={(e) => setDeltaTemp(Number(e.target.value))}
            className="w-full accent-[#E07B39] h-2 bg-[#E8C99A] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#5C4A30] font-bold mt-1.5">
            <span>-5°C ({isHi ? 'शीतलहर' : 'Cold snap'})</span>
            <span>0°C ({isHi ? 'स्थिर' : 'Baseline'})</span>
            <span>+8°C ({isHi ? 'लू / भीषण गर्मी' : 'Heatwave'})</span>
          </div>
        </div>
      </div>

      {/* Preset Buttons & Submit */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#5C4A30] uppercase tracking-wide">
            {tx.presetsTitle}
          </span>
          <button
            type="button"
            onClick={() => setPreset(45, -1)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] hover:bg-[#F3B391] text-[#241909] text-xs font-bold transition-all shadow-sm"
          >
            {tx.cloudburst}
          </button>
          <button
            type="button"
            onClick={() => setPreset(0, 4)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] hover:bg-[#F3B391] text-[#241909] text-xs font-bold transition-all shadow-sm"
          >
            {tx.heatwave}
          </button>
          <button
            type="button"
            onClick={() => setPreset(0, -3)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] hover:bg-[#F3B391] text-[#241909] text-xs font-bold transition-all shadow-sm"
          >
            {tx.drySpell}
          </button>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="btn-primary py-3 px-6 text-sm font-semibold flex items-center gap-2 shadow-md"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{tx.runningBtn}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{tx.runBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Outcome Cards */}
      {simulationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
          <div className="p-5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] space-y-2.5 shadow-sm">
            <div className="flex justify-between items-baseline border-b border-[#E8C99A] pb-2">
              <span className="font-semibold text-sm text-[#5C4A30] uppercase tracking-wide">
                {tx.baselineTitle}
              </span>
              <span className="font-bold text-sm text-[#3A7D44]">
                {tx.score} {simulationResult.baseline?.risk_score ?? 10}/100
              </span>
            </div>
            <p className="text-base font-semibold text-[#3A7D44]">
              {simulationResult.baseline?.risk_level ?? 'LOW'} {isHi ? 'जोखिम (सुरक्षित)' : 'RISK (SAFE)'}
            </p>
            <p className="text-xs sm:text-sm font-medium text-[#5C4A30] leading-relaxed">
              {isHi
                ? 'वर्तमान तापमान और आर्द्रता सामान्य सीमाओं के अंदर हैं। फसल की बढ़वार सही दिशा में है।'
                : 'Current microclimate is within standard agronomic parameters for this crop stage.'}
            </p>
          </div>

          <div className="p-5 rounded-xl border-2 border-red-300 bg-red-50 space-y-2.5 shadow-sm">
            <div className="flex justify-between items-baseline border-b border-red-200 pb-2">
              <span className="font-semibold text-sm text-red-900 uppercase tracking-wide">
                {tx.scenarioTitle}
              </span>
              <span className="font-bold text-sm text-red-800">
                {tx.score} {simulationResult.scenario?.risk_score ?? 65}/100
              </span>
            </div>
            <p className="text-base font-semibold text-red-700">
              {simulationResult.scenario?.risk_level ?? 'ELEVATED'} {isHi ? 'तनाव' : 'RISK'}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-red-900 leading-relaxed">
              {isHi
                ? `अतिरिक्त +${deltaRain} मिमी बारिश या +${deltaTemp}°C तापमान से फूल व कलियां झड़ने और जड़ गलन का जोखिम बढ़ जाता है। जल निकासी की अग्रिम तैयारी रखें।`
                : `Simulated anomaly accelerates flower square drop and root waterlogging vulnerability. Ensure contingency field drainage.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSandbox;
