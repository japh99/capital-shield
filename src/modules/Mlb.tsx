import React, { useState, useEffect } from 'react';
import { Zap, Copy, RefreshCw, BarChart, Info } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const MlbModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [marketLine, setMarketLine] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchMlbMatches = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/baseball_mlb/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'spreads' }
      });
      setMatches(resp.data.slice(0, 15));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMlbMatches(); }, []);

  const runAnalysis = async () => {
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'mlb', h_rating: ratingH, a_rating: ratingA, line: marketLine
      });
      setAnalysis(resp.data);
    } catch (error) { alert("Error"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-blue-500 flex items-center gap-2">
        <Zap size={28} /> MLB DIAMOND
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <button onClick={fetchMlbMatches} className="text-blue-500 mb-4"><RefreshCw size={14} /></button>
          {loading ? <p>Cargando...</p> : matches.map(m => (
            <button key={m.id} onClick={() => setSelectedMatch(m)} className="block w-full text-left p-2 text-[10px] hover:bg-white/5">{m.home_team} vs {m.away_team}</button>
          ))}
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10 border-t-2 border-t-blue-500">
           <input className="w-full bg-black/40 border border-white/10 p-3 mb-4 rounded-lg" placeholder="Rating Home" value={ratingH} onChange={e => setRatingH(e.target.value)} />
           <input className="w-full bg-black/40 border border-white/10 p-3 mb-4 rounded-lg" placeholder="Rating Away" value={ratingA} onChange={e => setRatingA(e.target.value)} />
           <input className="w-full bg-black/40 border border-white/10 p-3 mb-4 rounded-lg" placeholder="Run Line" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
           <button onClick={runAnalysis} className="w-full bg-blue-600 p-4 rounded-lg font-bold transition-all">ANALIZAR</button>
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
           {analysis && <div className="text-6xl font-black">{analysis.edge}</div>}
        </div>
      </div>
    </div>
  );
};
export default MlbModule;
