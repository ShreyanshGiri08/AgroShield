import React, { useState, useEffect } from 'react';
import { Navbar, type ActiveTab } from './components/Navbar';
import { FarmarianMascot } from './components/FarmarianMascot';
import { WeatherCard } from './components/WeatherCard';
import { CropStageStepper } from './components/CropStageStepper';
import { CropRiskGauge } from './components/CropRiskGauge';
import { AgentChat } from './components/AgentChat';
import { MandiRadar } from './components/MandiRadar';
import { CropHealthCamera } from './components/CropHealthCamera';
import { ScenarioSandbox } from './components/ScenarioSandbox';
import { fetchLiveWeather, apiClient } from './services/api';
import { Sparkles, Camera, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [language, setLanguage] = useState<string>('hi');
  const [farmer] = useState<any>({
    user_id: '7c276ba5-2c5b-4d0e-a4f7-080e36e7933e',
    full_name: 'रमेश पटेल (Ramesh Patel)',
    phone_number: '9876543210',
    location: {
      state: 'Maharashtra',
      district: 'Akola',
      village: 'Barshitakli',
      latitude: 20.7002,
      longitude: 77.0082,
    },
    farm: {
      name: 'Akola Cotton Farm',
      area_acres: 5.5,
      soil_type: 'Black Soil (काळी माती)',
      irrigation_source: 'Borewell',
    },
    crop: {
      name: 'Cotton',
      hindi_name: 'कपास',
      sowing_date: '2026-08-20',
      status: 'ACTIVE',
    },
  });

  const [weather, setWeather] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1. Fetch live weather for Akola
        const wData = await fetchLiveWeather(farmer.location.latitude, farmer.location.longitude);
        setWeather(wData);

        // 2. Fetch baseline risk assessment
        const rRes = await apiClient.post('/api/risk/evaluate', null, {
          params: {
            crop_name: farmer.crop.name,
            growth_stage_name: 'Flowering & Boll Formation',
            latitude: farmer.location.latitude,
            longitude: farmer.location.longitude,
          },
        });
        setRiskData(rRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    loadDashboardData();
  }, [farmer]);

  const locationString = `${farmer.location.village}, ${farmer.location.district}`;

  return (
    <div className="min-h-screen bg-cornsilk text-pitch flex flex-col font-sans selection:bg-peach selection:text-coffee">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onLanguageChange={setLanguage}
        farmerName={farmer.full_name}
        location={locationString}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: MAIN FARMER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Banner with Farmarian Mascot */}
            <div className="bg-coffee text-cornsilk rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 z-10 text-center sm:text-left">
                <div className="inline-flex items-center space-x-2 bg-peach/20 text-peach text-xs font-bold px-3 py-1 rounded-full border border-peach/30">
                  <span className="w-2 h-2 rounded-full bg-peach animate-pulse" />
                  <span>{language === 'hi' ? 'सक्रिय खेत निगरानी चालू' : 'Continuous Farm Guardian Active'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-cornsilk">
                  {language === 'hi' ? `राम-राम, ${farmer.full_name} जी!` : `Welcome back, ${farmer.full_name}!`}
                </h1>
                <p className="text-xs sm:text-sm text-sand/80 max-w-xl font-medium">
                  {language === 'hi'
                    ? 'AgroShield ने आपके खेत के लिए वास्तविक मौसम, ICAR ज्ञानकोष और मंडी भाव को सिंक कर लिया है। आज कोई बड़ा मौसम खतरा नहीं है।'
                    : 'AgroShield has synced live Open-Meteo climate, ICAR crop calendar, and AGMARKNET prices for your cotton plot.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => setActiveTab('advisory')}
                    className="bg-peach hover:bg-peach-dark text-coffee text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'hi' ? 'एआई सलाहकार से पूछें' : 'Consult Farmarian AI'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('camera')}
                    className="bg-coffee-800 hover:bg-coffee-700 text-cornsilk border border-sand/30 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4 text-peach" />
                    <span>{language === 'hi' ? 'पत्ती की फोटो जांचें' : 'Inspect Plant Leaf'}</span>
                  </button>
                </div>
              </div>

              {/* Mascot Illustration */}
              <div className="z-10 flex-shrink-0 bg-coffee-800/60 p-4 rounded-3xl border border-sand/20 shadow-inner">
                <FarmarianMascot state="welcoming" size={110} />
              </div>
            </div>

            {/* Crop Phenological Stage Stepper */}
            <CropStageStepper
              cropName={farmer.crop.name}
              hindiName={farmer.crop.hindi_name}
              sowingDate={farmer.crop.sowing_date}
              language={language}
            />

            {/* Top Grid: Weather + Risk Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherCard weather={weather} language={language} />
              <CropRiskGauge riskData={riskData} language={language} />
            </div>

            {/* Quick Mandi Snapshot Preview */}
            <MandiRadar
              language={language}
              defaultState={farmer.location.state}
              defaultDistrict={farmer.location.district}
              defaultCommodity={farmer.crop.name}
            />
          </div>
        )}

        {/* VIEW 2: AI ADVISORY & EXECUTION TRACE TERMINAL */}
        {activeTab === 'advisory' && (
          <div className="space-y-4">
            <AgentChat
              userId={farmer.user_id}
              language={language}
              cropName={farmer.crop.name}
            />
          </div>
        )}

        {/* VIEW 3: LIVE WEATHER & ATMOSPHERIC RISK */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <WeatherCard weather={weather} language={language} />
            <CropRiskGauge riskData={riskData} language={language} />
          </div>
        )}

        {/* VIEW 4: MANDI INTELLIGENCE */}
        {activeTab === 'mandi' && (
          <div className="space-y-6">
            <MandiRadar
              language={language}
              defaultState={farmer.location.state}
              defaultDistrict={farmer.location.district}
              defaultCommodity={farmer.crop.name}
            />
          </div>
        )}

        {/* VIEW 5: CROP HEALTH INSPECTION */}
        {activeTab === 'camera' && (
          <div className="space-y-6">
            <CropHealthCamera
              language={language}
              cropName={farmer.crop.name}
              location={locationString}
            />
          </div>
        )}

        {/* VIEW 6: SCENARIO WHAT-IF SANDBOX */}
        {activeTab === 'scenario' && (
          <div className="space-y-6">
            <ScenarioSandbox
              language={language}
              cropName={farmer.crop.name}
              growthStageName="Flowering & Boll Formation"
              latitude={farmer.location.latitude}
              longitude={farmer.location.longitude}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-coffee text-sand/60 text-xs py-6 border-t border-sand/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <FarmarianMascot state="welcoming" size={28} />
            <span className="font-bold text-cornsilk">AgroShield Platform</span>
            <span>•</span>
            <span>36-Hour Hackathon Engineering Submission</span>
          </div>
          <p className="text-[11px] text-center sm:text-right">
            Verified Data Providers: Open-Meteo, data.gov.in AGMARKNET, ICAR Research Publications
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
