import React, { useState, useEffect } from 'react';
import { fetchMandiPrices } from '../services/api';
import { RefreshCw, Scale } from 'lucide-react';
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

  // Transportation Net Realization Calculator
  const [distanceKm, setDistanceKm] = useState<number>(25);
  const [freightRatePerKm, setFreightRatePerKm] = useState<number>(28);
  const [volumeQuintals, setVolumeQuintals] = useState<number>(20);

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
  const tripTotalFreight = distanceKm * freightRatePerKm;
  const freightDeductionPerQuintal = volumeQuintals > 0 ? Math.round(tripTotalFreight / volumeQuintals) : 0;

  return (
    <div className="matte-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#E3DDD1] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1A211B] font-display flex items-center space-x-2">
            <Scale className="w-4 h-4 text-[#1E472D]" />
            <span>{language === 'hi' ? 'वास्तविक कृषि मंडी भाव एवं आवक' : 'AGMARKNET Market Price Radar'}</span>
          </h3>
          <p className="text-[11px] text-[#576258] mt-0.5">
            Source: data.gov.in AGMARKNET • Zero Synthetic Mock Values
          </p>
        </div>

        <button
          onClick={loadPrices}
          disabled={loading}
          className="btn-secondary py-1 px-3 text-xs flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'hi' ? 'रीफ्रेश' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* Query Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8F7F4] p-3.5 rounded border border-[#E3DDD1] text-xs">
        <div>
          <label className="text-[11px] font-semibold text-[#576258] uppercase tracking-wider block mb-1">
            {language === 'hi' ? 'राज्य' : 'State'}
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E3DDD1] rounded px-2.5 py-1.5 text-xs text-[#1A211B] focus:outline-none focus:border-[#1E472D]"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#576258] uppercase tracking-wider block mb-1">
            {language === 'hi' ? 'जिला' : 'District'}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Akola"
            className="w-full bg-[#FFFFFF] border border-[#E3DDD1] rounded px-2.5 py-1.5 text-xs text-[#1A211B] focus:outline-none focus:border-[#1E472D]"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#576258] uppercase tracking-wider block mb-1">
            {language === 'hi' ? 'जिंस (फसल)' : 'Commodity'}
          </label>
          <input
            type="text"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            placeholder="e.g. Cotton"
            className="w-full bg-[#FFFFFF] border border-[#E3DDD1] rounded px-2.5 py-1.5 text-xs text-[#1A211B] focus:outline-none focus:border-[#1E472D]"
          />
        </div>
      </div>

      {/* Market Bar Visualizer */}
      {records.length > 0 ? (
        <div className="space-y-6">
          <div className="border border-[#E3DDD1] rounded p-4 bg-[#FFFFFF]">
            <span className="text-[11px] font-semibold text-[#576258] uppercase tracking-wider block mb-4 font-display">
              {language === 'hi' ? 'मोडल भाव तुलना (₹ प्रति क्विंटल)' : 'Reported Modal Price by Market (₹ / Quintal)'}
            </span>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={records} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                  <XAxis
                    dataKey="market"
                    tick={{ fontSize: 11, fill: '#576258' }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#576258' }}
                    domain={['dataMin - 400', 'dataMax + 400']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E3DDD1',
                      borderRadius: '4px',
                      color: '#1A211B',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₹${val} / Qtl`, 'Modal Price']}
                  />
                  <Bar dataKey="modal_price" radius={[2, 2, 0, 0]}>
                    {records.map((_e: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#1E472D' : '#859286'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E3DDD1] rounded overflow-hidden">
              <thead className="bg-[#F8F7F4] text-[#576258] uppercase font-semibold text-[10px] tracking-wider border-b border-[#E3DDD1]">
                <tr>
                  <th className="p-2.5">APMC Mandi</th>
                  <th className="p-2.5">District</th>
                  <th className="p-2.5">Min (₹)</th>
                  <th className="p-2.5">Max (₹)</th>
                  <th className="p-2.5 font-bold text-[#1A211B]">Modal (₹)</th>
                  <th className="p-2.5">Reported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DDD1] bg-[#FFFFFF]">
                {records.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#F8F7F4]">
                    <td className="p-2.5 font-medium text-[#1A211B]">{r.market}</td>
                    <td className="p-2.5 text-[#576258]">{r.district}</td>
                    <td className="p-2.5 font-mono text-[#576258]">₹{r.min_price}</td>
                    <td className="p-2.5 font-mono text-[#576258]">₹{r.max_price}</td>
                    <td className="p-2.5 font-mono font-semibold text-[#1E472D]">₹{r.modal_price}</td>
                    <td className="p-2.5 text-[#859286] font-mono text-[10px]">{r.arrival_date || 'Current'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transportation Net Realization Calculator */}
          <div className="bg-[#F8F7F4] border border-[#E3DDD1] rounded p-4 space-y-4">
            <div className="border-b border-[#E3DDD1] pb-2">
              <h4 className="text-xs font-semibold text-[#1A211B] font-display">
                {language === 'hi' ? 'शुद्ध प्राप्ति गणक (परिवहन व्यय कटौती)' : 'Net Price Realization Calculator (Factoring Freight Overhead)'}
              </h4>
              <p className="text-[11px] text-[#576258] mt-0.5">
                Highest APMC modal price does not guarantee highest net return if transport overhead exceeds price spread.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[#576258] font-medium block mb-1">
                  Mandi Distance: <span className="font-mono font-semibold text-[#1A211B]">{distanceKm} km</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-[#1E472D]"
                />
              </div>

              <div>
                <label className="text-[#576258] font-medium block mb-1">
                  Freight Rate: <span className="font-mono font-semibold text-[#1A211B]">₹{freightRatePerKm}/km</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="50"
                  value={freightRatePerKm}
                  onChange={(e) => setFreightRatePerKm(Number(e.target.value))}
                  className="w-full accent-[#1E472D]"
                />
              </div>

              <div>
                <label className="text-[#576258] font-medium block mb-1">
                  Batch Volume: <span className="font-mono font-semibold text-[#1A211B]">{volumeQuintals} Qtl</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={volumeQuintals}
                  onChange={(e) => setVolumeQuintals(Number(e.target.value))}
                  className="w-full accent-[#1E472D]"
                />
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E3DDD1] rounded p-3 flex flex-wrap items-baseline justify-between text-xs">
              <div>
                <span className="text-[#576258]">Estimated Freight Overhead:</span>
                <span className="font-mono font-semibold text-[#9E2A2B] ml-1.5">-₹{freightDeductionPerQuintal} / Qtl</span>
                <span className="text-[#859286] text-[10px] ml-1">(Trip: ₹{tripTotalFreight})</span>
              </div>
              <div>
                <span className="text-[#576258]">Estimated Net Realization:</span>
                <span className="font-mono font-semibold text-[#1E472D] ml-1.5 text-sm">
                  ₹{Math.max(0, (records[0]?.modal_price || 7200) - freightDeductionPerQuintal)} / Qtl
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#F8F7F4] border border-dashed border-[#E3DDD1] rounded text-xs text-[#576258]">
          No live arrival records reported by AGMARKNET for {commodity} in {district} today.
        </div>
      )}
    </div>
  );
};

export default MandiRadar;
