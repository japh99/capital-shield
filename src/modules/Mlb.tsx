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
    } catch (error) { alert("Error en el cálculo"); }
  };

  const copyAIPrompt = () => {
    const prompt = `Actúa como Analista de MLB. 
Juego: ${selectedMatch?.home_team} vs ${selectedMatch?.away_team}. 
Edge Matemático: ${analysis?.edge} carreras. 
Investiga abridores (SP) y viento para confirmar valor.`;
    navigator.clipboard.writeText(prompt);
    alert("Prompt copiado.");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-blue-500 flex items-center gap-2">
        <Zap size={28} /> MLB DIAMOND
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partidos */}
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <button onClick={fetchMlbMatches} className="text-blue-500 mb-4 flex items-center gap-2 text-xs font-bold uppercase">
            <RefreshCw size={14} /> Actualizar
          </button>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {loading ? <p className="text-xs opacity-50">Cargando...</p> : 
              matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-3 rounded-lg text-[10px] ${selectedMatch?.id === m.id ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10'}`}>
                  {m.home_team} vs {m.away_team}
                </button>
              ))
            }
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-white/5 p-5 rounded-xl border border-white/10 border-t-2 border-t-blue-500">
           <div className="space-y-4">
             <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" placeholder="Rating Local" value={ratingH} onChange={e => setRatingH(e.target.value)} />
             <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" placeholder="Rating Visita" value={ratingA} onChange={e => setRatingA(e.target.value)} />
             <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" placeholder="Run Line" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
             <button onClick={runAnalysis} className="w-full bg-blue-600 p-4 rounded-lg font-bold flex items-center justify-center gap-2"><BarChart size={18} /> CALCULAR</button>
           </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {analysis && (
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
              <span className="text-xs text-blue-400 font-bold uppercase">Edge Sabermétrico</span>
              <div className="text-6xl font-black text-white mt-2">{analysis.edge}</div>
              <button onClick={copyAIPrompt} className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] flex items-center justify-center gap-2 font-bold uppercase">
                <Copy size={12} /> Copiar Prompt IA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MlbModule;
