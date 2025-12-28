import React, { useState, useEffect } from 'react';
import { Activity, Zap, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [marketLine, setMarketLine] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchNbaMatches = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'spreads' }
      });
      setMatches(resp.data.slice(0, 10));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(); }, []);

  const runAnalysis = async () => {
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'nba', h_rating: ratingH, a_rating: ratingA, line: marketLine
      });
      setAnalysis(resp.data);
    } catch (e) { alert("Error"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-orange-500 flex items-center gap-2">
        <Activity size={24} /> NBA RADAR
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <button onClick={fetchNbaMatches} className="text-[10px] text-orange-500 mb-4 uppercase font-bold tracking-widest flex items-center gap-1">
            <RefreshCw size={12} /> Sincronizar
          </button>
          <div className="space-y-1">
            {loading ? <p className="text-xs opacity-50">Cargando...</p> : 
              matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-2 rounded text-[10px] ${selectedMatch?.id === m.id ? 'bg-orange-500/20' : 'hover:bg-white/5'}`}>
                  {m.home_team} vs {m.away_team}
                </button>
              ))
            }
          </div>
        </div>
        <div className="space-y-4">
          <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-sm" placeholder="Rating Local" value={ratingH} onChange={e => setRatingH(e.target.value)} />
          <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-sm" placeholder="Rating Visita" value={ratingA} onChange={e => setRatingA(e.target.value)} />
          <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-sm" placeholder="Spread Mercado" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
          <button onClick={runAnalysis} className="w-full bg-orange-600 p-4 rounded-lg font-bold">ANALIZAR</button>
          {analysis && <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center font-bold text-2xl">EDGE: {analysis.edge}</div>}
        </div>
      </div>
    </div>
  );
};
export default NbaModule;
