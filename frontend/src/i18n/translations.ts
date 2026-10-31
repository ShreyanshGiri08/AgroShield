// AgroShield — Single Source of Truth for all UI strings
// Rules: Hindi must be SIMPLE everyday farmer-friendly words.
// NO academic/literary Hindi. Use what a village farmer understands.

export type Language = 'en' | 'hi';

export interface TranslationMap {
  [key: string]: { en: string; hi: string };
}

export const translations: TranslationMap = {
  // ── App Identity ─────────────────────────────────────────────────────────────
  appName:              { en: 'AgroShield',                         hi: 'एग्रोशील्ड' },
  tagline:              { en: 'Smart farming, real data.',           hi: 'समझदार खेती, सच्चा डेटा।' },
  welcome:              { en: 'Welcome',                             hi: 'स्वागत है' },
  welcome_back:         { en: 'Welcome back',                       hi: 'वापसी पर स्वागत' },
  hello_farmer:         { en: 'Hello, Farmer!',                     hi: 'नमस्ते, किसान भाई!' },

  // ── Auth / Login / Register ───────────────────────────────────────────────────
  login:                { en: 'Login',                              hi: 'लॉग इन' },
  register:             { en: 'Register',                           hi: 'नया खाता बनाएं' },
  register_new:         { en: 'New Account',                        hi: 'नया खाता' },
  login_existing:       { en: 'Existing User',                      hi: 'पहले से खाता है' },
  enter_phone:          { en: 'Enter phone number',                 hi: 'फ़ोन नंबर डालें' },
  enter_name:           { en: 'Enter your full name',               hi: 'अपना पूरा नाम डालें' },
  logout:               { en: 'Logout',                             hi: 'बाहर जाएं' },
  complete_registration:{ en: 'Complete Registration',              hi: 'रजिस्ट्रेशन पूरा करें' },
  step_of:              { en: 'Step {0} of {1}',                    hi: 'चरण {0} / {1}' },

  // ── Common Form Fields ────────────────────────────────────────────────────────
  phoneNumber:          { en: 'Phone Number',                       hi: 'फ़ोन नंबर' },
  fullName:             { en: 'Full Name',                          hi: 'पूरा नाम' },
  state:                { en: 'State',                              hi: 'राज्य' },
  district:             { en: 'District',                           hi: 'जिला' },
  village:              { en: 'Village',                            hi: 'गांव' },
  language:             { en: 'Language',                           hi: 'भाषा' },
  submit:               { en: 'Submit',                             hi: 'जमा करें' },
  back:                 { en: 'Back',                               hi: 'वापस' },
  next:                 { en: 'Next',                               hi: 'आगे' },
  loading:              { en: 'Loading…',                           hi: 'लोड हो रहा है…' },
  error:                { en: 'Something went wrong.',              hi: 'कुछ गड़बड़ हो गई।' },

  // ── GPS / Location ────────────────────────────────────────────────────────────
  gps_location:         { en: 'GPS Location',                       hi: 'जीपीएस स्थान' },
  get_location:         { en: '📍 Get GPS Location',               hi: '📍 अपना स्थान लें' },

  // ── Farm & Crop Info ──────────────────────────────────────────────────────────
  cropName:             { en: 'Crop Name',                          hi: 'फसल का नाम' },
  sowingDate:           { en: 'Sowing Date',                        hi: 'बुवाई की तारीख' },
  farmArea:             { en: 'Farm Area (Acres)',                  hi: 'खेत का क्षेत्र (एकड़)' },
  soilType:             { en: 'Soil Type',                          hi: 'मिट्टी का प्रकार' },
  irrigationSource:     { en: 'Irrigation Source',                  hi: 'सिंचाई का साधन' },
  variety:              { en: 'Crop Variety (optional)',             hi: 'किस्म (ज़रूरी नहीं)' },

  // ── Dashboard Sections ────────────────────────────────────────────────────────
  dashboard:            { en: 'Dashboard',                          hi: 'डैशबोर्ड' },
  weather:              { en: 'Weather',                            hi: 'मौसम' },
  mandi:                { en: 'Mandi Prices',                       hi: 'मंडी भाव' },
  advisory:             { en: 'Advisory',                           hi: 'सलाह' },
  camera:               { en: 'Plant Clinic',                       hi: 'पौध जांच' },
  scenario:             { en: 'Stress Simulator',                   hi: 'तनाव सिमुलेटर' },
  your_farm:            { en: 'Your Farm',                          hi: 'आपका खेत' },
  your_crop:            { en: 'Your Crop',                          hi: 'आपकी फसल' },
  farmerProfile:        { en: 'Farmer Profile',                     hi: 'किसान प्रोफ़ाइल' },
  plot_overview:        { en: 'Plot Overview',                      hi: 'खेत की जानकारी' },
  farm_intelligence:    { en: 'Farm Intelligence',                  hi: 'खेत की अक्लमंदी' },

  // ── Data Integrity Badges ─────────────────────────────────────────────────────
  zero_dummy_data:      { en: 'Zero Dummy Data',                    hi: 'कोई नकली डेटा नहीं' },
  verified_apis:        { en: 'Verified APIs',                      hi: 'जाँचे हुए स्रोत' },
  verified_data:        { en: 'Verified Data',                      hi: 'सत्यापित जानकारी' },
  data_integrity:       { en: 'Data Integrity',                     hi: 'डेटा की सच्चाई' },
  source:               { en: 'Source',                             hi: 'स्रोत' },

  // ── Crop & Growth ─────────────────────────────────────────────────────────────
  crop:                 { en: 'Crop',                               hi: 'फसल' },
  growth_stage:         { en: 'Growth Stage',                       hi: 'फसल की अवस्था' },
  crop_stage:           { en: 'Crop Stage',                         hi: 'फसल की अवस्था' },
  days_after_sowing:    { en: 'Days After Sowing',                  hi: 'बुवाई के बाद के दिन' },
  sown_on:              { en: 'Sown on',                            hi: 'बुवाई हुई' },
  area_acres:           { en: 'Area (Acres)',                       hi: 'क्षेत्र (एकड़)' },
  soil:                 { en: 'Soil',                               hi: 'मिट्टी' },
  irrigation:           { en: 'Irrigation',                         hi: 'सिंचाई' },

  // ── Risk & Advisory ───────────────────────────────────────────────────────────
  risk:                 { en: 'Risk',                               hi: 'जोखिम' },
  risk_level:           { en: 'Risk Level',                         hi: 'जोखिम का स्तर' },
  risk_factors:         { en: 'Risk Factors',                       hi: 'जोखिम के कारण' },
  consult_advisor:      { en: 'Consult Advisor',                    hi: 'सलाहकार से पूछें' },
  open_advisory:        { en: 'Open Advisory',                      hi: 'सलाह लें' },
  ask_question:         { en: 'Ask a question…',                    hi: 'सवाल पूछें…' },
  send:                 { en: 'Send',                               hi: 'भेजें' },
  thinking:             { en: 'Thinking…',                         hi: 'सोच रहा है…' },
  agent_response:       { en: 'Agent Response',                     hi: 'जवाब' },
  sources:              { en: 'Sources',                            hi: 'स्रोत' },

  // ── Weather ───────────────────────────────────────────────────────────────────
  live_weather:         { en: 'Live Weather',                       hi: 'अभी का मौसम' },
  hyperlocal_weather:   { en: 'Hyperlocal Weather',                 hi: 'स्थानीय मौसम' },
  temperature:          { en: 'Temperature',                        hi: 'तापमान' },
  humidity:             { en: 'Humidity',                           hi: 'नमी' },
  wind_speed:           { en: 'Wind Speed',                         hi: 'हवा की गति' },
  precipitation:        { en: 'Rainfall',                           hi: 'बारिश' },
  rain_probability:     { en: 'Rain Chance',                        hi: 'बारिश की संभावना' },
  forecast:             { en: 'Forecast',                           hi: 'आगे का मौसम' },
  today:                { en: 'Today',                              hi: 'आज' },
  dry:                  { en: 'Dry',                                hi: 'सूखा' },
  refresh:              { en: 'Refresh',                            hi: 'ताज़ा करें' },

  // ── Mandi / Market Prices ─────────────────────────────────────────────────────
  market:               { en: 'Market',                             hi: 'मंडी' },
  market_prices:        { en: 'Market Prices',                      hi: 'मंडी के भाव' },
  modal_price:          { en: 'Modal Price',                        hi: 'आम भाव' },
  min_price:            { en: 'Min Price',                          hi: 'कम से कम भाव' },
  max_price:            { en: 'Max Price',                          hi: 'ज़्यादा से ज़्यादा भाव' },
  arrival_date:         { en: 'Arrival Date',                       hi: 'आवक की तारीख' },
  no_data:              { en: 'No data available',                  hi: 'कोई जानकारी नहीं' },
  mandi_distance:       { en: 'Distance to Mandi',                  hi: 'मंडी तक दूरी' },
  freight_rate:         { en: 'Freight Rate',                       hi: 'ढुलाई का भाव' },
  batch_volume:         { en: 'Batch Volume',                       hi: 'खेप की मात्रा' },
  net_realization:      { en: 'Net Realization',                    hi: 'हाथ में आने वाला पैसा' },
  freight_overhead:     { en: 'Freight Overhead',                   hi: 'ढुलाई खर्च' },
  search_prices:        { en: 'Search Prices',                      hi: 'भाव खोजें' },
  query_filters:        { en: 'Filter',                             hi: 'छानना' },
  commodity:            { en: 'Commodity',                          hi: 'जिन्स / फसल' },

  // ── Plant Clinic / Image Analysis ────────────────────────────────────────────
  plant_clinic:         { en: 'Plant Clinic',                       hi: 'पौध जांच केंद्र' },
  upload_image:         { en: 'Upload Image',                       hi: 'तस्वीर अपलोड करें' },
  analyze:              { en: 'Analyze',                            hi: 'जांचें' },
  diagnosis_result:     { en: 'Diagnosis Result',                   hi: 'जांच का नतीजा' },
  symptoms:             { en: 'Symptoms',                           hi: 'लक्षण' },
  recommendation:       { en: 'Recommendation',                     hi: 'सुझाव' },

  // ── Scenario / Stress Simulator ───────────────────────────────────────────────
  simulate_stress:      { en: 'Simulate Stress',                    hi: 'तनाव देखें' },
  stress_simulator:     { en: 'Stress Simulator',                   hi: 'तनाव सिमुलेटर' },
  scenario_analysis:    { en: 'Scenario Analysis',                  hi: 'हालात की जांच' },
  rainfall_delta:       { en: 'Rainfall Change (mm)',               hi: 'बारिश बदलाव (मिमी)' },
  temp_delta:           { en: 'Temp Change (°C)',                   hi: 'तापमान बदलाव (°C)' },
  run_simulation:       { en: 'Run Simulation',                     hi: 'सिमुलेशन चलाएं' },

  // ── Dashboard Quick Actions ───────────────────────────────────────────────────
  microclimate:         { en: 'Microclimate',                       hi: 'स्थानीय मौसम' },
  market_rates:         { en: 'Market Rates',                       hi: 'मंडी भाव' },

  // ── Plot Info Tiles ───────────────────────────────────────────────────────────
  cultivated_crop:      { en: 'Cultivated Crop',                    hi: 'उगाई गई फसल' },
  land_soil:            { en: 'Land & Soil',                        hi: 'ज़मीन और मिट्टी' },
  irrigation_system:    { en: 'Irrigation System',                  hi: 'सिंचाई का तरीका' },
};

/**
 * Convenience helper — use inside components:
 *   const t = useTranslation(language);
 *   t('temperature') // → "तापमान" or "Temperature"
 */
export function useTranslation(lang: Language) {
  return (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] ?? entry['en'] ?? key;
  };
}

export default translations;
