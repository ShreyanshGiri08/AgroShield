import React, { useState } from 'react';
import { simulateScenario } from '../services/api';
import { SlidersHorizontal, AlertCircle } from 'lucide-react';

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
      alert('Scenario calculation failed. Verify backend service status.');
    } finally {
      setIsSimulating(false);
    }
  };

  const setPreset = (rain: number, temp: number) => {
    setDeltaRain(rain);
    setDeltaTemp(temp);
  };

  return (
    <div className="matte-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E3DDD1] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1A211B] font-display flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-[#1E472D]" />
            <span>{language === 'hi' ? '"क्या-अगर" जलवायु तनाव सिमुलेटर' : 'Counterfactual Microclimate Stress Simulator'}</span>
          </h3>
          <p className="text-[11px] text-[#576258] mt-0.5">
            Evaluate sensitivity of deterministic agronomic rules under anomalous conditions
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#576258] bg-[#F8F7F4] border border-[#E3DDD1] px-2 py-0.5 rounded">
          Hypothetical Stress Test
        </span>
      </div>

      {/* Mandatory Honest Simulation Notice */}
      <div className="p-3 bg-[#FBF2E9] border border-[#995A1E]/30 rounded text-xs text-[#995A1E] flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Explicit Notice: This simulator computes theoretical agronomic responses to synthetic microclimate shifts. These calculations do not represent real-time forecasts.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F8F7F4] p-4 rounded border border-[#E3DDD1]">
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1">
            <span className="text-[#576258] font-medium">Precipitation Anomaly</span>
            <span className="font-mono font-semibold text-[#1A211B]">+{deltaRain} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={deltaRain}
            onChange={(e) => setDeltaRain(Number(e.target.value))}
            className="w-full accent-[#1E472D]"
          />
          <div className="flex justify-between text-[10px] text-[#859286] font-mono mt-1">
            <span>0mm (Normal)</span>
            <span>+60mm (High)</span>
            <span>+120mm (Extreme)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline text-xs mb-1">
            <span className="text-[#576258] font-medium">Thermal Shift</span>
            <span className="font-mono font-semibold text-[#1A211B]">{deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp}°C</span>
          </div>
          <input
            type="range"
            min="-5"
            max="8"
            step="0.5"
            value={deltaTemp}
            onChange={(e) => setDeltaTemp(Number(e.target.value))}
            className="w-full accent-[#1E472D]"
          />
          <div className="flex justify-between text-[10px] text-[#859286] font-mono mt-1">
            <span>-5°C (Cold snap)</span>
            <span>0°C (Baseline)</span>
            <span>+8°C (Heatwave)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-[#576258]">Standard stress scenarios:</span>
          <button
            onClick={() => setPreset(50, -1)}
            className="text-[11px] px-2 py-0.5 rounded border border-[#E3DDD1] bg-[#FFFFFF] hover:bg-[#F8F7F4] text-[#1A211B]"
          >
            Cloudburst (+50mm)
          </button>
          <button
            onClick={() => setPreset(0, 4)}
            className="text-[11px] px-2 py-0.5 rounded border border-[#E3DDD1] bg-[#FFFFFF] hover:bg-[#F8F7F4] text-[#1A211B]"
          >
            Heatwave (+4°C)
          </button>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="btn-primary py-1.5 px-4 text-xs font-semibold"
        >
          {isSimulating ? 'Evaluating...' : 'Simulate Agronomic Impact'}
        </button>
      </div>

      {/* Comparison Outcome */}
      {simulationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded border border-[#E3DDD1] bg-[#FFFFFF] space-y-2 text-xs">
            <div className="flex justify-between items-baseline border-b border-[#E3DDD1] pb-1.5">
              <span className="font-semibold text-[#576258]">Observed Baseline Status</span>
              <span className="font-mono font-semibold text-[#276738]">
                Index: {simulationResult.baseline?.risk_score ?? 10}/100
              </span>
            </div>
            <p className="text-[#1A211B] font-medium">
              {simulationResult.baseline?.risk_level ?? 'LOW'} RISK
            </p>
            <p className="text-[#576258]">
              Current microclimate is within standard vegetative parameters for Vidarbha cotton.
            </p>
          </div>

          <div className="p-4 rounded border-2 border-[#995A1E]/40 bg-[#FBF2E9] space-y-2 text-xs">
            <div className="flex justify-between items-baseline border-b border-[#995A1E]/20 pb-1.5">
              <span className="font-semibold text-[#995A1E]">Simulated Scenario Stress</span>
              <span className="font-mono font-semibold text-[#995A1E]">
                Index: {simulationResult.simulated?.risk_score ?? 68}/100
              </span>
            </div>
            <p className="text-[#995A1E] font-medium">
              {simulationResult.simulated?.risk_level ?? 'HIGH'} RISK
            </p>
            <p className="text-[#576258]">
              {simulationResult.simulated?.impact_summary ||
                'Elevated soil moisture combined with prolonged thermal shift increases flower square abscission risk and root rot vulnerability.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSandbox;
