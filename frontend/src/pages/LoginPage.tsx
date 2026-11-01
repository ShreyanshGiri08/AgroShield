/**
 * LoginPage.tsx — AgroShield authentication & registration page.
 *
 * Secure password authentication + Multi-crop support.
 * Design tokens:
 *   Background    : #FEFADC  (Cornsilk warm yellow)
 *   Card bg       : #F6D4BA  (Desert Sand peach)
 *   Button primary: #F3B391  (Peach Glow) with text #0F1108
 *   Text          : #0F1108  (Pitch Black)
 *   Dark accent   : #241909  (Dark Coffee)
 */

import React, { useState, useCallback } from 'react';
import { loginFarmer, registerFarmer } from '../services/api';
import type { FarmerProfileData } from '../services/api';
import { Eye, EyeOff, Check, Trash2, ShieldCheck, MapPin } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'hi' | 'en';

interface LoginPageProps {
  onLoginSuccess: (farmer: FarmerProfileData) => void;
}

interface CropEntry {
  cropName: string;
  hindiName: string;
  variety: string;
  sowingDate: string;
}

// ─── Localised string table (simple, everyday Hindi) ──────────────────────────

const T: Record<string, { en: string; hi: string }> = {
  appName:          { en: 'AgroShield',                               hi: 'एग्रोशील्ड' },
  tagline:          { en: "Your Farm's Intelligent Protection System", hi: 'खेत का सच्चा और समझदार रक्षक' },
  loginTab:         { en: 'Login',                                     hi: 'लॉग इन' },
  registerTab:      { en: 'New Registration',                          hi: 'नया खाता बनाएं' },
  phoneLabel:       { en: 'Mobile Number',                             hi: 'मोबाइल नंबर' },
  phonePlaceholder: { en: '10-digit mobile number',                    hi: '10 अंकों का मोबाइल नंबर' },
  passwordLabel:    { en: 'Password',                                  hi: 'पासवर्ड' },
  passwordPlaceholder:{ en: 'Enter your password',                     hi: 'अपना पासवर्ड डालें' },
  confirmPassLabel: { en: 'Confirm Password',                          hi: 'पासवर्ड दोबारा डालें' },
  loginBtn:         { en: 'Secure Login',                              hi: 'सुरक्षित लॉग इन करें' },
  notFound:         { en: 'Account not found. Please register.',       hi: 'खाता नहीं मिला। कृपया पहले नया खाता बनाएं।' },
  wrongPass:        { en: 'Incorrect password. Please try again.',     hi: 'पासवर्ड गलत है। कृपया सही पासवर्ड डालें।' },
  loading:          { en: 'Verifying…',                                hi: 'जांच हो रही है…' },
  error:            { en: 'Something went wrong. Please try again.',   hi: 'कुछ गड़बड़ हो गई। दोबारा कोशिश करें।' },
  // register steps
  step1Title:       { en: 'Step 1 — Personal & Security',              hi: 'चरण 1 — व्यक्तिगत व सुरक्षा जानकारी' },
  step2Title:       { en: 'Step 2 — Location Details',                 hi: 'चरण 2 — खेत का स्थान' },
  step3Title:       { en: 'Step 3 — Land & Multiple Crops',            hi: 'चरण 3 — जमीन व आपकी फसलें' },
  fullName:         { en: 'Full Name',                                 hi: 'पूरा नाम' },
  namePlaceholder:  { en: 'e.g. Ramesh Patel',                         hi: 'जैसे: रमेश पटेल' },
  langLabel:        { en: 'Preferred Language',                        hi: 'पसंदीदा भाषा' },
  stateLabel:       { en: 'State',                                     hi: 'राज्य' },
  districtLabel:    { en: 'District',                                  hi: 'जिला' },
  villageLabel:     { en: 'Village',                                   hi: 'गांव' },
  gpsBtn:           { en: '📍 Get GPS Coordinates',                    hi: '📍 अपना स्थान लें' },
  gpsGetting:       { en: 'Capturing GPS…',                            hi: 'स्थान मिल रहा है…' },
  gpsSuccess:       { en: '✅ Location verified',                      hi: '✅ स्थान मिल गया' },
  gpsFail:          { en: 'GPS unavailable. Please enter manually.',   hi: 'GPS नहीं मिला। मैन्युअल भरें।' },
  farmArea:         { en: 'Total Farm Area (Acres)',                   hi: 'कुल खेत (एकड़)' },
  soilType:         { en: 'Soil Type',                                 hi: 'मिट्टी का प्रकार' },
  irrigation:       { en: 'Irrigation Source',                         hi: 'सिंचाई का साधन' },
  cropsSelectionTitle:{ en: 'Select All Crops You Cultivate:',         hi: 'जो भी फसलें आप उगाते हैं, चुनें:' },
  addMoreCrop:      { en: '+ Add Another Crop',                        hi: '+ अन्य फसल जोड़ें' },
  cropName:         { en: 'Crop',                                      hi: 'फसल' },
  variety:          { en: 'Variety (Optional)',                        hi: 'किस्म (वैकल्पिक)' },
  sowingDate:       { en: 'Sowing Date',                               hi: 'बुवाई की तारीख' },
  back:             { en: 'Back',                                      hi: 'वापस' },
  next:             { en: 'Next →',                                    hi: 'आगे →' },
  submit:           { en: 'Complete & Enter Farm Dashboard',           hi: 'खाता बनाएं और खेत देखें' },
  submitting:       { en: 'Creating account…',                         hi: 'खाता बन रहा है…' },
  phoneInvalid:     { en: 'Please enter a valid 10-digit number.',     hi: 'कृपया 10 अंकों का सही मोबाइल नंबर डालें।' },
  passInvalid:      { en: 'Password must be at least 4 characters.',   hi: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' },
  passMismatch:     { en: 'Passwords do not match.',                   hi: 'दोनों पासवर्ड एक जैसे नहीं हैं।' },
  nameInvalid:      { en: 'Please enter your full name.',              hi: 'कृपया अपना पूरा नाम डालें।' },
  locationInvalid:  { en: 'Please fill State, District, and Village.',  hi: 'कृपया राज्य, जिला और गांव भरें।' },
  cropsEmpty:       { en: 'Please select at least one cultivated crop.',hi: 'कम से कम एक फसल ज़रूर चुनें।' },
};

const t = (key: string, lang: Lang): string => T[key]?.[lang] ?? T[key]?.en ?? key;

// ─── Available Crop Catalog ───────────────────────────────────────────────────

const AVAILABLE_CROPS = [
  { name: 'Cotton',    hindi: 'कपास',    icon: '🌱' },
  { name: 'Soybean',   hindi: 'सोयाबीन', icon: '🌿' },
  { name: 'Wheat',     hindi: 'गेहूं',   icon: '🌾' },
  { name: 'Rice',      hindi: 'चावल',    icon: '🌾' },
  { name: 'Chickpea',  hindi: 'चना',     icon: '🌱' },
  { name: 'Maize',     hindi: 'मक्का',   icon: '🌽' },
  { name: 'Sugarcane', hindi: 'गन्ना',   icon: '🎋' },
];

const SOIL_OPTIONS = [
  { value: 'Black Soil',  en: 'Black Soil (काळी माती)',  hi: 'काली मिट्टी (कपास हेतु उत्तम)' },
  { value: 'Red Soil',    en: 'Red Soil',               hi: 'लाल मिट्टी' },
  { value: 'Alluvial',    en: 'Alluvial Soil',          hi: 'जलोढ़ मिट्टी' },
  { value: 'Sandy',       en: 'Sandy / Loamy',          hi: 'रेतीली / दोमट मिट्टी' },
];

const IRRIGATION_OPTIONS = [
  { value: 'Borewell',  en: 'Borewell / Tube well', hi: 'बोरवेल / ट्यूबवेल' },
  { value: 'Canal',     en: 'Canal',                hi: 'नहर' },
  { value: 'Drip',      en: 'Drip / Sprinkler',     hi: 'ड्रिप / फव्वारा' },
  { value: 'Rainfed',   en: 'Rainfed (Barani)',     hi: 'बारिश पर निर्भर' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [lang, setLang] = useState<Lang>('hi');
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register multi-step form state
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Step 2: Location
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Akola');
  const [village, setVillage] = useState('Barshitakli');
  const [latitude, setLatitude] = useState<number>(20.7002);
  const [longitude, setLongitude] = useState<number>(77.0082);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'getting' | 'ok' | 'fail'>('idle');

  // Step 3: Land & Multiple Crops
  const [farmArea, setFarmArea] = useState('5.0');
  const [soilType, setSoilType] = useState('Black Soil');
  const [irrigationSource, setIrrigationSource] = useState('Borewell');
  
  // Multi-crop list (defaults with Cotton, and farmer can add/remove more)
  const [selectedCrops, setSelectedCrops] = useState<CropEntry[]>([
    { cropName: 'Cotton', hindiName: 'कपास', variety: 'Bt Hybrid', sowingDate: '2026-08-15' },
    { cropName: 'Soybean', hindiName: 'सोयाबीन', variety: 'JS 335', sowingDate: '2026-07-20' },
  ]);

  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const T_ = (key: string) => t(key, lang);

  // ── Handle Secure Login ─────────────────────────────────────────────────────
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanPhone = loginPhone.trim();

    if (!/^\d{10}$/.test(cleanPhone)) {
      setLoginError(T_('phoneInvalid'));
      return;
    }
    if (!loginPassword) {
      setLoginError(T_('passInvalid'));
      return;
    }

    setLoginLoading(true);
    try {
      const data = await loginFarmer(cleanPhone, loginPassword);
      onLoginSuccess(data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setLoginError(T_('notFound'));
      } else if (status === 401) {
        setLoginError(T_('wrongPass'));
      } else {
        setLoginError(err?.response?.data?.detail || T_('error'));
      }
    } finally {
      setLoginLoading(false);
    }
  }, [loginPhone, loginPassword, lang, onLoginSuccess]);

  // ── Handle GPS ──────────────────────────────────────────────────────────────
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('fail');
      return;
    }
    setGpsStatus('getting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(4)));
        setLongitude(Number(pos.coords.longitude.toFixed(4)));
        setGpsStatus('ok');
      },
      () => setGpsStatus('fail'),
      { timeout: 8000 }
    );
  };

  // ── Step Navigation & Validation ────────────────────────────────────────────
  const validateStep = (currentStep: number): boolean => {
    setRegError('');
    if (currentStep === 1) {
      if (!fullName.trim()) { setRegError(T_('nameInvalid')); return false; }
      if (!/^\d{10}$/.test(regPhone.trim())) { setRegError(T_('phoneInvalid')); return false; }
      if (regPassword.length < 4) { setRegError(T_('passInvalid')); return false; }
      if (regPassword !== confirmPassword) { setRegError(T_('passMismatch')); return false; }
    }
    if (currentStep === 2) {
      if (!state.trim() || !district.trim() || !village.trim()) {
        setRegError(T_('locationInvalid'));
        return false;
      }
    }
    if (currentStep === 3) {
      if (selectedCrops.length === 0) {
        setRegError(T_('cropsEmpty'));
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const goBack = () => {
    setRegError('');
    setStep((s) => Math.max(1, s - 1));
  };

  // ── Crop Management Functions ───────────────────────────────────────────────
  const toggleCrop = (cropMeta: typeof AVAILABLE_CROPS[0]) => {
    const existingIndex = selectedCrops.findIndex((c) => c.cropName === cropMeta.name);
    if (existingIndex >= 0) {
      // Don't allow removing if it's the only one left
      if (selectedCrops.length === 1) {
        setRegError(T_('cropsEmpty'));
        return;
      }
      setSelectedCrops(selectedCrops.filter((_, idx) => idx !== existingIndex));
    } else {
      setSelectedCrops([
        ...selectedCrops,
        {
          cropName: cropMeta.name,
          hindiName: cropMeta.hindi,
          variety: '',
          sowingDate: new Date().toISOString().split('T')[0],
        },
      ]);
    }
  };

  const updateCropField = (index: number, field: keyof CropEntry, value: string) => {
    const updated = [...selectedCrops];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedCrops(updated);
  };

  const removeCrop = (index: number) => {
    if (selectedCrops.length <= 1) {
      setRegError(T_('cropsEmpty'));
      return;
    }
    setSelectedCrops(selectedCrops.filter((_, idx) => idx !== index));
  };

  // ── Handle Final Registration ───────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validateStep(3)) return;

    setRegLoading(true);
    setRegError('');

    try {
      const payload = {
        full_name: fullName.trim(),
        phone_number: regPhone.trim(),
        password: regPassword,
        preferred_language: lang,
        state: state.trim(),
        district: district.trim(),
        village: village.trim(),
        latitude,
        longitude,
        farm_name: `${district} Farm Plot`,
        area_acres: parseFloat(farmArea) || 5.0,
        soil_type: soilType,
        irrigation_source: irrigationSource,
        crops: selectedCrops.map((c) => ({
          crop_name: c.cropName,
          variety_name: c.variety || undefined,
          sowing_date: c.sowingDate || new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
        })),
      };

      const data = await registerFarmer(payload);
      onLoginSuccess(data);
    } catch (err: any) {
      setRegError(err?.response?.data?.detail || T_('error'));
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFADC] flex flex-col justify-between p-4 sm:p-6 text-[#0F1108]">
      {/* Top Bar: Brand & Language Toggle */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#E8C99A]">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-[#241909] text-[#FEFADC] flex items-center justify-center font-bold text-lg shadow">
            🌾
          </div>
          <div>
            <h1 className="font-semibold text-xl tracking-tight text-[#241909]">AgroShield</h1>
            <p className="text-[11px] text-[#5C4A30] font-medium hidden sm:block">{T_('tagline')}</p>
          </div>
        </div>

        {/* Big Vernacular Language Switcher */}
        <div className="flex items-center bg-[#F6D4BA] p-1 rounded-xl border border-[#E8C99A]">
          <button
            onClick={() => setLang('hi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              lang === 'hi' ? 'bg-[#241909] text-[#FEFADC] shadow-sm' : 'text-[#5C4A30] hover:text-[#241909]'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              lang === 'en' ? 'bg-[#241909] text-[#FEFADC] shadow-sm' : 'text-[#5C4A30] hover:text-[#241909]'
            }`}
          >
            English
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto my-6">
        <div className="bg-[#F6D4BA] border border-[#E8C99A] rounded-2xl shadow-lg overflow-hidden p-6 sm:p-8">
          {/* Tabs: Login / Register */}
          <div className="flex bg-[#FEFADC] p-1.5 rounded-xl border border-[#E8C99A] mb-6">
            <button
              onClick={() => { setTab('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'login' ? 'bg-[#F3B391] text-[#241909] shadow' : 'text-[#5C4A30] hover:text-[#241909]'
              }`}
            >
              {T_('loginTab')}
            </button>
            <button
              onClick={() => { setTab('register'); setRegError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'register' ? 'bg-[#F3B391] text-[#241909] shadow' : 'text-[#5C4A30] hover:text-[#241909]'
              }`}
            >
              {T_('registerTab')}
            </button>
          </div>

          {/* TAB 1: SECURE LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#241909] mb-1">
                  {T_('phoneLabel')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-[#5C4A30]">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={T_('phonePlaceholder')}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-[#0F1108] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241909] mb-1">
                  {T_('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={T_('passwordPlaceholder')}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-[#0F1108] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-[#5C4A30] hover:text-[#241909]"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#F3B391] hover:bg-[#E8A070] text-[#241909] font-semibold text-sm border-2 border-[#E07B39] shadow transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {loginLoading ? T_('loading') : T_('loginBtn')}
              </button>

              <div className="pt-3 text-center border-t border-[#E8C99A]">
                <p className="text-xs text-[#5C4A30]">
                  {lang === 'hi' ? 'नया किसान खाता खोलना चाहते हैं?' : 'New to AgroShield?'}
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="ml-1.5 font-bold text-[#241909] underline"
                  >
                    {T_('registerTab')}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: MULTI-STEP REGISTRATION WITH MULTIPLE CROPS */}
          {tab === 'register' && (
            <div className="space-y-5">
              {/* Step indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8C99A]">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        step === s
                          ? 'bg-[#241909] text-[#FEFADC]'
                          : step > s
                          ? 'bg-[#3A7D44] text-white'
                          : 'bg-[#FEFADC] text-[#5C4A30] border border-[#E8C99A]'
                      }`}
                    >
                      {step > s ? '✓' : s}
                    </div>
                    <span className={`text-xs font-bold hidden sm:inline ${step === s ? 'text-[#241909]' : 'text-[#5C4A30]'}`}>
                      {s === 1 ? (lang === 'hi' ? 'पहचान व पासवर्ड' : 'Account') : s === 2 ? (lang === 'hi' ? 'स्थान' : 'Location') : (lang === 'hi' ? 'फसलें' : 'Crops')}
                    </span>
                  </div>
                ))}
              </div>

              {/* STEP 1: Personal & Security */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#241909]">{T_('step1Title')}</h3>

                  <div>
                    <label className="block text-xs font-bold text-[#241909] mb-1">{T_('fullName')}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={T_('namePlaceholder')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#241909] mb-1">{T_('phoneLabel')}</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-sm font-bold text-[#5C4A30]">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={T_('phonePlaceholder')}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('passwordLabel')}</label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 4 characters"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3.5 top-3 text-[#5C4A30]"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('confirmPassLabel')}</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    className="w-full py-3 rounded-xl bg-[#F3B391] hover:bg-[#E8A070] text-[#241909] font-bold text-sm border-2 border-[#E07B39] shadow transition-all mt-2"
                  >
                    {T_('next')}
                  </button>
                </div>
              )}

              {/* STEP 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#241909]">{T_('step2Title')}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('stateLabel')}</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('districtLabel')}</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('villageLabel')}</label>
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* GPS Button */}
                  <div className="bg-[#FEFADC] p-3.5 rounded-xl border border-[#E8C99A] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#241909] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E07B39]" />
                        {latitude}, {longitude}
                      </span>
                      <span className="text-[10px] text-[#5C4A30] block">
                        {lang === 'hi' ? 'सटीक मौसम व मंडी भाव के लिए GPS आवश्यक है' : 'Hyperlocal coordinates for live weather & mandis'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGPS}
                      disabled={gpsStatus === 'getting'}
                      className="px-3 py-1.5 rounded-lg bg-[#F3B391] hover:bg-[#E8A070] text-xs font-bold text-[#241909] border border-[#E07B39]"
                    >
                      {gpsStatus === 'getting' ? T_('gpsGetting') : gpsStatus === 'ok' ? T_('gpsSuccess') : T_('gpsBtn')}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex-1 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-[#5C4A30] font-bold text-sm"
                    >
                      {T_('back')}
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex-1 py-2.5 rounded-xl bg-[#F3B391] hover:bg-[#E8A070] text-[#241909] font-bold text-sm border-2 border-[#E07B39]"
                    >
                      {T_('next')}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Land & Multiple Crops */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#241909]">{T_('step3Title')}</h3>

                  {/* Farm Land Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('farmArea')}</label>
                      <input
                        type="number"
                        step="0.5"
                        value={farmArea}
                        onChange={(e) => setFarmArea(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('soilType')}</label>
                      <select
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-xs font-semibold"
                      >
                        {SOIL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {lang === 'hi' ? o.hi : o.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#241909] mb-1">{T_('irrigation')}</label>
                      <select
                        value={irrigationSource}
                        onChange={(e) => setIrrigationSource(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-xs font-semibold"
                      >
                        {IRRIGATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {lang === 'hi' ? o.hi : o.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* MULTI-CROP SELECTOR */}
                  <div>
                    <label className="block text-xs font-bold text-[#241909] mb-1.5">
                      {T_('cropsSelectionTitle')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_CROPS.map((c) => {
                        const isSelected = selectedCrops.some((sc) => sc.cropName === c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => toggleCrop(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                              isSelected
                                ? 'bg-[#3A7D44] text-white border-[#276738] shadow-sm'
                                : 'bg-[#FEFADC] text-[#5C4A30] border-[#E8C99A] hover:border-[#D4A876]'
                            }`}
                          >
                            <span>{c.icon}</span>
                            <span>{lang === 'hi' ? c.hindi : c.name}</span>
                            {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configured Crops Details Cards */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-bold text-[#5C4A30] uppercase tracking-wide block">
                      {lang === 'hi' ? 'चुनी गई फसलों की जानकारी (बुवाई व किस्म):' : 'Cultivated Crops Details:'}
                    </span>

                    {selectedCrops.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#FEFADC] border border-[#E8C99A] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-[#F3B391] text-[#241909] font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-[#241909] text-sm">
                            {lang === 'hi' ? c.hindiName : c.cropName}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 flex-1 sm:max-w-xs">
                          <div>
                            <input
                              type="text"
                              value={c.variety}
                              onChange={(e) => updateCropField(idx, 'variety', e.target.value)}
                              placeholder={lang === 'hi' ? 'किस्म (जैसे Bt)' : 'Variety'}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8C99A] bg-white text-xs"
                            />
                          </div>
                          <div>
                            <input
                              type="date"
                              value={c.sowingDate}
                              onChange={(e) => updateCropField(idx, 'sowingDate', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-[#E8C99A] bg-white text-xs"
                            />
                          </div>
                        </div>

                        {selectedCrops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCrop(idx)}
                            className="text-[#C0392B] hover:text-red-700 p-1 self-end sm:self-center"
                            title="Remove Crop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex-1 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FEFADC] text-[#5C4A30] font-bold text-sm"
                    >
                      {T_('back')}
                    </button>
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={regLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#F3B391] hover:bg-[#E8A070] text-[#241909] font-semibold text-sm border-2 border-[#E07B39] shadow disabled:opacity-50"
                    >
                      {regLoading ? T_('submitting') : T_('submit')}
                    </button>
                  </div>
                </div>
              )}

              {regError && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
                  ⚠️ {regError}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer provenance */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-[#5C4A30] pt-4 border-t border-[#E8C99A]">
        <div className="flex items-center justify-center space-x-1 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#3A7D44]" />
          <span className="font-bold text-[#241909]">AgroShield Security & Integrity Guarantee</span>
        </div>
        <p className="text-[11px]">
          {lang === 'hi'
            ? 'पासवर्ड सुरक्षित डेटा • एक साथ कई फसलों का विश्लेषण • 100% असली सरकारी व मौसमी डेटा'
            : 'Encrypted farmer passwords • Multi-crop phenology • Real Open-Meteo, data.gov.in & ICAR datasets'}
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
