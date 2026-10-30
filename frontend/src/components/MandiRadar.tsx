import React, { useState, useEffect } from 'react';
import { fetchMandiPrices } from '../services/api';
import { TrendingUp, MapPin, Calendar, Info, RefreshCw } from 'lucide-react';
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

export const MandiRadar: React.FC<MandiRadarProps> = ({
  language,
  defaultState = 'Maharashtra',
  defaultDistrict = 'Akola',
  defaultCommodity = 'Cotton',
}) => {
  const [state, setState] = useState(defaultState);
  const [district, setDistrict] = useState(defaultDistrict);
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const res = await fetchMandiPrices(state, district || undefined, commodity || undefined);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const records = data?.records || [];

  return (
    <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sand/60">
        <div>
          <h3 className="text-lg font-black text-coffee flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-peach-dark" />
            <span>{language === 'hi' ? 'वास्तविक मंडी भाव एवं बाजार तुलना' : 'Live Mandi Price Intelligence'}</span>
          </h3>
          <p className="text-xs text-pitch/60">
            स्रोत: {data?.provenance?.source || 'data.gov.in / AGMARKNET'} •{' '}
            <span className="font-bold text-coffee">शून्य काल्पनिक डेटा (Zero Fabricated Data)</span>
          </p>
        </div>
        <button
          onClick={loadPrices}
          disabled={loading}
          className="flex items-center space-x-1.5 bg-sand hover:bg-sand-dark text-coffee text-xs font-bold px-3 py-1.5 rounded-xl border border-sand-dark transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'hi' ? 'रिफ्रेश करें' : 'Refresh'}</span>
        </button>
      </div>

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div>
          <label className="text-[11px] font-bold text-coffee/80 block mb-1">
            {language === 'hi' ? 'राज्य (State)' : 'State'}
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-cornsilk border border-sand rounded-xl px-3 py-2 text-xs font-medium text-pitch outline-none focus:border-peach"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-coffee/80 block mb-1">
            {language === 'hi' ? 'ज़िला (District)' : 'District'}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-cornsilk border border-sand rounded-xl px-3 py-2 text-xs font-medium text-pitch outline-none focus:border-peach"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-coffee/80 block mb-1">
            {language === 'hi' ? 'फसल / जिंस (Commodity)' : 'Commodity'}
          </label>
          <input
            type="text"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full bg-cornsilk border border-sand rounded-xl px-3 py-2 text-xs font-medium text-pitch outline-none focus:border-peach"
          />
        </div>
      </div>

      {/* Market Price Chart & List */}
      {records.length > 0 ? (
        <div className="space-y-4">
          {/* Chart */}
          <div className="bg-cornsilk border border-sand/60 rounded-xl p-4">
            <h4 className="text-xs font-bold text-coffee mb-3">
              {language === 'hi' ? `${commodity} का मॉडल भाव (रुपये प्रति क्विंटल)` : `${commodity} Modal Price (Rs/Quintal)`}
            </h4>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={records.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="market" tick={{ fontSize: 10, fill: '#241909' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#241909' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FEFADC', borderColor: '#F6D4BA', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val: any) => [`₹${val} / क्विंटल`, 'मॉडल भाव']}
                  />
                  <Bar dataKey="modal_price" fill="#F3B391" radius={[6, 6, 0, 0]}>
                    {records.slice(0, 6).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#e89467' : '#F3B391'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List of Mandi Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {records.map((r: any, idx: number) => (
              <div
                key={idx}
                className="bg-cornsilk border border-sand/60 rounded-xl p-3.5 text-xs flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="font-bold text-coffee text-sm">{r.market}</p>
                  <p className="text-[11px] text-pitch/60 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-peach-dark" />
                    <span>{r.district}, {r.state}</span>
                  </p>
                  <p className="text-[10px] text-pitch/40 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>आगमन तिथि: {r.arrival_date}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-coffee">₹{r.modal_price}</p>
                  <p className="text-[10px] text-pitch/50">प्रति क्विंटल</p>
                  <p className="text-[9px] text-pitch/40">
                    न्यूनतम ₹{r.min_price} - अधिकतम ₹{r.max_price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-cornsilk border border-sand/60 rounded-xl p-8 text-center text-xs text-pitch/60 space-y-2">
          <Info className="w-6 h-6 text-peach-dark mx-auto" />
          <p className="font-bold text-coffee text-sm">
            {language === 'hi' ? 'आज इस मंडी में कोई आवक दर्ज नहीं हुई है।' : 'No market arrivals reported for this query today.'}
          </p>
          <p className="text-[11px] max-w-md mx-auto">
            AgroShield केवल आधिकारिक AGMARKNET सरकारी डेटा प्रदर्शित करता है। जब स्थानीय मंडी समिति द्वारा डेटा अपलोड नहीं किया जाता, तो हम कोई काल्पनिक भाव प्रदर्शित नहीं करते।
          </p>
        </div>
      )}

      {/* Advisory on Net Return vs Transport */}
      <div className="mt-4 p-3 bg-peach/20 border border-peach/50 rounded-xl text-[11px] text-coffee/80 flex items-start space-x-2">
        <Info className="w-4 h-4 text-peach-dark flex-shrink-0 mt-0.5" />
        <span>
          महत्वपूर्ण सलाह: उच्चतम मॉडल भाव वाली मंडी हमेशा उच्चतम शुद्ध लाभ नहीं देती। दूर की मंडी में माल ले जाने से पहले परिवहन लागत, तुलाई और पल्लेदारी के खर्च की गणना अवश्य करें।
        </span>
      </div>
    </div>
  );
};
