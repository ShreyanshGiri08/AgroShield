import React from 'react';
import { CloudRain, Wind, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

interface WeatherCardProps {
  weather: any;
  language: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, language }) => {
  if (!weather || !weather.current) {
    return (
      <div className="bg-sand/30 border border-sand rounded-2xl p-6 text-center text-pitch/60">
        मौसम की जानकारी लोड हो रही है...
      </div>
    );
  }

  const curr = weather.current;
  const provenance = weather.provenance;
  const forecast = weather.daily_forecast || [];

  return (
    <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-6 shadow-sm">
      {/* Header & Source Provenance */}
      <div className="flex items-center justify-between pb-4 border-b border-sand/60">
        <div>
          <h3 className="text-lg font-bold text-coffee">
            {language === 'hi' ? 'सटीक मौसम पूर्वानुमान' : 'Live Hyperlocal Weather'}
          </h3>
          <p className="text-xs text-pitch/60">
            {provenance?.source} • {provenance?.retrieved_at ? new Date(provenance.retrieved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
          </p>
        </div>
        <span className="flex items-center space-x-1 bg-peach/30 border border-peach text-coffee text-[10px] font-bold px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3 text-peach-dark" />
          <span>CC BY 4.0 Verified</span>
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="bg-cornsilk border border-sand/60 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-peach/40 flex items-center justify-center text-coffee">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-pitch/60 font-medium">{language === 'hi' ? 'तापमान' : 'Temperature'}</p>
            <p className="text-xl font-black text-coffee">{curr.temperature_c}°C</p>
          </div>
        </div>

        <div className="bg-cornsilk border border-sand/60 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center text-coffee">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-pitch/60 font-medium">{language === 'hi' ? 'आर्द्रता (नमी)' : 'Humidity'}</p>
            <p className="text-xl font-black text-coffee">{curr.relative_humidity_pct}%</p>
          </div>
        </div>

        <div className="bg-cornsilk border border-sand/60 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-peach/40 flex items-center justify-center text-coffee">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-pitch/60 font-medium">{language === 'hi' ? 'वर्षा (24 घंटे)' : 'Rainfall'}</p>
            <p className="text-xl font-black text-coffee">{curr.precipitation_mm} mm</p>
          </div>
        </div>

        <div className="bg-cornsilk border border-sand/60 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center text-coffee">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-pitch/60 font-medium">{language === 'hi' ? 'हवा की गति' : 'Wind Speed'}</p>
            <p className="text-xl font-black text-coffee">{curr.wind_speed_kmh} km/h</p>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Strip */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-coffee/80 mb-3">
          {language === 'hi' ? 'आगामी 7 दिनों का पूर्वानुमान' : '7-Day Atmospheric Outlook'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {forecast.map((day: any, i: number) => (
            <div
              key={day.date}
              className={`p-2.5 rounded-xl border text-center transition ${
                i === 0 ? 'bg-cornsilk border-peach shadow-sm ring-1 ring-peach/50' : 'bg-cornsilk/80 border-sand/60'
              }`}
            >
              <p className="text-[10px] font-bold text-pitch/70">
                {new Date(day.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </p>
              <div className="my-1.5 flex justify-center text-coffee">
                <CloudRain className="w-4 h-4 text-peach-dark" />
              </div>
              <p className="text-xs font-black text-coffee">{day.temp_max_c}°</p>
              <p className="text-[10px] text-pitch/50">{day.temp_min_c}°</p>
              
              {/* Rain Probability Badge */}
              <div className="mt-2 pt-1 border-t border-sand/40">
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    day.precipitation_probability_pct > 30
                      ? 'bg-peach text-coffee'
                      : 'bg-sand/40 text-pitch/60'
                  }`}
                >
                  {day.precipitation_probability_pct}% rain
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
