import React, { useState, useEffect } from 'react';
import { fetchMandiPrices } from '../services/api';
import { RefreshCw, Scale, TrendingUp, Search } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface MandiRadarProps {
  language: string;
  defaultState?: string;
  defaultDistrict?: string;
  defaultCommodity?: string;
}

const t = {
  en: {
    title: 'AGMARKNET Agricultural Market Radar',
    subtitle: 'Direct daily arrivals & prices from data.gov.in / Ministry of Agriculture',
    state: 'State',
    district: 'District',
    commodity: 'Commodity (Crop)',
    refresh: 'Refresh Feed',
    chartLabel: 'Reported Modal Price by APMC Mandi (₹ / Quintal)',
    market: 'APMC Market Yard',
    districtCol: 'District',
    minPrice: 'Min Rate (₹)',
    maxPrice: 'Max Rate (₹)',
    modalPrice: 'Modal Rate (₹)',
    reportedOn: 'Arrival Date',
    noData: (c: string, d: string) => `No live AGMARKNET arrival records found for ${c} in ${d} today. You may refresh or check neighboring districts.`,
    freightCalc: 'Net Price Realization Calculator (Factoring Transport Costs)',
    freightDesc: 'A higher mandi price does not yield higher profit if transport freight exceeds the price spread.',
    distance: 'Distance to Mandi Yard:',
    freightRate: 'Vehicle Freight Rate:',
    volume: 'Produce Volume:',
    overhead: 'Estimated Transport Cost:',
    netReturn: 'Estimated Net Realization:',
    km: 'km',
    qtl: 'Quintals',
    search: 'Search Live Prices',
    searching: 'Querying AGMARKNET...',
  },
  hi: {
    title: 'कृषि मंडी भाव एवं दैनिक आवक (AGMARKNET)',
    subtitle: 'भारत सरकार (data.gov.in) कृषि मंत्रालय से सीधा प्रामाणिक डेटा',
    state: 'राज्य',
    district: 'जिला',
    commodity: 'फसल (जिंस)',
    refresh: 'ताज़ा करें',
    chartLabel: 'मंडी अनुसार मोडल भाव तुलना (₹ प्रति क्विंटल)',
    market: 'APMC कृषि मंडी',
    districtCol: 'जिला',
    minPrice: 'न्यूनतम (₹)',
    maxPrice: 'अधिकतम (₹)',
    modalPrice: 'मोडल/औसत भाव (₹)',
    reportedOn: 'आवक तारीख',
    noData: (c: string, d: string) => `${d} जिले में आज ${c} की कोई आवक दर्ज नहीं हुई है। कृपया अन्य जिला या फसल चुनकर देखें।`,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Net price calculator
  const [distanceKm, setDistanceKm] = useState(25);
  const [freightRate, setFreightRate] = useState(28);
  const [volumeQtl, setVolumeQtl] = useState(20);

  // Sync state when props change (e.g. farmer switches active crop)
  useEffect(() => {
    if (defaultCommodity) {
      setCommodity(defaultCommodity);
    }
  }, [defaultCommodity]);

  useEffect(() => {
    if (defaultState) setState(defaultState);
    if (defaultDistrict) setDistrict(defaultDistrict);
  }, [defaultState, defaultDistrict]);

  const loadPrices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchMandiPrices(state, district || undefined, commodity || undefined);
      setData(res);
    } catch (e) {
      console.error(e);
      setError(isHi ? 'मंडी सर्वर से संपर्क नहीं हो सका। कृपया बाद में प्रयास करें।' : 'Failed to connect to Mandi API. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [commodity, state, district]);

  const records = data?.records || [];
  const tripFreight = distanceKm * freightRate;
  const freightPerQtl = volumeQtl > 0 ? Math.round(tripFreight / volumeQtl) : 0;
  const bestModalPrice = records.length > 0 ? (records[0]?.modal_price || 0) : 0;

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C99A] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#241909] flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-[#E07B39]" />
            <span>{tx.title}</span>
          </h2>
          <p className="text-sm font-semibold text-[#5C4A30] mt-1">{tx.subtitle}</p>
        </div>
        <button
          onClick={loadPrices}
          disabled={loading}
          className="btn-secondary py-2 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{tx.refresh}</span>
        </button>
      </div>

      {/* Query Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FEFADC] p-4 sm:p-5 rounded-2xl border-2 border-[#E8C99A]">
        <div>
          <label className="block text-xs sm:text-sm font-extrabold text-[#241909] mb-1.5">{tx.state}</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FFFDF5] text-sm font-bold text-[#241909] focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-extrabold text-[#241909] mb-1.5">{tx.district}</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FFFDF5] text-sm font-bold text-[#241909] focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-extrabold text-[#241909] mb-1.5">{tx.commodity}</label>
          <input
            type="text"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8C99A] bg-[#FFFDF5] text-sm font-bold text-[#241909] focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
          />
        </div>
      </div>

      <button
        onClick={loadPrices}
        disabled={loading}
        className="btn-primary w-full py-3.5 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-md"
      >
        <Search className="w-4 h-4" />
        <span>{loading ? tx.searching : tx.search}</span>
      </button>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-sm font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Results View */}
      {records.length > 0 ? (
        <div className="space-y-6">
          {/* Recharts Bar Chart */}
          <div className="agro-card-warm p-5 rounded-2xl border-2 border-[#E8C99A]">
            <span className="text-xs sm:text-sm font-extrabold text-[#5C4A30] uppercase tracking-wide block mb-4">
              {tx.chartLabel}
            </span>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={records} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <XAxis
                    dataKey="market"
                    tick={{ fontSize: 11, fill: '#241909', fontWeight: 600 }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#5C4A30', fontWeight: 600 }}
                    domain={['dataMin - 300', 'dataMax + 300']}
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
                  <Bar dataKey="modal_price" radius={[6, 6, 0, 0]}>
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

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-[#E8C99A]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F6D4BA] text-[#5C4A30] uppercase font-extrabold text-xs tracking-wider border-b-2 border-[#E8C99A]">
                <tr>
                  <th className="p-3.5">{tx.market}</th>
                  <th className="p-3.5">{tx.districtCol}</th>
                  <th className="p-3.5">{tx.minPrice}</th>
                  <th className="p-3.5">{tx.maxPrice}</th>
                  <th className="p-3.5 text-[#241909] font-black">{tx.modalPrice}</th>
                  <th className="p-3.5">{tx.reportedOn}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C99A] bg-[#FEFADC]">
                {records.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#F6D4BA]/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#241909]">{r.market}</td>
                    <td className="p-3.5 font-semibold text-[#5C4A30]">{r.district}</td>
                    <td className="p-3.5 font-mono font-bold text-[#5C4A30]">₹{r.min_price}</td>
                    <td className="p-3.5 font-mono font-bold text-[#5C4A30]">₹{r.max_price}</td>
                    <td className="p-3.5 font-mono font-black text-[#1E472D] text-base">₹{r.modal_price}</td>
                    <td className="p-3.5 text-[#5C4A30] text-xs font-mono font-bold">{r.arrival_date || (isHi ? 'आज' : 'Today')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transportation Net Realization Calculator */}
          <div className="agro-card-warm p-5 sm:p-6 rounded-2xl border-2 border-[#E8C99A] space-y-4">
            <div className="border-b border-[#E8C99A] pb-3">
              <h4 className="text-base sm:text-lg font-extrabold text-[#241909] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#3A7D44]" />
                <span>{tx.freightCalc}</span>
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-[#5C4A30] mt-1">{tx.freightDesc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm font-bold text-[#241909]">
              <div>
                <label className="block mb-1.5 text-xs sm:text-sm font-extrabold text-[#5C4A30]">
                  {tx.distance} <span className="text-base font-black text-[#241909]">{distanceKm} {tx.km}</span>
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
                <label className="block mb-1.5 text-xs sm:text-sm font-extrabold text-[#5C4A30]">
                  {tx.freightRate} <span className="text-base font-black text-[#241909]">₹{freightRate}/km</span>
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
                <label className="block mb-1.5 text-xs sm:text-sm font-extrabold text-[#5C4A30]">
                  {tx.volume} <span className="text-base font-black text-[#241909]">{volumeQtl} {tx.qtl}</span>
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

            <div className="bg-[#FEFADC] border-2 border-[#E8C99A] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
              <div>
                <span className="text-[#5C4A30]">{tx.overhead}</span>
                <span className="font-mono font-black text-[#C0392B] ml-2 text-base">
                  -₹{freightPerQtl} / {isHi ? 'क्विंटल' : 'Qtl'}
                </span>
                <span className="text-xs text-[#5C4A30] ml-1.5 font-semibold">({isHi ? 'कुल' : 'Total'} ₹{tripFreight})</span>
              </div>

              <div>
                <span className="text-[#5C4A30]">{tx.netReturn}</span>
                <span className="font-mono font-black text-[#1E472D] ml-2 text-lg sm:text-xl">
                  ₹{Math.max(0, (bestModalPrice || 7200) - freightPerQtl)} / {isHi ? 'क्विंटल' : 'Qtl'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : !loading ? (
        <div className="p-8 text-center bg-[#FEFADC] border-2 border-dashed border-[#E8C99A] rounded-2xl text-sm font-bold text-[#5C4A30]">
          {tx.noData(commodity, district)}
        </div>
      ) : null}
    </div>
  );
};

export default MandiRadar;
