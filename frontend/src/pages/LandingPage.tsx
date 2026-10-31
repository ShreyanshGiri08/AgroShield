import React from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CloudRain,
  Scale,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Lock,
  ChevronRight,
  ExternalLink,
  Leaf,
  Layers,
  BarChart3,
  SunMedium,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  language: string;
  onSetLanguage: (lang: string) => void;
  onOpenLogin: () => void;
  onQuickDemoLogin: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
}

const t = {
  en: {
    navPill: 'AgroShield Intelligence',
    overview: 'Overview',
    capabilities: 'Capabilities',
    mandiRadar: 'Mandi Radar',
    icarKnowledge: 'ICAR Grounding',
    portalBtn: 'Farmer Login / Register',
    openDashboard: 'Open Farm Dashboard',
    badge: 'AI-POWERED HYPERLOCAL AGRICULTURAL INTELLIGENCE • ZERO FAKE DATA',
    heroTitle1: 'Predict. Protect.',
    heroTitle2: 'Prosper.',
    heroSub:
      'India’s first deterministic, agentic AI platform for farmers. Synchronized with live Open-Meteo satellite weather, official data.gov.in AGMARKNET mandi prices, and ICAR research bulletins into instant, actionable field advisories in simple Hindi & English.',
    ctaPrimary: 'Launch Farmer Portal',
    ctaDemo: '1-Click Interactive Demo',
    ctaExplore: 'Explore Live Mandi Radar',
    stats: [
      { label: 'Real-Time Telemetry', val: '100% Live', sub: 'Open-Meteo & data.gov.in' },
      { label: 'Agronomic Research', val: 'ICAR RAG', sub: 'Verified package of practices' },
      { label: 'Price Prediction', val: '14 Days', sub: 'MSP floor & arrival volume' },
      { label: 'Multi-Crop Coverage', val: '10+ Crops', sub: 'Cotton, Wheat, Soybean & more' },
    ],
    bentoTitle: 'Engineered for India’s 140 Million Farmers',
    bentoSub: 'A production-grade, multimodal intelligence stack built for precision agricultural resilience.',
    pillars: [
      {
        icon: CloudRain,
        tag: 'Hyperlocal Microclimate',
        title: 'Phenological Crop-Stage Weather Risk',
        desc: 'Deterministic agronomic risk rules evaluating daily rainfall, heat waves, and humidity against specific crop growth stages (Seedling, Flowering, Boll/Grain filling).',
      },
      {
        icon: Scale,
        tag: 'data.gov.in AGMARKNET',
        title: '14-Day Mandi Price Prediction & Radar',
        desc: 'Direct APMC market arrivals with 14-day price forecasting, MSP benchmark comparisons, and actionable Sell vs. Hold recommendations to maximize net farmer income.',
      },
      {
        icon: Sparkles,
        tag: 'Agentic Multi-Step AI',
        title: 'ICAR-Grounded Agronomic RAG Advisory',
        desc: 'Autonomous multi-step pipeline executing intent routing, live weather fetching, risk calculation, and pgvector semantic retrieval from verified ICAR publications.',
      },
      {
        icon: Camera,
        tag: 'Multimodal Vision',
        title: 'Instant Plant Disease & Pest Clinic',
        desc: 'Farmers photograph infected leaves, stems, or bolls to receive instantaneous diagnostic verification and ICAR biological and chemical management protocols.',
      },
    ],
    transparencyTitle: 'Strict Data Integrity — No Hallucinations, No Dummy Data',
    transparencyDesc: 'Built strictly under hackathon guidelines: verified APIs, active databases, and verifiable research documents only.',
    howItWorks: 'How AgroShield Works in 3 Simple Steps',
    step1: '1. Register Farm Location & Crops',
    step1Desc: 'Enter village coordinates, acreage, soil type, and multiple cultivated crops.',
    step2: '2. Live Sensor & Government Telemetry',
    step2Desc: 'Automated retrieval from Open-Meteo satellites and official AGMARKNET mandi feeds.',
    step3: '3. Grounded Vernacular Advisory',
    step3Desc: 'Receive plain, simple Hindi and English recommendations with verified ICAR citations.',
    readyTitle: 'Ready to Experience Hyperlocal Agricultural Intelligence?',
    readySub: 'Log in with your farm account or test with the pre-configured 1-click demo account.',
    footerText: 'AgroShield Platform • Sourced from Open-Meteo, data.gov.in AGMARKNET, and ICAR Research',
  },
  hi: {
    navPill: 'एग्रोशील्ड इंटेलिजेंस',
    overview: 'मुख्य पृष्ठ',
    capabilities: 'विशेषताएं',
    mandiRadar: 'मंडी भाव',
    icarKnowledge: 'ICAR अनुसंधान',
    portalBtn: 'किसान लॉगिन / पंजीकरण',
    openDashboard: 'खेत डैशबोर्ड खोलें',
    badge: 'AI-संचालित सजीव कृषि सुरक्षा मंच • पूर्णतः प्रामाणिक व असली डेटा',
    heroTitle1: 'पूर्वानुमान. सुरक्षा.',
    heroTitle2: 'समृद्धि.',
    heroSub:
      'भारत के 14 करोड़ अन्नदाताओं के लिए समर्पित AI कृषि रक्षक। सजीव Open-Meteo उपग्रह मौसम, भारत सरकार (data.gov.in) AGMARKNET मंडी भाव और ICAR कृषि अनुसंधान बुलेटिन के आधार पर सरल हिंदी में तुरंत प्रमाणित सलाह।',
    ctaPrimary: 'किसान पोर्टल शुरू करें',
    ctaDemo: '1-क्लिक सीधा डेमो देखें',
    ctaExplore: 'सजीव मंडी भाव देखें',
    stats: [
      { label: 'सजीव सरकारी डेटा', val: '100% असली', sub: 'Open-Meteo व data.gov.in' },
      { label: 'वैज्ञानिक अनुसंधान', val: 'ICAR RAG', sub: 'प्रमाणित पैकेज ऑफ प्रैक्टिसेज' },
      { label: 'भाव पूर्वानुमान', val: '14 दिन', sub: 'MSP व मौसमी आवक विश्लेषण' },
      { label: 'बहु-फसली सहायता', val: '10+ फसलें', sub: 'कपास, गेहूं, सोयाबीन आदि' },
    ],
    bentoTitle: 'भारतीय किसानों के लिए विशेष रूप से निर्मित',
    bentoSub: 'सटीक, प्रामाणिक और वैज्ञानिक कृषि निर्णय प्रणाली जो हर एकड़ की रक्षा करती है।',
    pillars: [
      {
        icon: CloudRain,
        tag: 'सजीव उपग्रह मौसम',
        title: 'फसल अवस्था आधारित मौसम जोखिम',
        desc: 'वर्षा, अधिक तापमान और नमी का फसल की अवस्था (अंकुरण, फूल, दाना भराव) के अनुसार स्वचालित वैज्ञानिक विश्लेषण।',
      },
      {
        icon: Scale,
        tag: 'AGMARKNET मंडी भाव',
        title: '14-दिन का भाव पूर्वानुमान एवं सलाह',
        desc: 'दैनिक APMC मंडी आवक, 14-दिवसीय भाव अनुमान, सरकारी समर्थन मूल्य (MSP) तुलना और तुरंत बेचने या रोककर रखने की स्पष्ट सलाह।',
      },
      {
        icon: Sparkles,
        tag: 'एजेंटिक बहु-चरणीय AI',
        title: 'ICAR अनुसंधान आधारित कृषि सलाह',
        desc: 'मौसम, फसल अवस्था और ICAR अनुसंधान बुलेटिन को जोड़कर बिना किसी बनावटी बात के 100% प्रामाणिक सलाह।',
      },
      {
        icon: Camera,
        tag: 'कैमरा रोग पहचान',
        title: 'फसल रोग एवं कीट निदान क्लिनिक',
        desc: 'पत्तियों या फल की फोटो अपलोड करते ही बीमारी की सटीक पहचान और रोकथाम के जैविक व रासायनिक उपाय।',
      },
    ],
    transparencyTitle: 'पूर्णतः प्रामाणिक डेटा — शून्य बनावटी जानकारी',
    transparencyDesc: 'हैकथॉन के कड़े नियमों के अनुसार: केवल सजीव APIs, सक्रिय डेटाबेस और सरकारी अनुसंधान बुलेटिन का उपयोग।',
    howItWorks: 'एग्रोशील्ड कैसे काम करता है (3 सरल चरण)',
    step1: '1. खेत का स्थान और फसलें चुनें',
    step1Desc: 'गाँव, जिला, खेत का क्षेत्रफल और बोई गई फसलें दर्ज करें।',
    step2: '2. सजीव मौसम व मंडी डेटा का मिलान',
    step2Desc: 'उपग्रह मौसम और निकटवर्ती APMC मंडियों के भाव अपने आप जुड़ जाते हैं।',
    step3: '3. सरल भाषा में प्रमाणित सलाह',
    step3Desc: 'ICAR संदर्भ और मौसम के आधार पर सरल हिंदी में स्पष्ट कदम उठाएं।',
    readyTitle: 'क्या आप अपने खेत को सुरक्षित बनाने के लिए तैयार हैं?',
    readySub: 'अपने खाते से लॉगिन करें या 1-क्लिक डेमो खाते से तुरंत सभी सुविधाएं चलाकर देखें।',
    footerText: 'एग्रोशील्ड • Open-Meteo, data.gov.in AGMARKNET व ICAR अनुसंधान पर आधारित',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onSetLanguage,
  onOpenLogin,
  onQuickDemoLogin,
  isLoggedIn,
  onOpenDashboard,
}) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  return (
    <div className="min-h-screen text-[#0F1108] font-sans flex flex-col" style={{ backgroundColor: '#FEFADC' }}>
      {/* ─── STICKY HEADER (VitAI Style) ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FEFADC]/90 border-b border-[#E8C99A]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-[#241909] text-[#FEFADC] flex items-center justify-center font-black text-xl shadow-md border border-[#E07B39]/40">
              <Leaf className="w-6 h-6 text-[#F3B391]" />
            </div>
            <div>
              <div className="text-xl font-black text-[#241909] tracking-tight flex items-center gap-1.5">
                <span>AgroShield</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F3B391] text-[#241909] border border-[#E07B39]">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#5C4A30] hidden sm:block">
                {isHi ? 'किसान का स्मार्ट सुरक्षा कवच' : 'Hyperlocal Farm Intelligence'}
              </p>
            </div>
          </div>

          {/* Center Navigation Pills */}
          <nav className="hidden lg:flex items-center bg-[#FFFDF5] px-2 py-1.5 rounded-2xl border border-[#E8C99A] shadow-sm text-sm font-bold text-[#5C4A30]">
            <a href="#overview" className="px-3.5 py-1.5 rounded-xl hover:bg-[#F6D4BA] hover:text-[#241909] transition-all">
              {tx.overview}
            </a>
            <a href="#capabilities" className="px-3.5 py-1.5 rounded-xl hover:bg-[#F6D4BA] hover:text-[#241909] transition-all">
              {tx.capabilities}
            </a>
            <a href="#mandi" className="px-3.5 py-1.5 rounded-xl hover:bg-[#F6D4BA] hover:text-[#241909] transition-all">
              {tx.mandiRadar}
            </a>
            <a href="#integrity" className="px-3.5 py-1.5 rounded-xl hover:bg-[#F6D4BA] hover:text-[#241909] transition-all">
              {tx.icarKnowledge}
            </a>
          </nav>

          {/* Right Action: Language + Portal CTA */}
          <div className="flex items-center gap-3">
            {/* Segmented Language Selector */}
            <div className="flex items-center bg-[#FFFDF5] p-1 rounded-xl border border-[#E8C99A] shadow-sm">
              <button
                onClick={() => onSetLanguage('hi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  isHi ? 'bg-[#241909] text-[#FEFADC]' : 'text-[#5C4A30] hover:text-[#241909]'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onSetLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  !isHi ? 'bg-[#241909] text-[#FEFADC]' : 'text-[#5C4A30] hover:text-[#241909]'
                }`}
              >
                English
              </button>
            </div>

            {/* Portal Action */}
            {isLoggedIn ? (
              <button
                onClick={onOpenDashboard}
                className="btn-primary py-2.5 px-4 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md"
              >
                <span>{tx.openDashboard}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="btn-primary py-2.5 px-4 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md"
              >
                <span>{tx.portalBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION (VitAI Style Headline + Glowing Pill) ─── */}
      <section id="overview" className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* High-Impact Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF5] border border-[#E8C99A] shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3A7D44] animate-pulse" />
              <span className="text-xs sm:text-sm font-black text-[#241909] tracking-wide">
                {tx.badge}
              </span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#241909] tracking-tight leading-[1.08]">
              <span className="block text-[#E07B39]">{tx.heroTitle1}</span>
              <span className="block">{tx.heroTitle2}</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl font-medium text-[#5C4A30] max-w-3xl mx-auto leading-relaxed">
              {tx.heroSub}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              {isLoggedIn ? (
                <button
                  onClick={onOpenDashboard}
                  className="btn-primary py-4 px-8 text-base sm:text-lg font-black flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
                >
                  <Sparkles className="w-5 h-5 text-[#241909]" />
                  <span>{tx.openDashboard}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={onOpenLogin}
                    className="btn-primary py-4 px-8 text-base sm:text-lg font-black flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <span>{tx.ctaPrimary}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onQuickDemoLogin}
                    className="px-6 py-4 rounded-xl bg-[#241909] hover:bg-[#3D2C15] text-[#FEFADC] text-base sm:text-lg font-black border border-[#241909] flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-[#F3B391]" />
                    <span>{tx.ctaDemo}</span>
                  </button>
                </>
              )}

              <a
                href="#mandi"
                className="px-6 py-4 rounded-xl bg-[#FFFDF5] hover:bg-[#F6D4BA] text-[#241909] text-base sm:text-lg font-black border border-[#E8C99A] shadow-md transition-all flex items-center gap-2"
              >
                <Scale className="w-5 h-5 text-[#E07B39]" />
                <span>{tx.ctaExplore}</span>
              </a>
            </div>

            {/* 4 Stats Badges Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
              {tx.stats.map((st, idx) => (
                <div key={idx} className="bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-black text-[#5C4A30] uppercase tracking-wider block mb-1">
                    {st.label}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#241909] font-mono block">
                    {st.val}
                  </span>
                  <span className="text-xs font-bold text-[#3A7D44] block mt-1">
                    {st.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── FLOATING BENTO APP PREVIEW CARD (VitAI Style Showcase) ─── */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-[#F6D4BA] border-2 border-[#E8C99A] p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8C99A] pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs font-bold font-mono text-[#5C4A30] ml-2">
                  agroshield.gov.in/telemetry/live-preview
                </span>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#FEFADC] text-[#241909] border border-[#E8C99A]">
                100% Real Open-Meteo & AGMARKNET Feed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Telemetry Card 1 */}
              <div className="bg-[#FEFADC] rounded-2xl p-4 border border-[#E8C99A] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#5C4A30]">
                  <span>{isHi ? 'सजीव मौसम (अकोला)' : 'Live Weather (Akola)'}</span>
                  <SunMedium className="w-4 h-4 text-[#E07B39]" />
                </div>
                <div className="text-3xl font-black text-[#241909] font-mono">29.4°C</div>
                <div className="text-xs text-[#3A7D44] font-bold">
                  {isHi ? 'आर्द्रता: 48% • बारिश की संभावना: 0%' : 'Humidity: 48% • Rain Probability: 0%'}
                </div>
              </div>

              {/* Telemetry Card 2 */}
              <div className="bg-[#FEFADC] rounded-2xl p-4 border border-[#E8C99A] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#5C4A30]">
                  <span>{isHi ? 'कपास मंडी भाव व पूर्वानुमान' : 'Cotton Mandi Radar'}</span>
                  <Scale className="w-4 h-4 text-[#E07B39]" />
                </div>
                <div className="text-3xl font-black text-[#1E472D] font-mono">₹7,560</div>
                <div className="text-xs text-[#E07B39] font-black">
                  {isHi ? '14 दिन अनुमान: ₹7,850 • रोककर रखें (HOLD)' : '14-Day Forecast: ₹7,850 • Recommendation: HOLD'}
                </div>
              </div>

              {/* Telemetry Card 3 */}
              <div className="bg-[#FEFADC] rounded-2xl p-4 border border-[#E8C99A] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#5C4A30]">
                  <span>{isHi ? 'ICAR अनुसंधान उद्धरण' : 'Verified ICAR Grounding'}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#3A7D44]" />
                </div>
                <div className="text-xs font-extrabold text-[#241909] line-clamp-2">
                  ICAR-CICR Technical Bulletin: Integrated Pest & Waterlogging Management
                </div>
                <div className="text-xs text-[#3A7D44] font-bold">92% Semantic Match Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES BENTO GRID ─── */}
      <section id="capabilities" className="py-20 bg-[#FFFDF5] border-t-2 border-b-2 border-[#E8C99A]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-[#241909] tracking-tight">
              {tx.bentoTitle}
            </h2>
            <p className="text-base sm:text-lg font-medium text-[#5C4A30]">
              {tx.bentoSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tx.pillars.map((pil, idx) => {
              const IconComp = pil.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FEFADC] border-2 border-[#E8C99A] rounded-3xl p-7 sm:p-8 space-y-4 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#241909] text-[#FEFADC] flex items-center justify-center">
                      <IconComp className="w-6 h-6 text-[#F3B391]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#F6D4BA] text-[#5C4A30] border border-[#E8C99A]">
                      {pil.tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#241909]">
                    {pil.title}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-[#5C4A30] leading-relaxed">
                    {pil.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (3-Step Pipeline) ─── */}
      <section className="py-20 bg-[#FEFADC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-[#241909]">
              {tx.howItWorks}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-3xl p-6 sm:p-8 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#F3B391] text-[#241909] font-black text-lg flex items-center justify-center border border-[#E07B39]">
                1
              </span>
              <h3 className="text-xl font-black text-[#241909]">{tx.step1}</h3>
              <p className="text-sm font-semibold text-[#5C4A30] leading-relaxed">{tx.step1Desc}</p>
            </div>

            <div className="bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-3xl p-6 sm:p-8 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#F3B391] text-[#241909] font-black text-lg flex items-center justify-center border border-[#E07B39]">
                2
              </span>
              <h3 className="text-xl font-black text-[#241909]">{tx.step2}</h3>
              <p className="text-sm font-semibold text-[#5C4A30] leading-relaxed">{tx.step2Desc}</p>
            </div>

            <div className="bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-3xl p-6 sm:p-8 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#F3B391] text-[#241909] font-black text-lg flex items-center justify-center border border-[#E07B39]">
                3
              </span>
              <h3 className="text-xl font-black text-[#241909]">{tx.step3}</h3>
              <p className="text-sm font-semibold text-[#5C4A30] leading-relaxed">{tx.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DATA INTEGRITY & AUDIT PROVENANCE ─── */}
      <section id="integrity" className="py-16 bg-[#F6D4BA] border-t-2 border-[#E8C99A]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEFADC] text-[#241909] text-xs sm:text-sm font-black border border-[#E8C99A]">
            <CheckCircle2 className="w-4 h-4 text-[#3A7D44]" />
            <span>{tx.transparencyTitle}</span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-[#5C4A30] max-w-2xl mx-auto">
            {tx.transparencyDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs sm:text-sm font-extrabold text-[#241909]">
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-4 py-2 rounded-xl border border-[#E8C99A]">
              Open-Meteo CC BY 4.0
            </span>
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-4 py-2 rounded-xl border border-[#E8C99A]">
              data.gov.in AGMARKNET
            </span>
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-4 py-2 rounded-xl border border-[#E8C99A]">
              ICAR Package of Practices
            </span>
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-4 py-2 rounded-xl border border-[#E8C99A]">
              Neon PostgreSQL pgvector
            </span>
          </div>
        </div>
      </section>

      {/* ─── FINAL CALL TO ACTION ─── */}
      <section className="py-20 bg-[#241909] text-[#FEFADC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#FEFADC]">
            {tx.readyTitle}
          </h2>
          <p className="text-sm sm:text-lg text-[#F6D4BA] max-w-2xl mx-auto">
            {tx.readySub}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isLoggedIn ? (
              <button
                onClick={onOpenDashboard}
                className="btn-primary py-4 px-8 text-base sm:text-lg font-black flex items-center gap-2 shadow-xl"
              >
                <span>{tx.openDashboard}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="btn-primary py-4 px-8 text-base sm:text-lg font-black flex items-center gap-2 shadow-xl"
                >
                  <span>{tx.ctaPrimary}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onQuickDemoLogin}
                  className="px-6 py-4 rounded-xl bg-[#FFFDF5] hover:bg-[#F3B391] text-[#241909] text-base sm:text-lg font-black transition-all shadow-xl"
                >
                  <span>{tx.ctaDemo}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#1A1207] text-[#B8A080] text-xs py-8 border-t border-[#3D2C15]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#FEFADC]">AgroShield Platform</span>
            <span>•</span>
            <span>{tx.footerText}</span>
          </div>
          <p>© 2026 AgroShield • Dedicated to the Indian Farming Community</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
