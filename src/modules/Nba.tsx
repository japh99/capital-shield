import React, { useState, useEffect } from 'react';
import { Dribbble, Zap, Copy, RefreshCw, Activity, Info } from 'lucide-react';
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
      setMatches(resp.data.slice(0, 15));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(); }, []);

  const runAnalysis = async () => {
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'nba', h_rating: ratingH, a_rating: ratingA, line: marketLine
      });
      setAnalysis(resp.data);
    } catch (error) { alert("Error"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-orange-500 flex items-center gap-2">
        <Dribbble size={28} /> NBA RADAR
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <div className="flex justify-between mb-4">
            <span className="text-xs font-bold text-gray-400">Jornada NBA</span>
            <button onClick={fetchNbaMatches} className="text-orange-500"><RefreshCw size={14} /></button>
          </div>
          {loading ? <p className="text-xs opacity-50">Cargando...</p> : 
            matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-2 mb-1 rounded text-xs ${selectedMatch?.id === m.id ? 'bg-orange-500/20' : 'hover:bg-white/5'}`}>
                {m.home_team} vs {m.away_team}
              </button>
            ))
          }
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10 border-t-orange-500">
           <input className="w-full bg-black/40 border border-white/10 p-2 mb-4 rounded" placeholder="Rating Local" onChange={e => setRatingH(e.target.value)} />
           <input className="w-full bg-black/40 border border-white/10 p-2 mb-4 rounded" placeholder="Rating Visita" onChange={e => setRatingA(e.target.value)} />
           <input className="w-full bg-black/40 border border-white/10 p-2 mb-4 rounded" placeholder="Línea Mercado" onChange={e => setMarketLine(e.target.value)} />
           <button onClick={runAnalysis} className="w-full bg-orange-600 p-3 rounded font-bold flex justify-center gap-2"><Activity size={18} /> ANALIZAR</button>
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          {analysis && <div className="text-4xl font-black text-white">{analysis.edge}</div>}
        </div>
      </div>
    </div>
  );
};
export default NbaModule;
