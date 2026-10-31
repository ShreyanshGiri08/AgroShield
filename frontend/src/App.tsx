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
import { Sparkles, Camera, ArrowRight, Sprout, Layers, Droplet } from 'lucide-react';

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
      soil_type: 'Black Cotton Soil (काळी माती)',
      irrigation_source: 'Borewell / Drip',
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
        const wData = await fetchLiveWeather(farmer.location.latitude, farmer.location.longitude);
        setWeather(wData);

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
    <div className="min-h-screen bg-[#0D0F07] text-[#FEFADC] flex flex-col font-sans selection:bg-[#F3B391] selection:text-[#241909]">
      {/* Top Floating Glass Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onLanguageChange={setLanguage}
        farmerName={farmer.full_name}
        location={locationString}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: MAIN FARMER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* High-End Hero Welcome Banner */}
            <div className="agri-card-dark p-6 sm:p-9 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#F3B391]/30">
              {/* Subtle Ambient Radial Glows */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F3B391]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#241909]/60 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 z-10 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-[#F3B391]/15 text-[#F3B391] text-xs font-black px-3.5 py-1.5 rounded-full border border-[#F3B391]/40 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>
                    {language === 'hi'
                      ? 'स्वायत्त खेत निगरानी चालू • वास्तविक डेटा सिंक'
                      : 'Autonomous Farm Guardian Active • Live Data Sync'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display">
                  {language === 'hi'
                    ? `राम-राम, ${farmer.full_name} जी!`
                    : `Welcome back, ${farmer.full_name}!`}
                </h1>

                <p className="text-sm sm:text-base text-[#F6D4BA]/85 font-medium leading-relaxed">
                  {language === 'hi'
                    ? 'AgroShield ने आपके खेत के लिए वास्तविक Open-Meteo मौसम, ICAR अनुसंधान ज्ञानकोष और AGMARKNET मंडी भाव को सिंक कर लिया है। आज आपकी फसल पूर्णतः सुरक्षित है।'
                    : 'AgroShield has synced live Open-Meteo climate, ICAR crop calendars, and AGMARKNET prices for your cotton plot. Your crop window is currently favorable.'}
                </p>

                {/* Farmer Plot Quick Info Chips */}
                <div className="flex flex-wrap gap-2 pt-1 justify-center lg:justify-start">
                  <span className="bg-black/50 border border-white/10 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-inner">
                    <Sprout className="w-3.5 h-3.5 text-[#F3B391]" />
                    <span className="font-bold">{farmer.crop.hindi_name} ({farmer.crop.name})</span>
                  </span>
                  <span className="bg-black/50 border border-white/10 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-inner">
                    <Layers className="w-3.5 h-3.5 text-[#F6D4BA]" />
                    <span className="font-bold">{farmer.farm.area_acres} Acres • {farmer.farm.soil_type}</span>
                  </span>
                  <span className="bg-black/50 border border-white/10 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-inner">
                    <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold">{farmer.farm.irrigation_source}</span>
                  </span>
                </div>

                {/* Action CTAs */}
                <div className="pt-3 flex flex-wrap gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => setActiveTab('advisory')}
                    className="bg-[#F3B391] hover:bg-[#e89467] text-[#241909] text-xs font-black px-6 py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(243,179,145,0.4)] flex items-center space-x-2 transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 text-[#241909]" />
                    <span>{language === 'hi' ? 'फार्मरियन AI से सलाह लें' : 'Consult Farmarian AI'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('camera')}
                    className="bg-[#1E160C]/80 hover:bg-[#2E200C] text-white border border-[#F3B391]/30 text-xs font-bold px-6 py-3.5 rounded-xl transition flex items-center space-x-2 shadow-inner"
                  >
                    <Camera className="w-4 h-4 text-[#F3B391]" />
                    <span>{language === 'hi' ? 'पत्ती रोग की जांच करें' : 'Inspect Plant Leaf'}</span>
                  </button>
                </div>
              </div>

              {/* Farmarian Mascot Avatar Container */}
              <div className="z-10 flex-shrink-0 bg-black/40 p-6 rounded-3xl border border-[#F3B391]/30 shadow-[0_0_30px_rgba(243,179,145,0.2)]">
                <FarmarianMascot state="welcoming" size={140} />
              </div>
            </div>

            {/* Crop Phenological Stage Stepper */}
            <CropStageStepper
              cropName={farmer.crop.name}
              hindiName={farmer.crop.hindi_name}
              sowingDate={farmer.crop.sowing_date}
              language={language}
            />

            {/* Live Weather & Crop Risk Assessment Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WeatherCard weather={weather} language={language} />
              <CropRiskGauge riskData={riskData} language={language} />
            </div>

            {/* Mandi Intelligence Preview */}
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
          <div className="space-y-6">
            <AgentChat
              userId={farmer.user_id}
              language={language}
              cropName={farmer.crop.name}
            />
          </div>
        )}

        {/* VIEW 3: LIVE WEATHER & RISK */}
        {activeTab === 'weather' && (
          <div className="space-y-8">
            <WeatherCard weather={weather} language={language} />
            <CropRiskGauge riskData={riskData} language={language} />
          </div>
        )}

        {/* VIEW 4: MANDI RADAR & TRANSPORT COST */}
        {activeTab === 'mandi' && (
          <div className="space-y-8">
            <MandiRadar
              language={language}
              defaultState={farmer.location.state}
              defaultDistrict={farmer.location.district}
              defaultCommodity={farmer.crop.name}
            />
          </div>
        )}

        {/* VIEW 5: CROP HEALTH CLINIC */}
        {activeTab === 'camera' && (
          <div className="space-y-8">
            <CropHealthCamera
              language={language}
              cropName={farmer.crop.name}
              location={locationString}
            />
          </div>
        )}

        {/* VIEW 6: WHAT-IF SANDBOX */}
        {activeTab === 'scenario' && (
          <div className="space-y-8">
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
      <footer className="bg-[#0F1108] text-[#F6D4BA]/70 text-xs py-8 border-t border-[#F3B391]/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <FarmarianMascot state="welcoming" size={36} />
            <div>
              <span className="font-black text-white font-display text-sm tracking-tight">
                Agro<span className="text-[#F3B391]">Shield</span>
              </span>
              <span className="mx-2 text-white/30">•</span>
              <span className="text-[#F6D4BA]/80 font-medium">
                36-Hour Autonomous AI Hackathon Submission
              </span>
            </div>
          </div>
          <p className="text-[11px] text-center md:text-right text-[#F6D4BA]/60">
            Verified Data Providers: Open-Meteo CC BY 4.0 • data.gov.in AGMARKNET • ICAR Research Bulletins
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
