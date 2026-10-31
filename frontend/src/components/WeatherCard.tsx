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
    loading: 'Retrieving live meteorological records from Open-Meteo...',
    title: 'Live Hyperlocal Weather Intelligence',
    subtitle: 'Direct high-precision telemetry from Open-Meteo Synoptic Forecast Engine',
    temperature: 'Ambient Temp',
    humidity: 'Relative Humidity',
    windSpeed: 'Wind Velocity',
    precipitation: 'Rainfall (24h)',
    rainProb: 'Precipitation Probability',
    forecast: '7-Day Synoptic Weather Outlook',
    today: 'Today',
    dry: 'Dry / No Rain',
    station: 'Station Updated',
  },
  hi: {
    loading: 'Open-Meteo से सजीव मौसम डेटा प्राप्त हो रहा है...',
    title: 'सजीव मौसम एवं वर्षा पूर्वानुमान',
    subtitle: 'Open-Meteo मौसम विज्ञान उपग्रह से सीधा सटीक डेटा',
    temperature: 'खेत का तापमान',
    humidity: 'हवा में नमी',
    windSpeed: 'हवा की गति',
    precipitation: 'पिछले 24 घंटे की बारिश',
    rainProb: 'बारिश की संभावना',
    forecast: 'आगामी 7 दिनों का मौसम पूर्वानुमान',
    today: 'आज',
    dry: 'मौसम साफ / सूखा',
    station: 'अंतिम अपडेट',
  },
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, language }) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  if (!weather || !weather.current) {
    return (
      <div className="agro-card p-8 text-center text-[#5C4A30] text-base py-12">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Sun className="w-10 h-10 text-[#F3B391] animate-spin" />
          <span className="font-extrabold">{tx.loading}</span>
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
    45: { en: 'Foggy / Haze', hi: 'धुंध / कोहरा' },
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
      : curr.weather_description || curr.wmo_description || (isHi ? 'साफ आसमान' : 'Clear Sky');

  const todayProb =
    forecast.length > 0
      ? forecast[0].precipitation_probability_pct ?? 0
      : curr.precipitation_probability_pct ?? 0;

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[#241909] flex items-center gap-2">
            <Sun className="w-6 h-6 text-[#E07B39]" />
            <span>{tx.title}</span>
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#5C4A30] mt-1">
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
          className="text-xs sm:text-sm font-bold text-[#5C4A30] hover:text-[#241909] flex items-center gap-1.5 bg-[#FEFADC] px-3 py-1.5 rounded-xl border border-[#E8C99A] self-start sm:self-auto shadow-sm"
        >
          <span>Open-Meteo</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Primary Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-[#FEFADC] p-5 rounded-2xl border-2 border-[#E8C99A]">
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black text-[#241909] font-mono tracking-tight">
              {Math.round(curr.temperature_c)}°C
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#241909] bg-[#F6D4BA] px-3.5 py-1.5 rounded-xl border border-[#E8C99A]">
              {desc}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm sm:text-base font-bold text-[#5C4A30]">
            <span>
              {tx.rainProb}: <strong className="text-[#241909] font-mono">{todayProb}%</strong>
            </span>
            <span>•</span>
            <span>
              {tx.windSpeed}: <strong className="text-[#241909] font-mono">{curr.wind_speed_kmh} km/h</strong>
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right bg-[#FFFDF5] border border-[#E8C99A] rounded-2xl p-4 min-w-[140px] shadow-sm">
          <span className="text-xs sm:text-sm text-[#5C4A30] font-extrabold block">{tx.precipitation}</span>
          <span className="text-3xl font-black text-[#241909] font-mono mt-1 block">
            {curr.precipitation_mm ?? 0}
            <span className="text-base font-bold text-[#5C4A30] ml-1.5">mm</span>
          </span>
        </div>
      </div>

      {/* 4-Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: tx.temperature, value: `${curr.temperature_c}°C`, Icon: Thermometer },
          { label: tx.humidity, value: `${curr.relative_humidity_pct}%`, Icon: Droplets },
          { label: tx.windSpeed, value: `${curr.wind_speed_kmh} km/h`, Icon: Wind },
          { label: tx.precipitation, value: `${curr.precipitation_mm ?? 0} mm`, Icon: CloudRain },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="p-4 rounded-xl bg-[#FEFADC] border border-[#E8C99A] shadow-sm">
            <div className="flex items-center justify-between text-[#5C4A30] mb-1.5">
              <span className="text-xs sm:text-sm font-extrabold">{label}</span>
              <Icon className="w-4 h-4 text-[#E07B39]" />
            </div>
            <span className="text-lg sm:text-xl font-black text-[#241909] font-mono">{value}</span>
          </div>
        ))}
      </div>

      {/* 7-Day Forecast */}
      {forecast.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs sm:text-sm font-black text-[#5C4A30] uppercase tracking-wider block">
            {tx.forecast}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
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
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isToday
                      ? 'bg-[#F3B391] border-[#E07B39] shadow-sm'
                      : 'bg-[#FEFADC] border-[#E8C99A] hover:bg-[#F6D4BA]'
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-black block ${
                      isToday ? 'text-[#241909]' : 'text-[#5C4A30]'
                    }`}
                  >
                    {isToday ? tx.today : dayName}
                  </span>
                  <div className="text-sm sm:text-base font-black mt-1.5 font-mono text-[#241909]">
                    {Math.round(d.temp_max_c)}°
                    <span className="text-[#5C4A30] font-normal text-xs">/{Math.round(d.temp_min_c)}°</span>
                  </div>
                  <span
                    className={`text-xs mt-1 block font-extrabold ${
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
