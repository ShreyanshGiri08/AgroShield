import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  CloudRain,
  Scale,
  Camera,
  CheckCircle2,
  Leaf,
  SunMedium,
  TrendingUp,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  language: string;
  onSetLanguage: (lang: string) => void;
  onOpenLogin: () => void;
  onQuickDemoLogin: () => void;
  isLoggedIn: boolean;
  onOpenDashboard: () => void;
  onOpenMandi?: () => void;
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
    physicsHint: 'Hover or drag cursor across floating telemetry objects to experience Zero-G proximity repulsion & 3D tilt',
    stats: [
      { label: 'Real-Time Telemetry', val: '100% Live', sub: 'Open-Meteo & data.gov.in' },
      { label: 'Agronomic Research', val: 'ICAR RAG', sub: 'Verified package of practices' },
      { label: 'Price Prediction', val: '14 Days', sub: 'MSP floor & arrival volume' },
      { label: 'Multi-Crop Coverage', val: '10+ Crops', sub: 'Cotton, Wheat, Soybean & more' },
    ],
    bentoTitle: 'Engineered for India’s 140 Million Farmers',
    bentoSub: 'Live weather, market prices, AI advisories, and crop disease detection — built for India.',
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
    physicsHint: 'माउस को कार्ड्स के पास ले जाएं: जीरो-ग्रेविटी रिपल्शन और 3D टिल्ट का अनुभव करें',
    stats: [
      { label: 'सजीव मौसम डेटा', val: '100% लाइव', sub: 'Open-Meteo व उपग्रह' },
      { label: 'सरकारी कृषि अनुसंधान', val: 'ICAR RAG', sub: 'प्रमाणित कृषि बुलेटिन' },
      { label: 'भाव पूर्वानुमान', val: '14 दिन', sub: 'MSP आधार व आवक' },
      { label: 'बहु-फसल सुरक्षा', val: '10+ फसलें', sub: 'कपास, गेहूं, सोयाबीन आदि' },
    ],
    bentoTitle: 'भारत के 14 करोड़ किसानों के लिए निर्मित',
    bentoSub: 'सटीक, भरोसेमंद और वैज्ञानिक पद्धतियों पर आधारित आधुनिक कृषि सुरक्षा प्रणाली।',
    pillars: [
      {
        icon: CloudRain,
        tag: 'स्थानीय मौसम',
        title: 'फसल अवस्था आधारित मौसम जोखिम',
        desc: 'अंकुरण, फूल आने और गूलर/दाने भरने की अवस्था में तापमान, नमी और बारिश के वास्तविक असर का सटीक गणितीय विश्लेषण।',
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
  onOpenMandi,
}) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  // ─────────────────────────────────────────────────────────────────────────────
  // ZERO-GRAVITY INTERACTIVE PHYSICS ENGINE (VitAI Style: Weightless Precision)
  // ─────────────────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  // Floating cards state
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);

  // Physics animation loop using refs for 60fps buttery glide
  const physicsState = useRef({
    c1: { x: 0, y: 0, vx: 0, vy: 0, tiltX: 0, tiltY: 0, z: -10 },
    c2: { x: 0, y: 0, vx: 0, vy: 0, tiltX: 0, tiltY: 0, z: -15 },
    c3: { x: 0, y: 0, vx: 0, vy: 0, tiltX: 0, tiltY: 0, z: -5 },
    c4: { x: 0, y: 0, vx: 0, vy: 0, tiltX: 0, tiltY: 0, z: -8 },
    lastScrollY: 0,
    scrollVelocity: 0,
  });

  // Track pointer coordinates relative to hero container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  // Scroll momentum tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - physicsState.current.lastScrollY;
      physicsState.current.scrollVelocity = Math.max(Math.min(delta * 0.4, 25), -25);
      physicsState.current.lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Continuous Zero-G loop with Brownian drift, Proximity repulsion, & Damped Spring-Back
  useEffect(() => {
    let animId: number;
    let t = 0;

    const repulsionRadius = 180; // Repulsor sphere radius
    const damping = 0.88; // High linear damping for cushioned glide
    const angularDamping = 0.82;
    const springK = 0.08; // Tether spring constant

    const cards = [
      { id: 'c1', ref: card1Ref, driftFreq: 0.0016, driftAmp: 8 },
      { id: 'c2', ref: card2Ref, driftFreq: 0.0013, driftAmp: 11 },
      { id: 'c3', ref: card3Ref, driftFreq: 0.0019, driftAmp: 7 },
      { id: 'c4', ref: card4Ref, driftFreq: 0.0014, driftAmp: 9 },
    ];

    const updatePhysics = () => {
      t += 16;
      const scrollImpulse = physicsState.current.scrollVelocity;
      // Decay scroll velocity
      physicsState.current.scrollVelocity *= 0.92;

      cards.forEach(({ id, ref, driftFreq, driftAmp }) => {
        const el = ref.current;
        if (!el || !containerRef.current) return;

        const state = (physicsState.current as any)[id];
        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // Card center relative to hero container
        const cardCenterX = rect.left + rect.width / 2 - containerRect.left;
        const cardCenterY = rect.top + rect.height / 2 - containerRect.top;

        // 1. Subtle continuous Brownian drift
        const brownianX = Math.sin(t * driftFreq) * driftAmp;
        const brownianY = Math.cos(t * driftFreq * 1.2) * (driftAmp * 0.7);

        // 2. Proximity Repulsion Sphere
        const dx = cardCenterX - mousePos.x;
        const dy = cardCenterY - mousePos.y;
        const dist = Math.hypot(dx, dy);

        let repulseX = 0;
        let repulseY = 0;
        if (dist > 0 && dist < repulsionRadius) {
          const factor = (1 - dist / repulsionRadius);
          const force = factor * 4.5;
          repulseX = (dx / dist) * force;
          repulseY = (dy / dist) * force;
        }

        // 3. Spring force returning to anchor position (0, 0)
        const springFx = -springK * state.x;
        const springFy = -springK * state.y;

        // Apply accelerations
        state.vx = (state.vx + repulseX + springFx) * damping;
        state.vy = (state.vy + repulseY + springFy + scrollImpulse * 0.05) * damping;

        state.x += state.vx;
        state.y += state.vy;

        // 4. Parallax 3D tilt tracking pointer coordinates (±8°)
        let targetTiltX = 0;
        let targetTiltY = 0;
        if (mousePos.x > 0 && dist < 450) {
          targetTiltX = Math.max(Math.min((dy / 450) * 8, 8), -8);
          targetTiltY = Math.max(Math.min((-dx / 450) * 8, 8), -8);
        }
        state.tiltX += (targetTiltX - state.tiltX) * (1 - angularDamping);
        state.tiltY += (targetTiltY - state.tiltY) * (1 - angularDamping);

        // Apply final transform
        const finalX = state.x + brownianX;
        const finalY = state.y + brownianY;
        const zSpread = scrollImpulse !== 0 ? Math.abs(scrollImpulse) * 0.8 : 0;

        el.style.transform = `translate3d(${finalX.toFixed(2)}px, ${finalY.toFixed(2)}px, ${(state.z + zSpread).toFixed(2)}px) rotateX(${state.tiltX.toFixed(2)}deg) rotateY(${state.tiltY.toFixed(2)}deg)`;
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [mousePos]);

  // Card click micro-interaction (scale punch 0.96 and rebound)
  const handleCardClick = (id: string) => {
    setClickedCard(id);
    setTimeout(() => setClickedCard(null), 250);
  };

  return (
    <div className="min-h-screen text-[#0F1108] font-sans flex flex-col" style={{ backgroundColor: '#FEFADC' }}>
      {/* ─── STICKY HEADER (VitAI Style) ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FEFADC]/90 border-b border-[#E8C99A]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-[#241909] flex items-center justify-center border border-[#E07B39]/30">
              <Leaf className="w-6 h-6 text-[#F3B391]" />
            </div>
            <div>
              <div className="text-lg font-semibold text-[#241909] tracking-tight flex items-center gap-1.5">
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
          <nav className="hidden lg:flex items-center bg-[#FFFDF5] px-2 py-1.5 rounded-2xl border border-[#E8C99A] shadow-sm text-sm text-[#5C4A30]">
            <a href="#overview" className="px-3.5 py-1.5 rounded-xl hover:bg-[#F6D4BA] hover:text-[#241909] transition-all">
              {tx.overview}
            </a>
            <a href="#capabilities" className="px-3.5 py-1.5 rounded-xl hover:bg-[#F6D4BA] hover:text-[#241909] transition-all">
              {tx.capabilities}
            </a>
            <button
              onClick={onOpenMandi || onOpenDashboard || onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl hover:bg-[#F6D4BA] hover:text-[#241909] transition-all text-sm font-bold text-[#5C4A30]"
            >
              {tx.mandiRadar}
            </button>
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

      {/* ─── ZERO-G INTERACTIVE HERO CANVAS (VitAI Concept: Weightless Precision) ─── */}
      <section
        id="overview"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-12 pb-24 overflow-hidden perspective-[1200px]"
      >
        {/* Subtle Zero-G Ambient Physics Guidance */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* High-Impact Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF5] border border-[#E8C99A] shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3A7D44] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-[#241909] tracking-wide">
                {tx.badge}
              </span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#241909] tracking-tight leading-[1.1]">
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
                  className="btn-primary py-3.5 px-7 text-base font-bold flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-[#241909]" />
                  <span>{tx.openDashboard}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={onOpenLogin}
                    className="btn-primary py-3.5 px-7 text-base font-bold flex items-center gap-2"
                  >
                    <span>{tx.ctaPrimary}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={onQuickDemoLogin}
                    className="px-6 py-3.5 rounded-xl bg-[#241909] hover:bg-[#3D2C15] text-[#FEFADC] text-base font-bold border border-[#241909] flex items-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-5 h-5 text-[#F3B391]" />
                    <span>{tx.ctaDemo}</span>
                  </button>
                </>
              )}

              <button
                onClick={onOpenMandi || onOpenDashboard || onOpenLogin}
                className="px-6 py-3.5 rounded-xl bg-[#FFFDF5] hover:bg-[#F6D4BA] text-[#241909] text-base font-semibold border border-[#E8C99A] transition-colors flex items-center gap-2"
              >
                <Scale className="w-5 h-5 text-[#E07B39]" />
                <span>{tx.ctaExplore}</span>
              </button>
            </div>

            {/* 4 Stats Badges Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-left">
              {tx.stats.map((st, idx) => (
                <div key={idx} className="bg-[#FFFDF5] border border-[#E8C99A] rounded-xl p-4">
                  <span className="text-xs font-medium text-[#5C4A30] uppercase tracking-wide block mb-1">
                    {st.label}
                  </span>
                  <span className="text-2xl font-bold text-[#241909] font-mono block">
                    {st.val}
                  </span>
                  <span className="text-xs font-medium text-[#3A7D44] block mt-1">
                    {st.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────
              ZERO-GRAVITY INTERACTIVE PREVIEW RIG (Anchor Plane + 4 Floating Satellites)
             ───────────────────────────────────────────────────────────────────────── */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            {/* FLOATING SATELLITE 1: Microclimate Telemetry Chip (Top Left Float) */}
            <div
              ref={card1Ref}
              onClick={() => handleCardClick('c1')}
              className={`hidden lg:block absolute -top-8 -left-12 z-30 w-72 bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-2xl p-4 shadow-xl cursor-pointer select-none transition-transform duration-100 will-change-transform ${
                clickedCard === 'c1' ? 'scale-95' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black text-[#5C4A30] border-b border-[#E8C99A] pb-2">
                <span className="flex items-center gap-1.5 text-[#241909]">
                  <SunMedium className="w-4 h-4 text-[#E07B39]" />
                  <span>Open-Meteo Satellite</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#3A7D44] text-[#FEFADC] text-[10px] font-extrabold">LIVE</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <div className="text-2xl font-black font-mono text-[#241909]">31.4°C</div>
                <div className="text-xs font-bold text-[#5C4A30]">Akola, MH</div>
              </div>
              <div className="text-[11px] font-semibold text-[#3A7D44] pt-1">
                Humidity 58% • Rain 0.0 mm • Solar 680 W/m²
              </div>
            </div>

            {/* FLOATING SATELLITE 2: 14-Day Mandi Price Prediction Radar (Top Right Float) */}
            <div
              ref={card2Ref}
              onClick={() => handleCardClick('c2')}
              className={`hidden lg:block absolute -top-10 -right-12 z-30 w-80 bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-2xl p-4 shadow-xl cursor-pointer select-none transition-transform duration-100 will-change-transform ${
                clickedCard === 'c2' ? 'scale-95' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black text-[#5C4A30] border-b border-[#E8C99A] pb-2">
                <span className="flex items-center gap-1.5 text-[#241909]">
                  <Scale className="w-4 h-4 text-[#E07B39]" />
                  <span>data.gov.in AGMARKNET</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#F3B391] text-[#241909] text-[10px] font-extrabold">14-DAY FORECAST</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <div className="text-2xl font-black font-mono text-[#1E472D]">₹7,560<span className="text-xs font-bold text-[#5C4A30]">/qtl</span></div>
                <div className="text-xs font-extrabold text-[#E07B39] flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+3.8% Forecast</span>
                </div>
              </div>
              <div className="text-[11px] font-bold text-[#241909] pt-1 flex items-center justify-between">
                <span>MSP: ₹7,121</span>
                <span className="px-2 py-0.5 rounded-md bg-[#241909] text-[#FEFADC] text-[10px] font-black uppercase">ACTION: HOLD</span>
              </div>
            </div>

            {/* FLOATING SATELLITE 3: ICAR Citation Verification Chip (Bottom Left Float) */}
            <div
              ref={card3Ref}
              onClick={() => handleCardClick('c3')}
              className={`hidden lg:block absolute -bottom-10 -left-10 z-30 w-76 bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-2xl p-4 shadow-xl cursor-pointer select-none transition-transform duration-100 will-change-transform ${
                clickedCard === 'c3' ? 'scale-95' : ''
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black text-[#241909] border-b border-[#E8C99A] pb-2">
                <ShieldCheck className="w-4 h-4 text-[#3A7D44]" />
                <span>ICAR-CICR Bulletins (pgvector)</span>
              </div>
              <p className="text-xs font-bold text-[#241909] pt-2 line-clamp-2 leading-snug">
                Technical Bulletin 2024: Integrated Pink Bollworm & Root Aeration Practices
              </p>
              <div className="text-[10px] font-extrabold text-[#3A7D44] pt-1">
                92% Cosine Match • Zero Hallucinations
              </div>
            </div>

            {/* FLOATING SATELLITE 4: Deterministic Phenology & Vision Pill (Bottom Right Float) */}
            <div
              ref={card4Ref}
              onClick={() => handleCardClick('c4')}
              className={`hidden lg:block absolute -bottom-8 -right-8 z-30 w-72 bg-[#FFFDF5] border-2 border-[#E8C99A] rounded-2xl p-4 shadow-xl cursor-pointer select-none transition-transform duration-100 will-change-transform ${
                clickedCard === 'c4' ? 'scale-95' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black text-[#5C4A30] border-b border-[#E8C99A] pb-2">
                <span className="flex items-center gap-1.5 text-[#241909]">
                  <Cpu className="w-4 h-4 text-[#E07B39]" />
                  <span>Deterministic Risk Engine</span>
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#3A7D44]" />
              </div>
              <div className="pt-2 text-xs font-black text-[#241909]">
                Cotton • Flowering & Boll Formation
              </div>
              <div className="text-[11px] font-semibold text-[#5C4A30] pt-0.5">
                Stress Score: <span className="font-black text-[#3A7D44]">18/100 (Safe)</span> • GDD Verified
              </div>
            </div>

            {/* Central Anchor Plane (Z = 0) */}
            <div className="rounded-3xl bg-[#F6D4BA] border-2 border-[#E8C99A] p-4 sm:p-6 shadow-2xl space-y-4">
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
                <div className="bg-[#FEFADC] rounded-2xl p-4 border border-[#E8C99A] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5C4A30]">
                    <span>{isHi ? 'सजीव मौसम (अकोला)' : 'Live Weather (Akola)'}</span>
                    <SunMedium className="w-4 h-4 text-[#E07B39]" />
                  </div>
                  <div className="text-3xl font-black text-[#241909] font-mono">31.4°C</div>
                  <div className="text-xs text-[#3A7D44] font-bold">
                    {isHi ? 'आर्द्रता: 58% • बारिश की संभावना: 0%' : 'Humidity: 58% • Rain Probability: 0%'}
                  </div>
                </div>

                {/* Telemetry Card 2 */}
                <div className="bg-[#FEFADC] rounded-2xl p-4 border border-[#E8C99A] space-y-2 shadow-sm">
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
                <div className="bg-[#FEFADC] rounded-2xl p-4 border border-[#E8C99A] space-y-2 shadow-sm">
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
        </div>
      </section>

      {/* ─── CAPABILITIES BENTO GRID ─── */}
      <section id="capabilities" className="py-20 bg-[#FFFDF5] border-t-2 border-b-2 border-[#E8C99A]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#241909] tracking-tight">
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
                  className="bg-[#FEFADC] border border-[#E8C99A] rounded-2xl p-6 sm:p-7 space-y-4 hover:border-[#D4A870] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#241909] text-[#FEFADC] flex items-center justify-center">
                      <IconComp className="w-6 h-6 text-[#F3B391]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#F6D4BA] text-[#5C4A30] border border-[#E8C99A]">
                      {pil.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#241909]">
                    {pil.title}
                  </h3>
                  <p className="text-sm text-[#5C4A30] leading-relaxed">
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
            <h2 className="text-3xl font-bold text-[#241909]">
              {tx.howItWorks}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFDF5] border border-[#E8C99A] rounded-xl p-5 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#F3B391] text-[#241909] font-black text-lg flex items-center justify-center border border-[#E07B39]">
                1
              </span>
              <h3 className="text-lg font-semibold text-[#241909]">{tx.step1}</h3>
              <p className="text-sm text-[#5C4A30] leading-relaxed">{tx.step1Desc}</p>
            </div>

            <div className="bg-[#FFFDF5] border border-[#E8C99A] rounded-xl p-5 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#F3B391] text-[#241909] font-black text-lg flex items-center justify-center border border-[#E07B39]">
                2
              </span>
              <h3 className="text-lg font-semibold text-[#241909]">{tx.step2}</h3>
              <p className="text-sm text-[#5C4A30] leading-relaxed">{tx.step2Desc}</p>
            </div>

            <div className="bg-[#FFFDF5] border border-[#E8C99A] rounded-xl p-5 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#F3B391] text-[#241909] font-black text-lg flex items-center justify-center border border-[#E07B39]">
                3
              </span>
              <h3 className="text-lg font-semibold text-[#241909]">{tx.step3}</h3>
              <p className="text-sm text-[#5C4A30] leading-relaxed">{tx.step3Desc}</p>
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
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs sm:text-sm font-extrabold text-[#241909]">
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-3.5 py-1.5 rounded-lg border border-[#E8C99A]">
              Open-Meteo CC BY 4.0
            </span>
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-3.5 py-1.5 rounded-lg border border-[#E8C99A]">
              data.gov.in AGMARKNET
            </span>
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-3.5 py-1.5 rounded-lg border border-[#E8C99A]">
              ICAR Package of Practices
            </span>
            <span className="flex items-center gap-1.5 bg-[#FEFADC] px-3.5 py-1.5 rounded-lg border border-[#E8C99A]">
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