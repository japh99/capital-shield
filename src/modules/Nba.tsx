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
    } catch (error) { alert("Error en el cálculo"); }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-2">
        <Activity size={24} /> NBA RADAR
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <button onClick={fetchNbaMatches} className="mb-4 text-xs bg-orange-500 px-2 py-1 rounded">Actualizar Partidos</button>
          <div className="space-y-2">
            {matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className="block w-full text-left p-2 hover:bg-white/10 text-xs rounded">
                {m.home_team} vs {m.away_team}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <input className="w-full bg-black border border-white/20 p-2 rounded" placeholder="Rating Local" value={ratingH} onChange={e => setRatingH(e.target.value)} />
          <input className="w-full bg-black border border-white/20 p-2 rounded" placeholder="Rating Visita" value={ratingA} onChange={e => setRatingA(e.target.value)} />
          <input className="w-full bg-black border border-white/20 p-2 rounded" placeholder="Hándicap" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
          <button onClick={runAnalysis} className="w-full bg-orange-600 p-3 rounded font-bold">ANALIZAR</button>
          {analysis && <div className="text-3xl font-bold text-white mt-4 text-center">EDGE: {analysis.edge}</div>}
        </div>
      </div>
    </div>
  );
};
export default NbaModule;
