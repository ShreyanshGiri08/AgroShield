import React, { useState } from 'react';
import { simulateScenario } from '../services/api';
import { Sliders, AlertTriangle, RefreshCw } from 'lucide-react';

interface ScenarioSandboxProps {
  language: string;
  cropName: string;
  growthStageName?: string;
  latitude: number;
  longitude: number;
}

export const ScenarioSandbox: React.FC<ScenarioSandboxProps> = ({
  language,
  cropName,
  growthStageName = 'Flowering & Boll Formation',
  latitude,
  longitude,
}) => {
  const [deltaRain, setDeltaRain] = useState<number>(35);
  const [deltaTemp, setDeltaTemp] = useState<number>(3);
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
      alert('Simulation failed. Please verify backend connection.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sand/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-peach/40 flex items-center justify-center text-coffee">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-coffee">
              {language === 'hi' ? '"क्या अगर" परिदृश्य सिमुलेटर' : 'Counterfactual "What-If" Sandbox'}
            </h3>
            <p className="text-xs text-pitch/60">
              {language === 'hi' ? 'काल्पनिक मौसम परिवर्तनों पर फसल जोखिम की अग्रिम जांच' : 'Simulate weather anomalies on deterministic risk engine'}
            </p>
          </div>
        </div>
        <span className="bg-peach/30 border border-peach text-coffee text-[10px] font-bold px-2.5 py-1 rounded-full">
          Hypothetical Sandbox
        </span>
      </div>

      {/* Prominent Hypothetical Notice */}
      <div className="my-4 p-3 bg-agri-warning/10 border border-agri-warning/30 rounded-xl text-xs text-agri-warning flex items-start space-x-2 font-medium">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          स्पष्ट सूचना: यह एक काल्पनिक परिदृश्य विश्लेषण है, वास्तविक मौसम पूर्वानुमान नहीं। यह आपको असामान्य मौसम में फसल की संवेदनशीलता समझने में मदद करता है।
        </span>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 bg-cornsilk border border-sand/60 rounded-2xl p-5">
        {/* Rainfall Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-coffee">
            <span>{language === 'hi' ? 'अतिरिक्त वर्षा (Rainfall Delta)' : 'Additional Rainfall'}</span>
            <span className="bg-peach text-coffee px-2 py-0.5 rounded font-black">
              {deltaRain > 0 ? `+${deltaRain}` : deltaRain} mm
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="80"
            step="5"
            value={deltaRain}
            onChange={(e) => setDeltaRain(Number(e.target.value))}
            className="w-full accent-peach cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-pitch/50">
            <span>-30 mm (सूखा)</span>
            <span>0 mm</span>
            <span>+80 mm (अत्यधिक भारी वर्षा)</span>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-coffee">
            <span>{language === 'hi' ? 'तापमान में बदलाव (Temperature Delta)' : 'Temperature Delta'}</span>
            <span className="bg-peach text-coffee px-2 py-0.5 rounded font-black">
              {deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp}°C
            </span>
          </div>
          <input
            type="range"
            min="-5"
            max="10"
            step="1"
            value={deltaTemp}
            onChange={(e) => setDeltaTemp(Number(e.target.value))}
            className="w-full accent-peach cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-pitch/50">
            <span>-5°C (ठंड)</span>
            <span>0°C</span>
            <span>+10°C (लू / अत्यधिक गर्मी)</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="bg-peach hover:bg-peach-dark text-coffee font-black px-6 py-2.5 rounded-xl transition flex items-center space-x-2 text-xs shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{language === 'hi' ? 'परिदृश्य जोखिम की गणना करें' : 'Recalculate Scenario Risk'}</span>
        </button>
      </div>

      {/* Comparison Results */}
      {simulationResult && (
        <div className="space-y-4 pt-4 border-t border-sand/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-coffee mb-2">
            तुलनात्मक विश्लेषण (Baseline vs Simulated Scenario)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Baseline Card */}
            <div className="bg-cornsilk border border-sand/80 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-pitch/50 uppercase">वास्तविक आधार (Baseline)</span>
              <p className="text-2xl font-black text-coffee mt-1">
                {simulationResult.baseline?.risk_score}
                <span className="text-xs font-medium text-pitch/60">/100</span>
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-sand text-coffee">
                {simulationResult.baseline?.risk_level}
              </span>
            </div>

            {/* Delta Indicator */}
            <div className="bg-sand/30 border border-sand/60 rounded-xl p-4 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-pitch/50 uppercase">जोखिम बदलाव (Delta)</span>
              <p
                className={`text-2xl font-black mt-1 ${
                  simulationResult.risk_delta_score > 0 ? 'text-agri-danger' : 'text-agri-safe'
                }`}
              >
                {simulationResult.risk_delta_score > 0
                  ? `+${simulationResult.risk_delta_score}`
                  : simulationResult.risk_delta_score}
              </p>
              <span className="text-[10px] text-pitch/60">अंकों का अंतर</span>
            </div>

            {/* Scenario Card */}
            <div className="bg-cornsilk border-2 border-peach rounded-xl p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-peach-dark uppercase">काल्पनिक परिदृश्य (Scenario)</span>
              <p className="text-2xl font-black text-coffee mt-1">
                {simulationResult.scenario?.risk_score}
                <span className="text-xs font-medium text-pitch/60">/100</span>
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-peach text-coffee">
                {simulationResult.scenario?.risk_level}
              </span>
            </div>
          </div>

          {/* Triggered Factors in Scenario */}
          {simulationResult.scenario?.primary_factors?.length > 0 && (
            <div className="bg-cornsilk border border-sand/60 rounded-xl p-3.5 mt-3 space-y-2">
              <span className="text-[11px] font-bold text-coffee block">
                इस काल्पनिक बदलाव से सक्रिय हुए नए खतरे:
              </span>
              {simulationResult.scenario.primary_factors.map((f: any, i: number) => (
                <div key={i} className="text-xs text-pitch/80 flex items-start space-x-2">
                  <span className="text-peach-dark font-bold">•</span>
                  <span>{f.rationale} ({f.citation})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
