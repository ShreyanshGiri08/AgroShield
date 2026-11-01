import React, { useState, useEffect } from 'react';
import { fetchMandiPrices, fetchMandiPrediction } from '../services/api';
import {
  Scale,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Truck,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface MandiRadarProps {
  language: string;
  defaultState?: string;
  defaultDistrict?: string;
  defaultCommodity?: string;
}

const COMMON_CROP_LIST = [
  { name: 'Cotton',    hindi: 'कपास' },
  { name: 'Soybean',   hindi: 'सोयाबीन' },
  { name: 'Wheat',     hindi: 'गेहूं' },
  { name: 'Rice',      hindi: 'चावल (धान)' },
  { name: 'Chickpea',  hindi: 'चना' },
  { name: 'Maize',     hindi: 'मक्का' },
  { name: 'Mustard',   hindi: 'सरसों' },
  { name: 'Potato',    hindi: 'आलू' },
  { name: 'Onion',     hindi: 'प्याज' },
  { name: 'Sugarcane', hindi: 'गन्ना' },
];

const t = {
  en: {
    title: 'AGMARKNET Agricultural Market Intelligence',
    subtitle: 'Daily APMC arrival rates & 14-day price prediction powered by data.gov.in & MSP benchmarks',
    state: 'State',
    district: 'District',
    commodity: 'Commodity (Crop)',
    refresh: 'Refresh Feed',
    quickSelect: 'Select Crop:',
    tabArrivals: 'Live APMC Market Rates',
    tabPrediction: '14-Day Price Prediction & Advisory',
    chartLabel: 'Reported Modal Price by APMC Mandi (₹ / Quintal)',
    market: 'APMC Mandi Yard',
    districtCol: 'District',
    minPrice: 'Min Rate (₹)',
    maxPrice: 'Max Rate (₹)',
    modalPrice: 'Modal Rate (₹)',
    reportedOn: 'Arrival Date',
    noData: (c: string, d: string) => `No live AGMARKNET arrival records found for ${c} in ${d} today. You can select another crop above or broaden district.`,
    freightCalc: 'Net Farmer Realization Calculator (Factoring Transport Costs)',
    freightDesc: 'A higher price in a distant mandi does not yield higher profit if vehicle freight exceeds the price spread.',
    distance: 'Distance to Mandi:',
    freightRate: 'Vehicle Freight Rate:',
    volume: 'Produce Volume:',
    overhead: 'Estimated Transport Freight:',
    netReturn: 'Net Farmgate Realization:',
    km: 'km',
    qtl: 'Quintals',
    search: 'Search Live Prices',
    searching: 'Querying AGMARKNET...',
    predTitle: '14-Day Price Forecast & Marketing Recommendation',
    predSubtitle: 'Algorithmic projection factoring MSP floor, seasonal arrival volume, and festival demand momentum',
    currModal: 'Current Local Rate',
    mspFloor: 'Govt. MSP Floor',
    forecast14: '14-Day Projected Rate',
    expectedChange: 'Expected Trend',
    sellHoldTitle: 'Actionable Market Advisory for Farmer',
    chartForecastLabel: '14-Day Daily Projected Modal Price (₹ / Quintal)',
    dayCol: 'Timeline',
    dateCol: 'Date',
    projMin: 'Projected Min (₹)',
    projModal: 'Projected Modal (₹)',
    projMax: 'Projected Max (₹)',
  },
  hi: {
    title: 'कृषि मंडी भाव एवं 14-दिवसीय भाव पूर्वानुमान',
    subtitle: 'भारत सरकार (data.gov.in) AGMARKNET व न्यूनतम समर्थन मूल्य (MSP) पर आधारित प्रामाणिक विश्लेषण',
    state: 'राज्य',
    district: 'जिला',
    commodity: 'फसल (जिंस)',
    refresh: 'ताज़ा करें',
    quickSelect: 'फसल चुनें:',
    tabArrivals: 'दैनिक मंडी भाव (APMC)',
    tabPrediction: '14-दिन का भाव पूर्वानुमान एवं सलाह',
    chartLabel: 'मंडी अनुसार मोडल भाव तुलना (₹ प्रति क्विंटल)',
    market: 'कृषि उपज मंडी (APMC)',
    districtCol: 'जिला',
    minPrice: 'न्यूनतम भाव (₹)',
    maxPrice: 'अधिकतम भाव (₹)',
    modalPrice: 'औसत मोडल भाव (₹)',
    reportedOn: 'आवक तारीख',
    noData: (c: string, d: string) => `${d} जिले में ${c} की कोई आवक दर्ज नहीं हुई है। कृपया ऊपर दी गई किसी अन्य फसल पर क्लिक करें।`,
    freightCalc: 'शुद्ध कमाई गणक (ढुलाई खर्च काटकर असली बचत)',
    freightDesc: 'दूर की मंडी में ज्यादा भाव मिलने पर भी यदि गाड़ी का भाड़ा ज्यादा लगे तो शुद्ध लाभ कम हो सकता है।',
    distance: 'मंडी की दूरी:',
    freightRate: 'गाड़ी भाड़ा दर:',
    volume: 'माल की मात्रा:',
    overhead: 'अनुमानित ढुलाई खर्च:',
    netReturn: 'हाथ में आने वाला शुद्ध भाव:',
    km: 'किमी',
    qtl: 'क्विंटल',
    search: 'सजीव भाव देखें',
    searching: 'मंडी डेटा लाया जा रहा है...',
    predTitle: '14-दिवसीय भाव अनुमान एवं विपणन सलाह',
    predSubtitle: 'सरकारी समर्थन मूल्य (MSP), मौसमी आवक दबाव और त्योहारी मांग पर आधारित वैज्ञानिक गणना',
    currModal: 'वर्तमान मंडी भाव',
    mspFloor: 'सरकारी समर्थन मूल्य (MSP)',
    forecast14: '14 दिन बाद अनुमानित भाव',
    expectedChange: 'अनुमानित उतार-चढ़ाव',
    sellHoldTitle: 'किसान के लिए स्पष्ट बिक्री सलाह (बेचें या रोकें)',
    chartForecastLabel: 'अगले 14 दिनों का दैनिक भाव अनुमान व उतार-चढ़ाव (₹ प्रति क्विंटल)',
    dayCol: 'समय',
    dateCol: 'तारीख',
    projMin: 'न्यूनतम (₹)',
    projModal: 'मोडल भाव (₹)',
    projMax: 'अधिकतम (₹)',
  },
};

export const MandiRadar: React.FC<MandiRadarProps> = ({
  language,
  defaultState = 'Maharashtra',
  defaultDistrict = 'Akola',
  defaultCommodity = 'Cotton',
}) => {
  const isHi = language === 'hi';
  const tx = isHi ? t.hi : t.en;

  const [state, setState] = useState(defaultState);
  const [district, setDistrict] = useState(defaultDistrict);
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [data, setData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'arrivals' | 'prediction'>('arrivals');

  // Transportation Net price calculator
  const [distanceKm, setDistanceKm] = useState(25);
  const [freightRate, setFreightRate] = useState(28);
  const [volumeQtl, setVolumeQtl] = useState(20);

  // Synchronize when active crop changes in parent context
  useEffect(() => {
    if (defaultCommodity) {
      setCommodity(defaultCommodity);
    }
  }, [defaultCommodity]);

  useEffect(() => {
    if (defaultState) setState(defaultState);
    if (defaultDistrict) setDistrict(defaultDistrict);
  }, [defaultState, defaultDistrict]);

  const loadPricesAndPrediction = async (cropToQuery?: string) => {
    const targetCrop = cropToQuery || commodity;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch authentic APMC arrival prices
      const res = await fetchMandiPrices(state, district || undefined, targetCrop || undefined);
      setData(res);

      const records = res?.records || [];
      const currentModal = records.length > 0 ? records[0].modal_price : undefined;

      // 2. Fetch 14-day price prediction & Sell/Hold advisory
      const predRes = await fetchMandiPrediction(targetCrop, currentModal, state);
      setPrediction(predRes);
    } catch (e) {
      console.error('Mandi load error:', e);
      setError(
        isHi
          ? 'मंडी सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Failed to connect to Mandi API. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricesAndPrediction();
  }, [commodity, state, district]);

  const handleSelectQuickCrop = (cropName: string) => {
    setCommodity(cropName);
    loadPricesAndPrediction(cropName);
  };

  const records = data?.records || [];
  const tripFreight = distanceKm * freightRate;
  const freightPerQtl = volumeQtl > 0 ? Math.round(tripFreight / volumeQtl) : 0;
  const bestModalPrice = records.length > 0 ? records[0]?.modal_price || 0 : prediction?.current_modal_price || 0;

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6">
      {/* ─── Top Header & Sub-Tabs ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E8C99A] pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#241909] flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-[#E07B39]" />
            <span>{tx.title}</span>
          </h2>
          <p className="text-sm font-semibold text-[#5C4A30] mt-1">{tx.subtitle}</p>
        </div>

        {/* View Switcher: Arrivals vs Prediction */}
        <div className="flex items-center bg-[#FEFADC] p-1.5 rounded-xl border border-[#E8C99A] flex-shrink-0">
          <button
            onClick={() => setActiveSubTab('arrivals')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeSubTab === 'arrivals'
                ? 'bg-[#241909] text-[#FEFADC] shadow-sm'
                : 'text-[#5C4A30] hover:text-[#241909]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>{tx.tabArrivals}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('prediction')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeSubTab === 'prediction'
                ? 'bg-[#241909] text-[#FEFADC] shadow-sm'
                : 'text-[#5C4A30] hover:text-[#241909]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F3B391]" />
            <span>{tx.tabPrediction}</span>
          </button>
        </div>
      </div>

      {/* ─── 1-Click Quick Crop Selector Pills ─── */}
      <div className="bg-[#FEFADC] p-4 rounded-xl border border-[#E8C99A] space-y-2.5">
        <span className="text-xs font-semibold text-[#5C4A30] uppercase tracking-wider block">
          {tx.quickSelect}
        </span>
        <div className="flex flex-wrap gap-2">
          {COMMON_CROP_LIST.map((crop) => {
            const isSelected = commodity.toLowerCase() === crop.name.toLowerCase();
            return (
              <button
                key={crop.name}
                onClick={() => handleSelectQuickCrop(crop.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#241909] text-[#FEFADC] border-[#241909] shadow-md '
                    : 'bg-[#FFFDF5] text-[#5C4A30] border-[#E8C99A] hover:bg-[#F3B391] hover:text-[#241909]'
                }`}
              >
                <span>{isHi ? crop.hindi : crop.name}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-[#3A7D44]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Query Location & Crop Inputs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FEFADC] p-4 sm:p-5 rounded-xl border border-[#E8C99A]">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#241909] mb-1.5">{tx.state}</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FFFDF5] text-sm font-bold text-[#241909] focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#241909] mb-1.5">{tx.district}</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FFFDF5] text-sm font-bold text-[#241909] focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#241909] mb-1.5">{tx.commodity}</label>
          <input
            type="text"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FFFDF5] text-sm font-bold text-[#241909] focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
          />
        </div>
      </div>

      <button
        onClick={() => loadPricesAndPrediction()}
        disabled={loading}
        className="btn-primary w-full py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 shadow-md"
      >
        <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? tx.searching : tx.search}</span>
      </button>

      {error && (
        <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-sm font-bold text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SUB-VIEW 1: LIVE APMC MARKET ARRIVALS                                   */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'arrivals' && (
        <div className="space-y-6">
          {records.length > 0 ? (
            <>
              {/* Recharts Bar Chart */}
              <div className="agro-card-warm p-5 sm:p-6 rounded-xl border border-[#E8C99A] space-y-4">
                <span className="text-xs sm:text-sm font-semibold text-[#5C4A30] uppercase tracking-wide block">
                  {tx.chartLabel}
                </span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={records} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                      <XAxis
                        dataKey="market"
                        tick={{ fontSize: 11, fill: '#241909', fontWeight: 700 }}
                        interval={0}
                        angle={-10}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#5C4A30', fontWeight: 700 }}
                        domain={['dataMin - 200', 'dataMax + 200']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FEFADC',
                          border: '2px solid #E8C99A',
                          borderRadius: '12px',
                          color: '#241909',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                        formatter={(val: any) => [`₹${val} / Quintal`, isHi ? 'मोडल भाव' : 'Modal Price']}
                      />
                      <Bar dataKey="modal_price" radius={[8, 8, 0, 0]}>
                        {records.map((_e: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#E07B39' : '#F3B391'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E8C99A] shadow-sm">
                <table className="w-full text-left text-sm sm:text-base">
                  <thead className="bg-[#F6D4BA] text-[#5C4A30] uppercase font-semibold text-xs sm:text-sm tracking-wider border-b-2 border-[#E8C99A]">
                    <tr>
                      <th className="p-4">{tx.market}</th>
                      <th className="p-4">{tx.districtCol}</th>
                      <th className="p-4">{tx.minPrice}</th>
                      <th className="p-4">{tx.maxPrice}</th>
                      <th className="p-4 text-[#241909] font-bold">{tx.modalPrice}</th>
                      <th className="p-4">{tx.reportedOn}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8C99A] bg-[#FEFADC]">
                    {records.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F6D4BA]/60 transition-colors">
                        <td className="p-4 font-semibold text-[#241909]">{r.market}</td>
                        <td className="p-4 font-bold text-[#5C4A30]">{r.district}</td>
                        <td className="p-4 font-mono font-bold text-[#5C4A30]">₹{r.min_price}</td>
                        <td className="p-4 font-mono font-bold text-[#5C4A30]">₹{r.max_price}</td>
                        <td className="p-4 font-mono font-bold text-[#1E472D] text-lg">₹{r.modal_price}</td>
                        <td className="p-4 text-[#5C4A30] text-xs sm:text-sm font-mono font-bold">
                          {r.arrival_date || (isHi ? 'आज' : 'Today')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Transportation Net Realization Calculator */}
              <div className="agro-card-warm p-5 sm:p-6 rounded-xl border border-[#E8C99A] space-y-4">
                <div className="border-b border-[#E8C99A] pb-3">
                  <h4 className="text-base sm:text-lg font-semibold text-[#241909] flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#3A7D44]" />
                    <span>{tx.freightCalc}</span>
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-[#5C4A30] mt-1">{tx.freightDesc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm font-bold text-[#241909]">
                  <div>
                    <label className="block mb-1.5 text-xs sm:text-sm font-semibold text-[#5C4A30]">
                      {tx.distance} <span className="text-base font-bold text-[#241909]">{distanceKm} {tx.km}</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full accent-[#E07B39] h-2 bg-[#E8C99A] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs sm:text-sm font-semibold text-[#5C4A30]">
                      {tx.freightRate} <span className="text-base font-bold text-[#241909]">₹{freightRate}/km</span>
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="50"
                      value={freightRate}
                      onChange={(e) => setFreightRate(Number(e.target.value))}
                      className="w-full accent-[#E07B39] h-2 bg-[#E8C99A] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs sm:text-sm font-semibold text-[#5C4A30]">
                      {tx.volume} <span className="text-base font-bold text-[#241909]">{volumeQtl} {tx.qtl}</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={volumeQtl}
                      onChange={(e) => setVolumeQtl(Number(e.target.value))}
                      className="w-full accent-[#E07B39] h-2 bg-[#E8C99A] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-[#FEFADC] border border-[#E8C99A] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
                  <div>
                    <span className="text-[#5C4A30] font-semibold">{tx.overhead}</span>
                    <span className="font-mono font-bold text-[#C0392B] ml-2 text-base">
                      -₹{freightPerQtl} / {isHi ? 'क्विंटल' : 'Qtl'}
                    </span>
                    <span className="text-xs text-[#5C4A30] ml-1.5 font-semibold">({isHi ? 'कुल' : 'Total'} ₹{tripFreight})</span>
                  </div>

                  <div>
                    <span className="text-[#5C4A30] font-semibold">{tx.netReturn}</span>
                    <span className="font-mono font-bold text-[#1E472D] ml-2 text-xl sm:text-2xl">
                      ₹{Math.max(0, (bestModalPrice || 7200) - freightPerQtl)} / {isHi ? 'क्विंटल' : 'Qtl'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : !loading ? (
            <div className="p-8 text-center bg-[#FEFADC] border-2 border-dashed border-[#E8C99A] rounded-xl text-base font-bold text-[#5C4A30]">
              {tx.noData(commodity, district)}
            </div>
          ) : null}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SUB-VIEW 2: 14-DAY PRICE PREDICTION & SELL / HOLD RECOMMENDATION       */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'prediction' && prediction && (
        <div className="space-y-6">
          {/* Hero KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FEFADC] rounded-xl p-4 border border-[#E8C99A]">
              <span className="text-xs font-semibold text-[#5C4A30] block mb-1">{tx.currModal}</span>
              <span className="text-xl sm:text-2xl font-bold text-[#241909] font-mono">
                ₹{prediction.current_modal_price}
              </span>
              <span className="text-xs text-[#5C4A30] block mt-1">/ {isHi ? 'क्विंटल' : 'Quintal'}</span>
            </div>

            <div className="bg-[#FEFADC] rounded-xl p-4 border border-[#E8C99A]">
              <span className="text-xs font-semibold text-[#5C4A30] block mb-1">{tx.mspFloor}</span>
              <span className="text-xl sm:text-2xl font-bold text-[#3A7D44] font-mono">
                ₹{prediction.msp_benchmark}
              </span>
              <span className="text-xs text-[#3A7D44] font-bold block mt-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {isHi ? 'सरकारी न्यूनतम समर्थन मूल्य' : 'Official Base'}
              </span>
            </div>

            <div className="bg-[#FEFADC] rounded-xl p-4 border border-[#E8C99A]">
              <span className="text-xs font-semibold text-[#5C4A30] block mb-1">{tx.forecast14}</span>
              <span className="text-xl sm:text-2xl font-bold text-[#E07B39] font-mono">
                ₹{prediction.forecast_14d_price}
              </span>
              <span className="text-xs text-[#E07B39] font-bold block mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {prediction.expected_change >= 0 ? `+₹${prediction.expected_change}` : `-₹${Math.abs(prediction.expected_change)}`} ({prediction.expected_change_pct}%)
              </span>
            </div>

            <div className="bg-[#FEFADC] rounded-xl p-4 border border-[#E8C99A]">
              <span className="text-xs font-semibold text-[#5C4A30] block mb-1">{tx.expectedChange}</span>
              <span className={`text-base sm:text-lg font-bold uppercase flex items-center gap-1 ${
                prediction.trend_direction === 'RISING' ? 'text-[#3A7D44]' : 'text-[#5C4A30]'
              }`}>
                {prediction.trend_direction === 'RISING' ? (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-[#3A7D44]" />
                    {isHi ? 'तेजी के संकेत' : 'Firm / Rising'}
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-[#5C4A30]" />
                    {isHi ? 'स्थिर भाव' : 'Stable'}
                  </>
                )}
              </span>
              <span className="text-xs text-[#5C4A30] block mt-1">14-Day Horizon</span>
            </div>
          </div>

          {/* Actionable Sell vs. Hold Advisory Box */}
          <div className="bg-[#FFFDF5] border border-[#E8C99A] rounded-xl p-6 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C99A] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#3A7D44]" />
                <h3 className="text-lg sm:text-xl font-semibold text-[#241909]">
                  {tx.sellHoldTitle}
                </h3>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border tracking-wide uppercase ${
                prediction.recommendation.action === 'HOLD'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-green-100 text-green-900 border-green-300'
              }`}>
                {isHi ? prediction.recommendation.badge : prediction.recommendation.badge_en}
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-[#241909] leading-relaxed">
              {isHi ? prediction.recommendation.reason_hi : prediction.recommendation.reason_en}
            </p>
          </div>

          {/* 14-Day Day-by-Day Forecast Curve Chart */}
          <div className="agro-card-warm p-5 sm:p-6 rounded-xl border border-[#E8C99A] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-[#5C4A30] uppercase tracking-wide">
                {tx.chartForecastLabel}
              </span>
              <span className="text-xs font-bold text-[#3A7D44]">
                --- MSP Floor: ₹{prediction.msp_benchmark}
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction.forecast_timeline} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#241909', fontWeight: 700 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#5C4A30', fontWeight: 700 }}
                    domain={['dataMin - 150', 'dataMax + 150']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FEFADC',
                      border: '2px solid #E8C99A',
                      borderRadius: '12px',
                      color: '#241909',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                    formatter={(val: any) => [`₹${val} / Qtl`, isHi ? 'अनुमानित भाव' : 'Projected Rate']}
                  />
                  <ReferenceLine
                    y={prediction.msp_benchmark}
                    stroke="#3A7D44"
                    strokeDasharray="4 4"
                    label={{ value: 'MSP', fill: '#3A7D44', fontSize: 10, fontWeight: 700 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected_modal"
                    stroke="#E07B39"
                    strokeWidth={3}
                    dot={{ fill: '#E07B39', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 14-Day Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E8C99A] shadow-sm">
            <table className="w-full text-left text-sm sm:text-base">
              <thead className="bg-[#F6D4BA] text-[#5C4A30] uppercase font-semibold text-xs sm:text-sm tracking-wider border-b-2 border-[#E8C99A]">
                <tr>
                  <th className="p-3.5">{tx.dayCol}</th>
                  <th className="p-3.5">{tx.dateCol}</th>
                  <th className="p-3.5">{tx.projMin}</th>
                  <th className="p-3.5 text-[#241909] font-bold">{tx.projModal}</th>
                  <th className="p-3.5">{tx.projMax}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C99A] bg-[#FEFADC]">
                {prediction.forecast_timeline.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#F6D4BA]/60 transition-colors">
                    <td className="p-3.5 font-semibold text-[#241909]">{row.day}</td>
                    <td className="p-3.5 font-bold text-[#5C4A30]">{row.date}</td>
                    <td className="p-3.5 font-mono font-bold text-[#5C4A30]">₹{row.projected_min}</td>
                    <td className="p-3.5 font-mono font-bold text-[#1E472D] text-base sm:text-lg">
                      ₹{row.projected_modal}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#5C4A30]">₹{row.projected_max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandiRadar;
