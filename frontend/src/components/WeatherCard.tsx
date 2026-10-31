import React from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ExternalLink,
} from 'lucide-react';

interface WeatherCardProps {
  weather: any;
  language: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, language }) => {
  if (!weather || !weather.current) {
    return (
      <div className="matte-panel p-6 text-center text-[#576258] text-xs">
        {language === 'hi'
          ? 'Open-Meteo से सजीव मौसम प्राप्त किया जा रहा है...'
          : 'Retrieving meteorological records from Open-Meteo...'}
      </div>
    );
  }

  const curr = weather.current;
  const provenance = weather.provenance;
  const forecast = weather.daily_forecast || [];

  return (
    <div className="matte-panel p-6 space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#E3DDD1] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1A211B] font-display">
            {language === 'hi' ? 'स्थानीय सूक्ष्म-जलवायु' : 'Hyperlocal Weather Conditions'}
          </h3>
          <p className="text-[11px] text-[#576258] mt-0.5">
            {provenance?.source || 'Open-Meteo'} • Station Sync:{' '}
            {provenance?.retrieved_at
              ? new Date(provenance.retrieved_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Live'}
          </p>
        </div>
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[#576258] hover:text-[#1E472D] flex items-center space-x-1"
        >
          <span>CC BY 4.0</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Primary Atmospheric State */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 py-1">
        <div>
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-semibold tracking-tight text-[#1A211B] font-display">
              {Math.round(curr.temperature_c)}°C
            </span>
            <span className="text-sm font-medium text-[#576258]">
              {curr.wmo_description || 'Clear'}
            </span>
          </div>
          <p className="text-xs text-[#576258] mt-1">
            {language === 'hi' ? 'वर्षा सम्भावना:' : 'Rain Probability:'}{' '}
            <span className="font-medium text-[#1A211B] font-mono">{curr.precipitation_probability_pct ?? 0}%</span> •{' '}
            {language === 'hi' ? 'हवा:' : 'Wind:'}{' '}
            <span className="font-medium text-[#1A211B] font-mono">{curr.wind_speed_kmh} km/h</span>
          </p>
        </div>

        <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-[#1E472D] pl-3 sm:pl-0 sm:pr-3">
          <span className="text-[11px] text-[#859286] uppercase tracking-wider block font-medium">
            {language === 'hi' ? '24 घंटे वर्षा' : '24h Precipitation'}
          </span>
          <span className="text-xl font-semibold text-[#1A211B] font-mono">
            {curr.precipitation_mm ?? 0} mm
          </span>
        </div>
      </div>

      {/* Secondary Metrics 4-Col Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded bg-[#F8F7F4] border border-[#E3DDD1]">
          <div className="flex items-center justify-between text-[#576258] mb-1">
            <span className="text-[11px] font-medium">{language === 'hi' ? 'तापमान' : 'Temperature'}</span>
            <Thermometer className="w-3.5 h-3.5 text-[#576258]" />
          </div>
          <span className="text-base font-semibold text-[#1A211B] font-mono">{curr.temperature_c}°C</span>
        </div>

        <div className="p-3 rounded bg-[#F8F7F4] border border-[#E3DDD1]">
          <div className="flex items-center justify-between text-[#576258] mb-1">
            <span className="text-[11px] font-medium">{language === 'hi' ? 'आर्द्रता' : 'Humidity'}</span>
            <Droplets className="w-3.5 h-3.5 text-[#576258]" />
          </div>
          <span className="text-base font-semibold text-[#1A211B] font-mono">{curr.relative_humidity_pct}%</span>
        </div>

        <div className="p-3 rounded bg-[#F8F7F4] border border-[#E3DDD1]">
          <div className="flex items-center justify-between text-[#576258] mb-1">
            <span className="text-[11px] font-medium">{language === 'hi' ? 'वायु वेग' : 'Wind Speed'}</span>
            <Wind className="w-3.5 h-3.5 text-[#576258]" />
          </div>
          <span className="text-base font-semibold text-[#1A211B] font-mono">{curr.wind_speed_kmh} km/h</span>
        </div>

        <div className="p-3 rounded bg-[#F8F7F4] border border-[#E3DDD1]">
          <div className="flex items-center justify-between text-[#576258] mb-1">
            <span className="text-[11px] font-medium">{language === 'hi' ? 'वर्षा' : 'Precipitation'}</span>
            <CloudRain className="w-3.5 h-3.5 text-[#576258]" />
          </div>
          <span className="text-base font-semibold text-[#1A211B] font-mono">{curr.precipitation_mm} mm</span>
        </div>
      </div>

      {/* 7-Day Numerical Outlook Table */}
      {forecast.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-[#576258] uppercase tracking-wider block mb-2 font-display">
            {language === 'hi' ? '7-दिवसीय दृष्टिकोण' : '7-Day Synoptic Outlook'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {forecast.slice(0, 7).map((d: any, idx: number) => {
              const dateObj = new Date(d.date);
              const dayName = dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                weekday: 'short',
              });
              const isToday = idx === 0;

              return (
                <div
                  key={d.date}
                  className={`p-2.5 rounded border text-center text-xs ${
                    isToday
                      ? 'bg-[#EBF3EC] border-[#1E472D]'
                      : 'bg-[#FFFFFF] border-[#E3DDD1]'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-[#1A211B] block">
                    {isToday ? (language === 'hi' ? 'आज' : 'Today') : dayName}
                  </span>
                  <div className="text-xs font-mono font-medium text-[#1A211B] mt-1.5">
                    {Math.round(d.temp_max_c)}° / <span className="text-[#859286]">{Math.round(d.temp_min_c)}°</span>
                  </div>
                  <span className="text-[10px] text-[#576258] mt-1 block font-mono">
                    {d.precipitation_sum_mm > 0 ? `${d.precipitation_sum_mm}mm` : 'Dry'}
                  </span>
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
