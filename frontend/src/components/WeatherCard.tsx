import React from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  Sun,
  Cloud,
  CloudLightning,
} from 'lucide-react';

interface WeatherCardProps {
  weather: any;
  language: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, language }) => {
  if (!weather || !weather.current) {
    return (
      <div className="agri-card p-8 text-center text-[#FEFADC]/60 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#F3B391] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">
          {language === 'hi'
            ? 'Open-Meteo से सजीव मौसम प्राप्त किया जा रहा है...'
            : 'Streaming verified live weather from Open-Meteo...'}
        </p>
      </div>
    );
  }

  const curr = weather.current;
  const provenance = weather.provenance;
  const forecast = weather.daily_forecast || [];

  const getWeatherIcon = (wmoCode: number) => {
    if (wmoCode === 0) return <Sun className="w-9 h-9 text-amber-400 animate-spin-slow" />;
    if (wmoCode <= 3) return <Cloud className="w-9 h-9 text-slate-300" />;
    if (wmoCode >= 51 && wmoCode <= 67) return <CloudRain className="w-9 h-9 text-blue-400" />;
    if (wmoCode >= 80) return <CloudRain className="w-9 h-9 text-cyan-400" />;
    if (wmoCode >= 95) return <CloudLightning className="w-9 h-9 text-purple-400" />;
    return <Sun className="w-9 h-9 text-amber-400" />;
  };

  return (
    <div className="agri-card p-6 sm:p-7 space-y-6">
      {/* Header & Source Provenance */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F3B391]/15">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-[#FEFADC] tracking-tight">
              {language === 'hi' ? 'सटीक हाइपरलोकल मौसम' : 'Hyperlocal Live Weather'}
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          </div>
          <p className="text-xs text-[#F6D4BA]/60 font-medium">
            {provenance?.source || 'Open-Meteo API'} •{' '}
            {provenance?.retrieved_at
              ? new Date(provenance.retrieved_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Live Telemetry'}
          </p>
        </div>
        <span className="flex items-center space-x-1.5 bg-[#0F1108]/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Fabricated Data</span>
        </span>
      </div>

      {/* Main Hero Weather Highlight */}
      <div className="bg-gradient-to-r from-[#241909]/90 to-[#191106]/95 rounded-2xl p-5 border border-[#F3B391]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0F1108]/80 border border-[#F3B391]/30 flex items-center justify-center shadow-inner">
            {getWeatherIcon(curr.weather_code || 0)}
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-[#FEFADC] tracking-tight font-display">
                {Math.round(curr.temperature_c)}°C
              </span>
              <span className="text-xs font-bold text-[#F3B391]">
                {curr.wmo_description || 'Clear Sky'}
              </span>
            </div>
            <p className="text-xs text-[#F6D4BA]/70 mt-0.5">
              {language === 'hi' ? 'हवा की गति:' : 'Wind:'}{' '}
              <span className="font-bold text-white">{curr.wind_speed_kmh} km/h</span> •{' '}
              {language === 'hi' ? 'वर्षा सम्भावना:' : 'Rain Risk:'}{' '}
              <span className="font-bold text-white">{curr.precipitation_probability_pct ?? 0}%</span>
            </p>
          </div>
        </div>

        {/* Rain Risk Alert badge */}
        <div className="bg-[#0F1108]/70 border border-[#F3B391]/30 rounded-xl px-4 py-2.5 text-right w-full sm:w-auto shadow-inner">
          <span className="text-[10px] font-extrabold uppercase text-[#F3B391] tracking-wider block">
            {language === 'hi' ? '24 घंटे वर्षा अनुमान' : 'Next 24h Rainfall'}
          </span>
          <span className="text-xl font-black text-white font-mono">
            {curr.precipitation_mm ?? 0} mm
          </span>
        </div>
      </div>

      {/* 4-Stat Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-tile p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#F6D4BA]/70">
              {language === 'hi' ? 'तापमान' : 'Temperature'}
            </span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">{curr.temperature_c}°C</p>
          <span className="text-[10px] text-emerald-400 font-medium">Real-time Sensor</span>
        </div>

        <div className="metric-tile p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#F6D4BA]/70">
              {language === 'hi' ? 'आर्द्रता (नमी)' : 'Humidity'}
            </span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">{curr.relative_humidity_pct}%</p>
          <span className="text-[10px] text-[#F3B391] font-medium">
            {curr.relative_humidity_pct > 75 ? 'High Moisture' : 'Optimal'}
          </span>
        </div>

        <div className="metric-tile p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#F6D4BA]/70">
              {language === 'hi' ? 'हवा गति' : 'Wind Speed'}
            </span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">{curr.wind_speed_kmh} <span className="text-xs font-normal">km/h</span></p>
          <span className="text-[10px] text-[#F6D4BA]/50 font-medium">{curr.wind_direction_deg ?? 180}° S</span>
        </div>

        <div className="metric-tile p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#F6D4BA]/70">
              {language === 'hi' ? 'वर्षा (24h)' : 'Precipitation'}
            </span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">{curr.precipitation_mm} <span className="text-xs font-normal">mm</span></p>
          <span className="text-[10px] text-[#F6D4BA]/50 font-medium">Accumulation</span>
        </div>
      </div>

      {/* 7-Day Forecast Strip */}
      {forecast.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F3B391]">
              {language === 'hi' ? '7-दिवसीय एग्रोनॉमिक पूर्वानुमान' : '7-Day Agronomic Forecast'}
            </h4>
            <span className="text-[10px] font-bold text-[#F6D4BA]/50">High-Resolution Open-Meteo Model</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {forecast.slice(0, 7).map((d: any, idx: number) => {
              const dateObj = new Date(d.date);
              const dayName = dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                weekday: 'short',
              });
              const dayNum = dateObj.getDate();
              const isToday = idx === 0;

              return (
                <div
                  key={d.date}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                    isToday
                      ? 'bg-[#F3B391]/20 border-[#F3B391] shadow-[0_0_12px_rgba(243,179,145,0.3)] font-bold'
                      : 'bg-[#0F1108]/60 border-white/5 hover:border-[#F3B391]/30 hover:bg-[#1E160C]/60'
                  }`}
                >
                  <span className="text-[11px] font-black text-[#FEFADC]">
                    {isToday ? (language === 'hi' ? 'आज' : 'Today') : `${dayName} ${dayNum}`}
                  </span>
                  <div className="my-1.5">{getWeatherIcon(d.weather_code || 0)}</div>
                  <div className="text-xs font-black text-white">
                    {Math.round(d.temp_max_c)}° /{' '}
                    <span className="text-[#F6D4BA]/50 font-semibold">{Math.round(d.temp_min_c)}°</span>
                  </div>
                  {d.precipitation_sum_mm > 0 ? (
                    <span className="mt-1 text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded-full border border-cyan-800">
                      {d.precipitation_sum_mm}mm
                    </span>
                  ) : (
                    <span className="mt-1 text-[10px] text-[#F6D4BA]/40 font-medium">Dry</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
