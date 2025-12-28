import React, { useState, useEffect } from 'react';
import { Activity, Zap, Copy, RefreshCw, Info } from 'lucide-react';
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
        <Activity size={28} /> NBA RADAR
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <button onClick={fetchNbaMatches} className="text-orange-500 mb-4"><RefreshCw size={14} /></button>
          {loading ? <p>...</p> : matches.map(m => (
            <button key={m.id} onClick={() => setSelectedMatch(m)} className="block w-full text-left p-2 text-xs hover:bg-white/5">{m.home_team} vs {m.away_team}</button>
          ))}
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
           <input className="w-full bg-black/40 border border-white/10 p-2 mb-2 rounded" placeholder="Rating Home" onChange={e => setRatingH(e.target.value)} />
           <input className="w-full bg-black/40 border border-white/10 p-2 mb-2 rounded" placeholder="Rating Away" onChange={e => setRatingA(e.target.value)} />
           <input className="w-full bg-black/40 border border-white/10 p-2 mb-2 rounded" placeholder="Line" onChange={e => setMarketLine(e.target.value)} />
           <button onClick={runAnalysis} className="w-full bg-orange-600 p-2 rounded">ANALIZAR</button>
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center font-bold">
           {analysis && analysis.edge}
        </div>
      </div>
    </div>
  );
};
export default NbaModule;
