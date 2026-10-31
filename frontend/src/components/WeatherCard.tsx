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
    loading: 'Getting live weather from Open-Meteo...',
    title: 'Live Weather',
    subtitle: 'Real-time data from Open-Meteo',
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind',
    precipitation: 'Rain (24h)',
    rainProb: 'Rain Chance',
    forecast: '7-Day Forecast',
    today: 'Today',
    dry: 'Dry',
    station: 'Updated',
  },
  hi: {
    loading: 'Open-Meteo से मौसम आ रहा है...',
    title: 'आज का मौसम',
    subtitle: 'Open-Meteo से सीधा असली डेटा',
    temperature: 'तापमान',
    humidity: 'नमी',
    windSpeed: 'हवा',
    precipitation: 'बारिश (24 घंटे)',
    rainProb: 'बारिश की संभावना',
    forecast: '7 दिन का मौसम',
    today: 'आज',
    dry: 'सूखा',
    station: 'अपडेट',
  },
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, language }) => {
  const tx = language === 'hi' ? t.hi : t.en;

  if (!weather || !weather.current) {
    return (
      <div className="agro-card p-6 text-center text-[#5C4A30] text-sm py-10">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Sun className="w-8 h-8 text-[#F3B391]" />
          <span>{tx.loading}</span>
        </div>
      </div>
    );
  }

  const curr = weather.current;
  const provenance = weather.provenance;
  const forecast = weather.daily_forecast || [];

  const wmoDesc: Record<number, { en: string; hi: string }> = {
    0: { en: 'Clear Sky', hi: 'साफ आसमान' },
    1: { en: 'Mainly Clear', hi: 'काफी साफ' },
    2: { en: 'Partly Cloudy', hi: 'थोड़े बादल' },
    3: { en: 'Overcast', hi: 'बादल छाए' },
    45: { en: 'Foggy', hi: 'धुंध' },
    51: { en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी' },
    61: { en: 'Light Rain', hi: 'हल्की बारिश' },
    63: { en: 'Moderate Rain', hi: 'मध्यम बारिश' },
    65: { en: 'Heavy Rain', hi: 'तेज बारिश' },
    80: { en: 'Rain Showers', hi: 'बारिश के झोंके' },
    95: { en: 'Thunderstorm', hi: 'आंधी-तूफान' },
  };
  const wmoCode = curr.wmo_code ?? curr.weather_code;
  const desc =
    wmoCode !== undefined && wmoDesc[wmoCode]
      ? language === 'hi'
        ? wmoDesc[wmoCode].hi
        : wmoDesc[wmoCode].en
      : curr.weather_description || curr.wmo_description || (language === 'hi' ? 'साफ' : 'Clear');
  
  // precipitation_probability is in daily[0] for current day
  const todayProb = forecast.length > 0 ? (forecast[0].precipitation_probability_pct ?? 0) : (curr.precipitation_probability_pct ?? 0);

  return (
    <div className="agro-card p-6 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#E8C99A] pb-3">
        <div>
          <h3 className="text-base font-bold text-[#241909]">{tx.title}</h3>
          <p className="text-xs text-[#5C4A30] mt-0.5">
            {tx.subtitle} •{' '}
            {provenance?.retrieved_at
              ? `${tx.station}: ${new Date(provenance.retrieved_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : tx.station}
          </p>
        </div>
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#5C4A30] hover:text-[#241909] flex items-center gap-1 bg-[#FEFADC] px-2 py-1 rounded border border-[#E8C99A]"
        >
          <span>Open-Meteo</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Primary Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-[#241909] tabular-nums">
              {Math.round(curr.temperature_c)}°C
            </span>
            <span className="text-base font-medium text-[#5C4A30] bg-[#FEFADC] px-2 py-0.5 rounded-full border border-[#E8C99A]">
              {desc}
            </span>
          </div>
          <p className="text-sm text-[#5C4A30] mt-2">
            {tx.rainProb}:{' '}
            <span className="font-bold text-[#241909]">{todayProb}%</span>
            {'  •  '}
            {tx.windSpeed}:{' '}
            <span className="font-bold text-[#241909]">{curr.wind_speed_kmh} km/h</span>
          </p>
        </div>

        <div className="text-right bg-[#FEFADC] border border-[#E8C99A] rounded-xl p-3 min-w-[110px]">
          <span className="text-xs text-[#5C4A30] font-medium block">{tx.precipitation}</span>
          <span className="text-2xl font-bold text-[#241909] tabular-nums mt-1 block">
            {curr.precipitation_mm ?? 0}
            <span className="text-sm font-medium text-[#5C4A30] ml-1">mm</span>
          </span>
        </div>
      </div>

      {/* 4-metric grid */}
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
            <span className="text-sm font-bold text-[#241909] tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      {/* 7-Day Forecast */}
      {forecast.length > 0 && (
        <div>
          <span className="text-xs font-bold text-[#5C4A30] uppercase tracking-wider block mb-3">
            {tx.forecast}
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {forecast.slice(0, 7).map((d: any, idx: number) => {
              const dateObj = new Date(d.date);
              const dayName = dateObj.toLocaleDateString(
                language === 'hi' ? 'hi-IN' : 'en-US',
                { weekday: 'short' }
              );
              const isToday = idx === 0;

              return (
                <div
                  key={d.date}
                  className={`p-2.5 rounded-lg border text-center text-xs ${
                    isToday ? 'bg-[#F3B391] border-[#E07B39]' : 'bg-[#FEFADC] border-[#E8C99A]'
                  }`}
                >
                  <span
                    className={`text-xs font-bold block ${
                      isToday ? 'text-[#241909]' : 'text-[#5C4A30]'
                    }`}
                  >
                    {isToday ? tx.today : dayName}
                  </span>
                  <div className="text-xs font-bold mt-1.5 tabular-nums text-[#241909]">
                    {Math.round(d.temp_max_c)}°
                    <span className="text-[#5C4A30] font-normal">/{Math.round(d.temp_min_c)}°</span>
                  </div>
                  <span
                    className={`text-[10px] mt-1 block font-medium ${
                      d.precipitation_sum_mm > 0 ? 'text-[#3A7D44]' : 'text-[#5C4A30]'
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
