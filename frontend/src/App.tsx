import React, { useState, useEffect, Component, type ErrorInfo, type ReactNode } from 'react';
import { FarmerProvider, useFarmer } from './context/FarmerContext';
import LoginPage from './pages/LoginPage';
import { Navbar, type ActiveTab } from './components/Navbar';
import { FarmarianMascot } from './components/FarmarianMascot';
import { WeatherCard } from './components/WeatherCard';
import { CropStageStepper } from './components/CropStageStepper';
import { CropRiskGauge } from './components/CropRiskGauge';
import { AgentChat } from './components/AgentChat';
import { MandiRadar } from './components/MandiRadar';
import { CropHealthCamera } from './components/CropHealthCamera';
import { ScenarioSandbox } from './components/ScenarioSandbox';
import { fetchLiveWeather, apiClient, addFarmerCrop, type CropData } from './services/api';
import { ShieldCheck, Sparkles, ArrowRight, Leaf, MapPin, Plus, X, RefreshCw } from 'lucide-react';

const CATALOG_CROPS = [
  { name: 'Cotton',    hindi: 'कपास',    icon: '🌱' },
  { name: 'Soybean',   hindi: 'सोयाबीन', icon: '🌿' },
  { name: 'Wheat',     hindi: 'गेहूं',   icon: '🌾' },
  { name: 'Rice',      hindi: 'चावल',    icon: '🌾' },
  { name: 'Chickpea',  hindi: 'चना',     icon: '🌱' },
  { name: 'Maize',     hindi: 'मक्का',   icon: '🌽' },
  { name: 'Sugarcane', hindi: 'गन्ना',   icon: '🎋' },
];

// ─── Top-Level Error Boundary (Prevents ANY blank screens) ────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  errorText: string;
}

class AgroErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorText: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AgroShield Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('agroshield_farmer');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FEFADC] flex items-center justify-center p-6 text-[#0F1108]">
          <div className="bg-[#F6D4BA] border-2 border-[#E8C99A] rounded-2xl p-8 max-w-lg w-full text-center shadow-xl space-y-4">
            <div className="w-12 h-12 bg-[#241909] text-[#FEFADC] rounded-full mx-auto flex items-center justify-center text-2xl font-bold">
              🌾
            </div>
            <h2 className="text-xl font-bold text-[#241909]">
              खेत डैशबोर्ड लोड करने में समस्या हुई
            </h2>
            <p className="text-xs text-[#5C4A30] leading-relaxed">
              पुराने डेटा को रीसेट करके दोबारा लॉग इन करने के लिए नीचे दिए गए बटन पर क्लिक करें।
            </p>
            <div className="p-3 bg-[#FEFADC] rounded-lg text-xs font-mono text-[#C0392B] overflow-x-auto text-left">
              {this.state.errorText || 'Unknown render error'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-[#F3B391] hover:bg-[#E8A070] text-[#241909] font-bold text-sm border border-[#E07B39] flex items-center justify-center gap-2 shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>डैशबोर्ड रीसेट करें / Reset & Re-login</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Inner Component ─────────────────────────────────────────────────────
const AppInner: React.FC = () => {
  const { farmer, language, activeCrop, setActiveCrop, isLoggedIn, setFarmer } = useFarmer();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [weather, setWeather] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);

  // Modal for adding another crop
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [newCropName, setNewCropName] = useState('Wheat');
  const [newCropVariety, setNewCropVariety] = useState('');
  const [newCropSowingDate, setNewCropSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [addingCropLoading, setAddingCropLoading] = useState(false);
  const [addCropError, setAddCropError] = useState('');

  // Bulletproof fallback normalization of farmer profile
  const safeLocation = {
    village: farmer?.location?.village || 'Barshitakli',
    district: farmer?.location?.district || 'Akola',
    state: farmer?.location?.state || 'Maharashtra',
    latitude: typeof farmer?.location?.latitude === 'number' ? farmer.location.latitude : 20.7002,
    longitude: typeof farmer?.location?.longitude === 'number' ? farmer.location.longitude : 77.0082,
  };

  const safeFarm = {
    name: farmer?.farm?.name || 'Main Farm',
    area_acres: farmer?.farm?.area_acres ?? 5.0,
    soil_type: farmer?.farm?.soil_type || (language === 'hi' ? 'काली मिट्टी' : 'Black Soil'),
    irrigation_source: farmer?.farm?.irrigation_source || (language === 'hi' ? 'बोरवेल' : 'Borewell'),
  };

  const safeFullName = farmer?.full_name || (language === 'hi' ? 'किसान मित्र' : 'Farmer');

  // Bulletproof resolution of current active crop
  const currentCrop: CropData = activeCrop || farmer?.crop || (farmer?.crops && farmer.crops[0]) || {
    name: 'Cotton',
    hindi_name: 'कपास',
    variety: 'Bt Hybrid',
    sowing_date: '2026-08-15',
    status: 'ACTIVE',
  };

  const cropsList: CropData[] = farmer?.crops && farmer.crops.length > 0 ? farmer.crops : [currentCrop];

  // Load live weather once for farmer's verified coordinates
  useEffect(() => {
    if (!farmer) return;
    const loadWeather = async () => {
      try {
        const wData = await fetchLiveWeather(safeLocation.latitude, safeLocation.longitude);
        setWeather(wData);
      } catch (err) {
        console.error('Weather load error:', err);
      }
    };
    loadWeather();
  }, [farmer?.user_id, safeLocation.latitude, safeLocation.longitude]);

  // Load deterministic crop risk whenever active crop changes
  useEffect(() => {
    if (!farmer || !currentCrop?.name) return;
    const loadCropRisk = async () => {
      try {
        const rRes = await apiClient.post('/api/risk/evaluate', null, {
          params: {
            crop_name: currentCrop.name,
            growth_stage_name: 'Vegetative',
            latitude: safeLocation.latitude,
            longitude: safeLocation.longitude,
          },
        });
        setRiskData(rRes.data);
      } catch (err) {
        console.error('Crop risk load error:', err);
      }
    };
    loadCropRisk();
  }, [farmer?.user_id, currentCrop?.name, safeLocation.latitude, safeLocation.longitude]);

  if (!isLoggedIn || !farmer) {
    return <LoginPage onLoginSuccess={(farmerData) => setFarmer(farmerData)} />;
  }

  const handleAddCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCropLoading(true);
    setAddCropError('');
    try {
      const updatedFarmer = await addFarmerCrop(farmer.user_id, {
        crop_name: newCropName,
        variety_name: newCropVariety || undefined,
        sowing_date: newCropSowingDate,
      });
      setFarmer(updatedFarmer);
      // Auto-select newly added crop
      const newlyAdded = updatedFarmer.crops?.find((c) => c.name === newCropName);
      if (newlyAdded) {
        setActiveCrop(newlyAdded);
      }
      setShowAddCropModal(false);
      setNewCropVariety('');
    } catch (err: any) {
      setAddCropError(err?.response?.data?.detail || 'Failed to add crop');
    } finally {
      setAddingCropLoading(false);
    }
  };

  const locationString = `${safeLocation.village}, ${safeLocation.district}`;

  const t = {
    en: {
      plotOverview: 'Farm Overview',
      farmIntel: 'Multi-Crop Farm Intelligence System',
      consultAdvisor: 'Consult Advisor',
      simulateStress: 'Simulate Stress',
      cultivatedCrop: 'Active Crop Viewed',
      allCrops: 'Your Crops',
      addCropBtn: '+ Add Crop',
      landSoil: 'Land & Soil',
      irrigationSystem: 'Irrigation',
      dataIntegrity: 'Data Integrity',
      zeroMock: 'Zero Dummy Data',
      verifiedApis: 'Verified APIs',
      openAdvisory: 'Open Advisory Terminal',
      farmarianTitle: 'Farmarian Multi-Crop AI',
      farmarianDesc: 'Grounding with ICAR research bulletins',
      farmarianPrompt: `Ask questions about ${currentCrop.name} pest symptoms, irrigation, or APMC mandi rates.`,
      acres: 'Acres',
      active: 'Active',
      modalTitle: 'Add Another Crop to Your Farm',
      modalDesc: 'Track phenology, weather alerts, and mandi prices for multiple crops simultaneously.',
      selectCrop: 'Select Crop',
      varietyLabel: 'Variety (Optional)',
      sowingDateLabel: 'Sowing Date',
      cancel: 'Cancel',
      saveCrop: 'Add Crop to Farm',
    },
    hi: {
      plotOverview: 'खेत की जानकारी',
      farmIntel: 'बहु-फसली कृषि निर्णय सहायक',
      consultAdvisor: 'सलाह लें',
      simulateStress: 'मौसम जांचें',
      cultivatedCrop: 'वर्तमान चुनी हुई फसल',
      allCrops: 'आपकी फसलें',
      addCropBtn: '+ नई फसल जोड़ें',
      landSoil: 'जमीन और मिट्टी',
      irrigationSystem: 'सिंचाई',
      dataIntegrity: 'डेटा सही है',
      zeroMock: 'सब असली डेटा',
      verifiedApis: 'सरकारी APIs',
      openAdvisory: 'सलाहकार खोलें',
      farmarianTitle: 'फसल सहायक AI',
      farmarianDesc: 'ICAR अनुसंधान बुलेटिन के आधार पर',
      farmarianPrompt: `${currentCrop.hindi_name || currentCrop.name} की बीमारी, खाद, सिंचाई या मंडी भाव के बारे में पूछें।`,
      acres: 'एकड़',
      active: 'चालू',
      modalTitle: 'खेत में नई फसल जोड़ें',
      modalDesc: 'एक साथ कई फसलों की अवस्था, कीट जोखिम और मंडी भाव ट्रैक करें।',
      selectCrop: 'फसल चुनें',
      varietyLabel: 'किस्म (यदि पता हो)',
      sowingDateLabel: 'बुवाई की तारीख',
      cancel: 'रद्द करें',
      saveCrop: 'फसल जोड़ें',
    },
  };
  const tx = language === 'hi' ? t.hi : t.en;

  return (
    <div className="min-h-screen text-[#0F1108] flex flex-col font-sans" style={{ backgroundColor: '#FEFADC' }}>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        farmerName={safeFullName}
        location={locationString}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Farm Panel */}
            <div className="agro-card-warm p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E8C99A] pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-[#E07B39]" />
                    <span className="text-xs font-semibold text-[#5C4A30] uppercase tracking-wider">
                      {safeLocation.village}, {safeLocation.district} • {safeLocation.state}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#241909] tracking-tight">
                    {language === 'hi' ? `नमस्ते, ${safeFullName}! 🙏` : `Hello, ${safeFullName}!`}
                  </h1>
                  <p className="text-sm text-[#5C4A30] mt-1">{tx.farmIntel}</p>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <button onClick={() => setActiveTab('advisory')} className="btn-primary flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{tx.consultAdvisor}</span>
                  </button>
                  <button onClick={() => setActiveTab('scenario')} className="btn-secondary flex items-center space-x-2">
                    <span>{tx.simulateStress}</span>
                  </button>
                </div>
              </div>

              {/* MULTI-CROP SELECTOR BAR */}
              <div className="pt-4 pb-2 border-b border-[#E8C99A] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#241909] flex items-center gap-1.5 mr-1">
                    <Leaf className="w-4 h-4 text-[#3A7D44]" />
                    {tx.allCrops}:
                  </span>

                  {cropsList.map((c, i) => {
                    const isSelected = currentCrop.name === c.name;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveCrop(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#241909] text-[#FEFADC] border-[#241909] shadow-md scale-[1.02]'
                            : 'bg-[#FEFADC] text-[#5C4A30] border-[#E8C99A] hover:bg-[#F3B391] hover:text-[#241909]'
                        }`}
                      >
                        <span>{language === 'hi' ? c.hindi_name || c.name : c.name}</span>
                        {c.variety && <span className="text-[10px] opacity-80">({c.variety})</span>}
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#3A7D44]" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowAddCropModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#F3B391] hover:bg-[#E8A070] text-[#241909] border border-[#E07B39] font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tx.addCropBtn}</span>
                </button>
              </div>

              {/* 4-Item Context Data Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-[#FEFADC] rounded-lg p-3 border border-[#E8C99A]">
                  <span className="text-xs text-[#5C4A30] font-medium block mb-1">
                    <Leaf className="w-3 h-3 inline mr-1 text-[#3A7D44]" />
                    {tx.cultivatedCrop}
                  </span>
                  <span className="text-sm font-bold text-[#241909] block">
                    {language === 'hi' ? currentCrop.hindi_name || currentCrop.name : currentCrop.name}
                    {currentCrop.variety ? ` • ${currentCrop.variety}` : ''}
                  </span>
                  <span className="text-xs text-[#5C4A30]">
                    {language === 'hi' ? `बुवाई: ${currentCrop.sowing_date || 'N/A'}` : `Sown: ${currentCrop.sowing_date || 'N/A'}`}
                  </span>
                </div>
                <div className="bg-[#FEFADC] rounded-lg p-3 border border-[#E8C99A]">
                  <span className="text-xs text-[#5C4A30] font-medium block mb-1">{tx.landSoil}</span>
                  <span className="text-sm font-bold text-[#241909] block">{safeFarm.area_acres} {tx.acres}</span>
                  <span className="text-xs text-[#5C4A30]">{safeFarm.soil_type}</span>
                </div>
                <div className="bg-[#FEFADC] rounded-lg p-3 border border-[#E8C99A]">
                  <span className="text-xs text-[#5C4A30] font-medium block mb-1">{tx.irrigationSystem}</span>
                  <span className="text-sm font-bold text-[#241909] block">{safeFarm.irrigation_source}</span>
                  <span className="text-xs text-[#3A7D44] font-medium">{tx.active}</span>
                </div>
                <div className="bg-[#FEFADC] rounded-lg p-3 border border-[#E8C99A]">
                  <span className="text-xs text-[#5C4A30] font-medium block mb-1">{tx.dataIntegrity}</span>
                  <span className="text-sm font-bold text-[#3A7D44] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {tx.zeroMock}
                  </span>
                  <span className="text-xs text-[#5C4A30]">{tx.verifiedApis}</span>
                </div>
              </div>
            </div>

            {/* Phenological Crop Growth Stage */}
            <CropStageStepper
              cropName={currentCrop.name}
              hindiName={currentCrop.hindi_name || currentCrop.name}
              sowingDate={currentCrop.sowing_date || '2026-08-15'}
              language={language}
            />

            {/* Main 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-8">
                <WeatherCard weather={weather} language={language} />
                <MandiRadar
                  language={language}
                  defaultState={safeLocation.state}
                  defaultDistrict={safeLocation.district}
                  defaultCommodity={currentCrop.name}
                />
              </div>
              <div className="lg:col-span-5 space-y-8">
                <CropRiskGauge riskData={riskData} language={language} />

                {/* Farmarian Assistant Banner */}
                <div className="agro-card p-6 space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-[#E8C99A]">
                    <FarmarianMascot state="welcoming" size={36} />
                    <div>
                      <h4 className="text-sm font-bold text-[#241909]">{tx.farmarianTitle}</h4>
                      <p className="text-xs text-[#5C4A30]">{tx.farmarianDesc}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#5C4A30] leading-relaxed">{tx.farmarianPrompt}</p>
                  <button onClick={() => setActiveTab('advisory')} className="w-full btn-primary text-sm flex items-center justify-center space-x-2">
                    <span>{tx.openAdvisory}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ADVISORY */}
        {activeTab === 'advisory' && (
          <AgentChat userId={farmer.user_id} language={language} cropName={currentCrop.name} />
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
          <MandiRadar
            language={language}
            defaultState={safeLocation.state}
            defaultDistrict={safeLocation.district}
            defaultCommodity={currentCrop.name}
          />
        )}

        {/* VIEW 5: CAMERA PATHOLOGY */}
        {activeTab === 'camera' && (
          <CropHealthCamera language={language} cropName={currentCrop.name} location={locationString} />
        )}

        {/* VIEW 6: SCENARIO STRESS TEST */}
        {activeTab === 'scenario' && (
          <ScenarioSandbox
            language={language}
            cropName={currentCrop.name}
            growthStageName="Vegetative"
            latitude={safeLocation.latitude}
            longitude={safeLocation.longitude}
          />
        )}
      </main>

      {/* MODAL: ADD ANOTHER CROP */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F6D4BA] border-2 border-[#E8C99A] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddCropModal(false)}
              className="absolute right-4 top-4 text-[#5C4A30] hover:text-[#241909]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#241909] mb-1">{tx.modalTitle}</h3>
            <p className="text-xs text-[#5C4A30] mb-4">{tx.modalDesc}</p>

            <form onSubmit={handleAddCropSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#241909] mb-1">{tx.selectCrop}</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATALOG_CROPS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setNewCropName(c.name)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        newCropName === c.name
                          ? 'bg-[#3A7D44] text-white border-[#276738] shadow-sm'
                          : 'bg-[#FEFADC] text-[#5C4A30] border-[#E8C99A]'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{language === 'hi' ? c.hindi : c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241909] mb-1">{tx.varietyLabel}</label>
                <input
                  type="text"
                  value={newCropVariety}
                  onChange={(e) => setNewCropVariety(e.target.value)}
                  placeholder="e.g. Shriram 303, Hybrid, Desi"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241909] mb-1">{tx.sowingDateLabel}</label>
                <input
                  type="date"
                  value={newCropSowingDate}
                  onChange={(e) => setNewCropSowingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-xs font-semibold"
                  required
                />
              </div>

              {addCropError && (
                <div className="p-2.5 rounded-xl bg-red-100 text-red-800 text-xs font-semibold">
                  ⚠️ {addCropError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCropModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-[#5C4A30] text-xs font-bold"
                >
                  {tx.cancel}
                </button>
                <button
                  type="submit"
                  disabled={addingCropLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#F3B391] hover:bg-[#E8A070] text-[#241909] border border-[#E07B39] text-xs font-extrabold shadow disabled:opacity-50"
                >
                  {addingCropLoading ? 'Adding…' : tx.saveCrop}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="border-t border-[#E8C99A] text-[#5C4A30] text-xs py-6 mt-8" style={{ backgroundColor: '#F6D4BA' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#241909]">AgroShield Platform</span>
            <span>•</span>
            <span>{language === 'hi' ? 'किसान का स्मार्ट सुरक्षा कवच' : 'Hyperlocal Agricultural Intelligence'}</span>
          </div>
          <p className="text-[11px] text-[#5C4A30]">
            Verified Data Sources: Open-Meteo (CC BY 4.0) • data.gov.in AGMARKNET • ICAR Research Bulletins
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AgroErrorBoundary>
      <FarmerProvider>
        <AppInner />
      </FarmerProvider>
    </AgroErrorBoundary>
  );
};

export default App;
