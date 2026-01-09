import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Search, RefreshCw, ArrowUpRight, ArrowDownRight, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // CoinGecko API  (sparkline=true for mini charts)
  const fetchCoins = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true'
      );
      setCoins(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(() => {
      fetchCoins(true);
    }, 45000); // Sparkline data update every 45 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* Navigation / Header */}
      <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">My Crypto</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  {isRefreshing ? 'Updating Charts...' : 'Live Market'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => fetchCoins()}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all border border-slate-800"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
            Refresh
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Market Cards with Mini Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filteredCoins.slice(0, 3).map((coin, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{coin.name} Trend</p>
                  <p className="text-2xl font-bold text-white mt-1">${coin.current_price.toLocaleString()}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold ${coin.price_change_percentage_24h > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
              
              {/* Mini Background Chart for Cards */}
              <div className="h-16 w-full mt-4 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={coin.sparkline_in_7d.price.map((p) => ({ p }))}>
                    <Line 
                      type="monotone" 
                      dataKey="p" 
                      stroke={coin.price_change_percentage_24h > 0 ? "#10b981" : "#ef4444"} 
                      strokeWidth={2} 
                      dot={false} 
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Assets Table */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/30 text-slate-400 text-[11px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 font-bold">Asset</th>
                  <th className="px-8 py-5 font-bold text-right">Price</th>
                  <th className="px-8 py-5 font-bold text-right">24h Change</th>
                  <th className="px-8 py-5 font-bold text-center">Last 7 Days</th>
                  <th className="px-8 py-5 font-bold text-right hidden lg:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-32 text-center">
                       <div className="flex flex-col items-center gap-4 text-slate-500">
                        <Activity className="animate-bounce text-blue-500" size={40} />
                        <p className="font-bold tracking-widest uppercase text-xs">Loading Market Charts...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCoins.map((coin) => (
                    <tr key={coin.id} className="group hover:bg-blue-500/[0.03] transition-all duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full bg-slate-800 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{coin.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono uppercase font-bold">{coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-white text-sm">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`flex items-center justify-end gap-1.5 font-bold text-sm ${coin.price_change_percentage_24h > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {coin.price_change_percentage_24h > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </div>
                      </td>
                      
                      {/* TABLE CHART COLUMN */}
                      <td className="px-8 py-5 w-48 h-20">
                        <div className="h-full w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={coin.sparkline_in_7d.price.map(p => ({ p }))}>
                              <Line 
                                type="basis" 
                                dataKey="p" 
                                stroke={coin.price_change_percentage_24h > 0 ? "#10b981" : "#ef4444"} 
                                strokeWidth={2} 
                                dot={false} 
                              />
                              <YAxis hide domain={['auto', 'auto']} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-right text-slate-500 text-xs hidden lg:table-cell font-mono">
                        ${coin.market_cap.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="text-center py-10 border-t border-slate-900">
  <p className="text-slate-500 text-xs font-medium tracking-wide">
    © 2026 My Crypto. All rights reserved. Designed & Developed by [Madhuranga Wijesooriya].
  </p>
  <p className="text-slate-600 text-[10px] mt-2 font-bold tracking-[0.3em] uppercase">
    Live Analytical Dashboard • Powered by CoinGecko
  </p>
</footer>
    </div>
  );
}

export default App;