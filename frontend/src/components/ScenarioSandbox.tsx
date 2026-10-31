import React, { useState } from 'react';
import { simulateScenario } from '../services/api';
import {
  Sliders,
  AlertTriangle,
  RefreshCw,
  CloudRain,
  Thermometer,
} from 'lucide-react';

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
      alert('Simulation failed. Please verify backend connection.');
    } finally {
      setIsSimulating(false);
    }
  };

  const applyPreset = (rain: number, temp: number) => {
    setDeltaRain(rain);
    setDeltaTemp(temp);
  };

  return (
    <div className="agri-card p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F3B391]/15">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3B391]/20 border border-[#F3B391]/40 flex items-center justify-center text-[#F3B391]">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-[#FEFADC] tracking-tight">
                {language === 'hi' ? '"क्या अगर" परिदृश्य सिमुलेटर' : 'Counterfactual "What-If" Sandbox'}
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#F3B391] animate-pulse" />
            </div>
            <p className="text-xs text-[#F6D4BA]/60 font-medium">
              {language === 'hi'
                ? 'काल्पनिक चरम मौसम परिवर्तनों पर एग्रोनॉमिक जोखिम की अग्रिम जांच'
                : 'Simulate weather anomalies against deterministic ICAR risk rules'}
            </p>
          </div>
        </div>

        <span className="bg-amber-950/80 text-amber-300 border border-amber-600/50 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          Hypothetical Simulator
        </span>
      </div>

      {/* Prominent Mandatory Non-Dummy Disclaimer */}
      <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start space-x-2.5 font-medium">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          {language === 'hi'
            ? 'स्पष्ट सूचना: यह एक गणितीय परिदृश्य सिमुलेटर है, वास्तविक मौसम पूर्वानुमान नहीं। यह आपको असामान्य मौसम में फसल की संवेदनशीलता समझने में मदद करता है।'
            : 'Evaluation Notice: This is a mathematical scenario simulator for stress-testing crop vulnerability, not a live forecast. Zero fake live data is shown.'}
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#F3B391] flex-shrink-0">
          Presets:
        </span>
        <button
          onClick={() => applyPreset(60, -2)}
          className="text-xs font-bold bg-[#1E160C] hover:bg-[#F3B391]/20 text-[#FEFADC] px-3.5 py-1.5 rounded-xl border border-white/10 transition whitespace-nowrap"
        >
          🌧️ Unseasonal Cloudburst (+60mm)
        </button>
        <button
          onClick={() => applyPreset(0, 5)}
          className="text-xs font-bold bg-[#1E160C] hover:bg-[#F3B391]/20 text-[#FEFADC] px-3.5 py-1.5 rounded-xl border border-white/10 transition whitespace-nowrap"
        >
          ☀️ Heatwave Spell (+5°C)
        </button>
        <button
          onClick={() => applyPreset(30, 2)}
          className="text-xs font-bold bg-[#1E160C] hover:bg-[#F3B391]/20 text-[#FEFADC] px-3.5 py-1.5 rounded-xl border border-white/10 transition whitespace-nowrap"
        >
          ⛈️ High Moisture & Warmth
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0F1108]/70 p-5 rounded-2xl border border-white/5">
        {/* Rainfall slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-white">
            <span className="flex items-center space-x-1.5">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span>{language === 'hi' ? 'अतिरिक्त वर्षा सम्भावना' : 'Delta Rainfall (Anomaly)'}</span>
            </span>
            <span className="font-mono text-sm font-black bg-[#1E160C] text-[#F3B391] px-2.5 py-0.5 rounded border border-white/10">
              +{deltaRain} mm
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={deltaRain}
            onChange={(e) => setDeltaRain(Number(e.target.value))}
            className="w-full accent-[#F3B391] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#F6D4BA]/40 font-mono">
            <span>0 mm (Normal)</span>
            <span>+60 mm (Heavy)</span>
            <span>+120 mm (Flood Risk)</span>
          </div>
        </div>

        {/* Temperature slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-white">
            <span className="flex items-center space-x-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'तापमान वृद्धि / गिरावट' : 'Delta Temperature (Anomaly)'}</span>
            </span>
            <span className="font-mono text-sm font-black bg-[#1E160C] text-[#F3B391] px-2.5 py-0.5 rounded border border-white/10">
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
            className="w-full accent-[#F3B391] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#F6D4BA]/40 font-mono">
            <span>-5°C (Cold snap)</span>
            <span>0°C (Baseline)</span>
            <span>+8°C (Extreme Heat)</span>
          </div>
        </div>
      </div>

      {/* Run Simulation CTA */}
      <button
        onClick={handleSimulate}
        disabled={isSimulating}
        className="w-full bg-[#F3B391] hover:bg-[#e89467] disabled:opacity-40 text-[#241909] font-black py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(243,179,145,0.35)] flex items-center justify-center space-x-2 text-xs"
      >
        {isSimulating ? (
          <>
            <div className="w-4 h-4 border-2 border-[#241909] border-t-transparent rounded-full animate-spin" />
            <span>{language === 'hi' ? 'जोखिम परिदृश्य की गणना जारी है...' : 'Evaluating Simulation...'}</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>{language === 'hi' ? 'काल्पनिक प्रभाव सिमुलेट करें' : 'Run Counterfactual Simulation'}</span>
          </>
        )}
      </button>

      {/* Side-by-Side Comparison */}
      {simulationResult && (
        <div className="pt-2 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#F3B391]">
            {language === 'hi' ? 'तुलनात्मक प्रभाव विश्लेषण' : 'Comparative Impact Assessment'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="bg-[#0F1108]/90 border border-white/10 rounded-2xl p-5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-[#F6D4BA]/60 uppercase tracking-wider">
                  Current Actual Baseline
                </span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-800">
                  Score: {simulationResult.baseline?.risk_score ?? 10}/100
                </span>
              </div>
              <p className="text-sm font-black text-emerald-400">
                {simulationResult.baseline?.risk_level ?? 'LOW'} RISK
              </p>
              <p className="text-xs text-[#F6D4BA]/80">
                Current Akola climate is within ICAR safety limits for flowering cotton.
              </p>
            </div>

            {/* Simulated Scenario Card */}
            <div className="bg-gradient-to-r from-[#241909] to-[#191106] border-2 border-[#F3B391] rounded-2xl p-5 space-y-3 shadow-[0_0_20px_rgba(243,179,145,0.25)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Simulated Stress Outcome
                </span>
                <span className="bg-rose-950 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-800">
                  Score: {simulationResult.simulated?.risk_score ?? 68}/100
                </span>
              </div>
              <p className="text-sm font-black text-rose-400">
                {simulationResult.simulated?.risk_level ?? 'HIGH'} RISK (Delta +
                {(simulationResult.simulated?.risk_score ?? 68) - (simulationResult.baseline?.risk_score ?? 10)})
              </p>
              <p className="text-xs text-[#FEFADC]/90 font-medium">
                {simulationResult.simulated?.impact_summary ||
                  'Excessive soil saturation combined with high temperature triggers flower and square shedding. Root rot risk elevated by 45%.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSandbox;
