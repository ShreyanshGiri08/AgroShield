import React from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ExternalLink,
  Sun,
} from 'lucide-react';

interface WeatherCardProps {
  weather: any;
  language: string;
}

const t = {
  en: {
    loading: 'Retrieving live weather from Open-Meteo...',
    title: 'Live Weather',
    subtitle: 'Open-Meteo satellite telemetry',
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind',
    precipitation: 'Rainfall (24h)',
    rainProb: 'Rain probability',
    forecast: '7-Day Forecast',
    today: 'Today',
    dry: 'Dry',
    station: 'Updated',
  },
  hi: {
    loading: 'Open-Meteo से सजीव मौसम डेटा प्राप्त हो रहा है...',
    title: 'सजीव मौसम',
    subtitle: 'Open-Meteo उपग्रह से सीधा डेटा',
    temperature: 'तापमान',
    humidity: 'नमी',
    windSpeed: 'हवा',
    precipitation: 'बारिश (24h)',
    rainProb: 'बारिश की संभावना',
    forecast: 'अगले 7 दिन',
    today: 'आज',
    dry: 'साफ',
    station: 'अपडेट',
  },
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, language }) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  if (!weather || !weather.current) {
    return (
      <div className="agro-card p-8 text-center text-[#5C4A30] py-12">
        <div className="flex flex-col items-center gap-3">
          <Sun className="w-8 h-8 text-[#F3B391] animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-sm font-medium">{tx.loading}</span>
        </div>
      </div>
    );
  }

  const curr = weather.current;
  const provenance = weather.provenance;
  const forecast = weather.daily_forecast || [];

  const wmoDesc: Record<number, { en: string; hi: string }> = {
    0: { en: 'Clear Sky', hi: 'साफ आसमान' },
    1: { en: 'Mainly Clear', hi: 'मुख्यतः साफ' },
    2: { en: 'Partly Cloudy', hi: 'आंशिक बादल' },
    3: { en: 'Overcast', hi: 'घने बादल' },
    45: { en: 'Foggy', hi: 'धुंध' },
    51: { en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी' },
    61: { en: 'Light Rain', hi: 'हल्की बारिश' },
    63: { en: 'Moderate Rain', hi: 'मध्यम बारिश' },
    65: { en: 'Heavy Rain', hi: 'भारी बारिश' },
    80: { en: 'Rain Showers', hi: 'तेज बौछारें' },
    95: { en: 'Thunderstorm', hi: 'आंधी-तूफान' },
  };

  const wmoCode = curr.wmo_code ?? curr.weather_code;
  const desc =
    wmoCode !== undefined && wmoDesc[wmoCode]
      ? isHi
        ? wmoDesc[wmoCode].hi
        : wmoDesc[wmoCode].en
      : curr.weather_description || (isHi ? 'साफ आसमान' : 'Clear Sky');

  const todayProb =
    forecast.length > 0
      ? forecast[0].precipitation_probability_pct ?? 0
      : curr.precipitation_probability_pct ?? 0;

  return (
    <div className="agro-card p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#241909] flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#E07B39] flex-shrink-0" />
            <span>{tx.title}</span>
          </h3>
          <p className="text-xs text-[#5C4A30] mt-0.5">
            {tx.subtitle}
            {provenance?.retrieved_at &&
              ` • ${tx.station} ${new Date(provenance.retrieved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#5C4A30] hover:text-[#241909] flex items-center gap-1 flex-shrink-0 transition-colors"
        >
          <span>Open-Meteo</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Primary Temperature Display */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-bold text-[#241909] font-mono tracking-tight">
              {Math.round(curr.temperature_c)}°C
            </span>
            <span className="text-sm font-medium text-[#5C4A30] bg-[#F6D4BA] px-2.5 py-1 rounded-lg border border-[#E8C99A]">
              {desc}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#5C4A30]">
            <span>
              {tx.rainProb}: <strong className="text-[#241909] font-mono font-semibold">{todayProb}%</strong>
            </span>
            <span>•</span>
            <span>
              {tx.windSpeed}: <strong className="text-[#241909] font-mono font-semibold">{curr.wind_speed_kmh} km/h</strong>
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-[#5C4A30] block">{tx.precipitation}</span>
          <span className="text-3xl font-bold text-[#241909] font-mono mt-0.5 block">
            {curr.precipitation_mm ?? 0}
            <span className="text-sm font-normal text-[#5C4A30] ml-1">mm</span>
          </span>
        </div>
      </div>

      {/* 4-Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: tx.temperature, value: `${curr.temperature_c}°C`, Icon: Thermometer },
          { label: tx.humidity, value: `${curr.relative_humidity_pct}%`, Icon: Droplets },
          { label: tx.windSpeed, value: `${curr.wind_speed_kmh} km/h`, Icon: Wind },
          { label: tx.precipitation, value: `${curr.precipitation_mm ?? 0} mm`, Icon: CloudRain },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="p-3 rounded-lg bg-[#FEFADC] border border-[#E8C99A]">
            <div className="flex items-center justify-between text-[#5C4A30] mb-1">
              <span className="text-xs font-medium">{label}</span>
              <Icon className="w-3.5 h-3.5 text-[#E07B39]" />
            </div>
            <span className="text-base font-bold text-[#241909] font-mono">{value}</span>
          </div>
        ))}
      </div>

      {/* 7-Day Forecast */}
      {forecast.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-[#5C4A30] uppercase tracking-wide block">
            {tx.forecast}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {forecast.slice(0, 7).map((d: any, idx: number) => {
              const dateObj = new Date(d.date);
              const dayName = dateObj.toLocaleDateString(
                isHi ? 'hi-IN' : 'en-US',
                { weekday: 'short' }
              );
              const isToday = idx === 0;

              return (
                <div
                  key={d.date}
                  className={`p-3 rounded-lg border text-center ${
                    isToday
                      ? 'bg-[#F3B391] border-[#E07B39]'
                      : 'bg-[#FEFADC] border-[#E8C99A]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold block ${
                      isToday ? 'text-[#241909]' : 'text-[#5C4A30]'
                    }`}
                  >
                    {isToday ? tx.today : dayName}
                  </span>
                  <div className="text-sm font-bold mt-1 font-mono text-[#241909]">
                    {Math.round(d.temp_max_c)}°
                    <span className="text-[#5C4A30] font-normal text-xs">/{Math.round(d.temp_min_c)}°</span>
                  </div>
                  <span
                    className={`text-xs mt-0.5 block font-medium ${
                      d.precipitation_sum_mm > 0 ? 'text-[#3A7D44]' : 'text-[#8A7A60]'
                    }`}
                  >
                    {d.precipitation_sum_mm > 0 ? `${d.precipitation_sum_mm}mm` : tx.dry}
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
