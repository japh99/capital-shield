import React, { useState, useEffect } from 'react';
import { Baseball, Zap, Copy, RefreshCw, BarChart, Info } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
}

const MlbModule = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
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
    } catch (error) {
      console.error("Error cargando MLB", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMlbMatches(); }, []);

  const runAnalysis = async () => {
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'mlb',
        h_rating: ratingH,
        a_rating: ratingA,
        line: marketLine
      });
      setAnalysis(resp.data);
    } catch (error) {
      alert("Error en el cálculo MLB");
    }
  };

  const copyAIPrompt = () => {
    const prompt = `Actúa como un Sabermétrico y Analista de MLB.
EVENTO: ${selectedMatch?.home_team} vs ${selectedMatch?.away_team}
DATA MATEMÁTICA:
- Diferencial de Carreras Proyectado: ${analysis?.expected_margin}
- Línea de Mercado (Run Line): ${marketLine}
- Edge Calculado: ${analysis?.edge} carreras.

TAREA DE INVESTIGACIÓN CUALITATIVA:
1. Confirmar Starting Pitchers (SP): ¿Hay cambios de última hora en los abridores?
2. Factor Clima: ¿Hacia dónde sopla el viento y cómo afecta la humedad al Park Factor hoy?
3. Bullpen: ¿Están disponibles los cerradores principales o vienen de una serie larga?
Analiza si estos factores validan mi ventaja de ${analysis?.edge} carreras o si el pitcher abridor cambia el escenario por completo.`;
    
    navigator.clipboard.writeText(prompt);
    alert("Prompt de MLB copiado.");
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-blue-500 flex items-center gap-2">
            <Baseball size={28} /> MLB DIAMOND
          </h2>
          <p className="text-gray-500 text-sm">Análisis de Run Line basado en Probabilidades Sabermétricas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Mercado MLB */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cartelera MLB</span>
            <button onClick={fetchMlbMatches} className="text-blue-500 hover:rotate-180 transition-all">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-white">
            {loading ? <p className="text-center text-xs py-10 opacity-50">Obteniendo líneas de carrera...</p> : 
              matches.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all ${selectedMatch?.id === m.id ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="font-bold">{m.home_team}</div>
                  <div className="text-gray-400">vs {m.away_team}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* Columna 2: Inputs Sabermétricos */}
        <div className="glass-card p-5 space-y-5 border-t-2 border-t-blue-500">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ajuste de Equipo/Pitcher</span>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold">Rating {selectedMatch?.home_team || 'Local'}</label>
              <input type="number" className="input-field mt-1" placeholder="Ej: 1550" value={ratingH} onChange={e => setRatingH(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold">Rating {selectedMatch?.away_team || 'Visita'}</label>
              <input type="number" className="input-field mt-1" placeholder="Ej: 1480" value={ratingA} onChange={e => setRatingA(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-blue-500 uppercase font-bold">Run Line (Cuota Mercado)</label>
              <input type="number" step="0.5" className="input-field mt-1 border-blue-500/20" placeholder="Ej: -1.5" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            className="btn-primary w-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            <BarChart size={18} /> PROYECTAR CARRERAS
          </button>
        </div>

        {/* Columna 3: Dashboard MLB */}
        <div className="space-y-6">
          {analysis ? (
            <>
              <div className="glass-card p-6 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
                <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest text-white">Edge Sabermétrico</h3>
                <div className="text-5xl font-black mt-2 text-white">
                  {analysis.edge > 0 ? `+${analysis.edge}` : analysis.edge}
                </div>
                <p className="text-[10px] mt-2 text-blue-400 font-mono">Margen de Carreras: {analysis.expected_margin}</p>
              </div>

              <div className="glass-card p-5 border-dashed border-white/10 bg-black/40">
                <div className="flex items-center gap-2 text-blue-400 mb-3 font-bold text-xs uppercase">
                  <Info size={14} /> Factores Externos AI
                </div>
                <button 
                  onClick={copyAIPrompt}
                  className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all text-blue-100 uppercase"
                >
                  <Copy size={12} /> Copiar Análisis de Pitchers
                </button>
              </div>
            </>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-10 text-center opacity-20 border-dashed">
              <Baseball size={40} className="mb-4" />
              <p className="text-xs uppercase tracking-widest">Esperando Selección de Juego</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MlbModule;
