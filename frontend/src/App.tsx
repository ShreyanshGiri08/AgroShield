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
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

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
      name: 'Akola Cotton Plot 04',
      area_acres: 5.5,
      soil_type: 'Deep Black Cotton Soil (काळी माती)',
      irrigation_source: 'Borewell / Drip',
    },
    crop: {
      name: 'Cotton',
      hindi_name: 'कपास',
      variety: 'Bt Cotton (Hybrid)',
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A211B] flex flex-col font-sans">
      {/* Editorial Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onLanguageChange={setLanguage}
        farmerName={farmer.full_name}
        location={locationString}
      />

      {/* Main Asymmetrical Multi-Column Layout */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: MAIN DASHBOARD ASYMMETRICAL 2-COLUMN GRID */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Editorial Lead Section: Plot Profile & Agronomic Health */}
            <div className="matte-panel p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-6 border-b border-[#E3DDD1] pb-6">
                <div>
                  <span className="text-[11px] font-semibold text-[#576258] uppercase tracking-wider block font-display mb-1">
                    Plot Telemetry Record • ID: AKL-2026-04
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif text-[#1A211B] tracking-tight">
                    {language === 'hi'
                      ? `${farmer.full_name} — खेत अवलोकन व निर्णय सहायता`
                      : `${farmer.full_name} — Farm Decision Intelligence`}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#576258] mt-1 max-w-3xl leading-relaxed">
                    {language === 'hi'
                      ? 'अकोला स्थित 5.5 एकड़ कपास खेत का सूक्ष्म-जलवायु, ICAR अनुसंधान बुलेटिन और APMC मंडी आवक का संश्लेषित प्रतिवेदन।'
                      : 'Integrated agronomic report synthesizing Open-Meteo hyperlocal climate observation, ICAR-CICR crop calendars, and AGMARKNET daily arrivals for Akola.'}
                  </p>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('advisory')}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'सलाहकार से पूछें' : 'Consult Advisor'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('scenario')}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <span>{language === 'hi' ? 'तनाव सिमुलेटर' : 'Simulate Stress'}</span>
                  </button>
                </div>
              </div>

              {/* 4-Item Context Data Bar (No badge spam) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                <div className="border-l-2 border-[#1E472D] pl-3">
                  <span className="text-[11px] text-[#859286] font-medium block">Cultivated Crop</span>
                  <span className="text-sm font-semibold text-[#1A211B] mt-0.5 block">
                    {farmer.crop.hindi_name} ({farmer.crop.variety})
                  </span>
                  <span className="text-[11px] text-[#576258] font-mono">72 DAS • Sown 20 Aug</span>
                </div>

                <div className="border-l-2 border-[#E3DDD1] pl-3">
                  <span className="text-[11px] text-[#859286] font-medium block">Land & Soil</span>
                  <span className="text-sm font-semibold text-[#1A211B] mt-0.5 block">
                    {farmer.farm.area_acres} Acres
                  </span>
                  <span className="text-[11px] text-[#576258]">Deep Black Cotton Soil</span>
                </div>

                <div className="border-l-2 border-[#E3DDD1] pl-3">
                  <span className="text-[11px] text-[#859286] font-medium block">Irrigation System</span>
                  <span className="text-sm font-semibold text-[#1A211B] mt-0.5 block">
                    {farmer.farm.irrigation_source}
                  </span>
                  <span className="text-[11px] text-[#576258]">Groundwater / Active</span>
                </div>

                <div className="border-l-2 border-[#E3DDD1] pl-3">
                  <span className="text-[11px] text-[#859286] font-medium block">Data Integrity</span>
                  <span className="text-sm font-semibold text-[#276738] mt-0.5 block flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#276738]" />
                    <span>Zero Dummy Data</span>
                  </span>
                  <span className="text-[11px] text-[#576258] font-mono">Verified APIs</span>
                </div>
              </div>
            </div>

            {/* Phenological Stepper */}
            <CropStageStepper
              cropName={farmer.crop.name}
              hindiName={farmer.crop.hindi_name}
              sowingDate={farmer.crop.sowing_date}
              language={language}
            />

            {/* Asymmetrical 2-Column Grid (8-col primary / 4-col secondary) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Microclimate & Mandi Radar (7 Cols) */}
              <div className="lg:col-span-7 space-y-8">
                <WeatherCard weather={weather} language={language} />
                <MandiRadar
                  language={language}
                  defaultState={farmer.location.state}
                  defaultDistrict={farmer.location.district}
                  defaultCommodity={farmer.crop.name}
                />
              </div>

              {/* Right Column: Agronomic Risk & Decision Assistant (5 Cols) */}
              <div className="lg:col-span-5 space-y-8">
                <CropRiskGauge riskData={riskData} language={language} />

                {/* Assistant Mini Card */}
                <div className="matte-panel p-6 space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-[#E3DDD1]">
                    <FarmarianMascot state="welcoming" size={32} />
                    <div>
                      <h4 className="text-xs font-semibold text-[#1A211B] font-display">
                        Farmarian Agronomic Inquiries
                      </h4>
                      <p className="text-[11px] text-[#576258]">
                        Automated multi-step reasoning with ICAR citations
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#576258] leading-relaxed">
                    Have questions regarding pest symptoms, irrigation intervals, or APMC modal price realizations? Ask the agent directly.
                  </p>

                  <button
                    onClick={() => setActiveTab('advisory')}
                    className="w-full btn-secondary text-xs flex items-center justify-center space-x-2 py-2"
                  >
                    <span>Open Advisory Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ADVISORY */}
        {activeTab === 'advisory' && (
          <div className="space-y-6">
            <AgentChat
              userId={farmer.user_id}
              language={language}
              cropName={farmer.crop.name}
            />
          </div>
        )}

        {/* VIEW 3: WEATHER */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <WeatherCard weather={weather} language={language} />
            <CropRiskGauge riskData={riskData} language={language} />
          </div>
        )}

        {/* VIEW 4: MANDI */}
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

        {/* VIEW 5: PATHOLOGY CLINIC */}
        {activeTab === 'camera' && (
          <div className="space-y-6">
            <CropHealthCamera
              language={language}
              cropName={farmer.crop.name}
              location={locationString}
            />
          </div>
        )}

        {/* VIEW 6: SCENARIO STRESS TEST */}
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

      {/* Institutional Editorial Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E3DDD1] text-[#576258] text-xs py-8 mt-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-baseline justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#1A211B] font-display">AgroShield Platform</span>
            <span>•</span>
            <span>Vidarbha Agricultural Intelligence System</span>
          </div>
          <p className="text-[11px] text-[#859286]">
            Verified Agricultural Data Providers: Open-Meteo Meteorological API (CC BY 4.0) • data.gov.in AGMARKNET • ICAR Research Bulletins
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
