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
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-orange-500 flex items-center gap-2">
        <Activity size={28} /> NBA RADAR
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <button onClick={fetchNbaMatches} className="text-orange-500 mb-4 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
             <RefreshCw size={14} /> Actualizar
          </button>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {loading ? <p className="text-xs opacity-50 text-center py-4">Cargando...</p> : 
              matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-3 rounded-lg text-[10px] transition-all ${selectedMatch?.id === m.id ? 'bg-orange-500/20 border border-orange-500/50' : 'bg-white/5 hover:bg-white/10'}`}>
                  {m.home_team} vs {m.away_team}
                </button>
              ))
            }
          </div>
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10 border-t-2 border-t-orange-500">
           <div className="space-y-4">
             <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" placeholder="Rating Local" value={ratingH} onChange={e => setRatingH(e.target.value)} />
             <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" placeholder="Rating Visita" value={ratingA} onChange={e => setRatingA(e.target.value)} />
             <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" placeholder="Línea Mercado" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
             <button onClick={runAnalysis} className="w-full bg-orange-600 hover:bg-orange-500 p-4 rounded-lg font-bold transition-all shadow-lg shadow-orange-600/20">CALCULAR VALOR</button>
           </div>
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col items-center justify-center min-h-[200px]">
          {analysis ? (
            <div className="text-center">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Edge Detectado</span>
              <div className="text-6xl font-black text-white mt-2">{analysis.edge}</div>
            </div>
          ) : <Activity size={48} className="opacity-10" />}
        </div>
      </div>
    </div>
  );
};
export default NbaModule;
