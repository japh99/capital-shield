import React, { useState, useEffect } from 'react';
import { Basketball, Zap, Copy, RefreshCw, Activity, Info } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
}

const NbaModule = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
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
    } catch (error) {
      console.error("Error cargando NBA", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNbaMatches(); }, []);

  const runAnalysis = async () => {
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'nba',
        h_rating: ratingH,
        a_rating: ratingA,
        line: marketLine
      });
      setAnalysis(resp.data);
    } catch (error) {
      alert("Error en el cálculo NBA");
    }
  };

  const copyAIPrompt = () => {
    const prompt = `Actúa como un Especialista en Hándicap de la NBA.
EVENTO: ${selectedMatch?.home_team} vs ${selectedMatch?.away_team}
ANÁLISIS MATEMÁTICO:
- Margen Proyectado: ${analysis?.expected_margin} puntos.
- Línea de Mercado: ${marketLine}.
- Edge (Ventaja): ${analysis?.edge} puntos.

TAREA: Verifica los siguientes puntos clave de la NBA para este partido:
1. Reporte de Lesiones (Injury Report): ¿Juegan las estrellas principales?
2. Factor Cansancio: ¿Alguno de los equipos está en "Back-to-Back" o al final de una gira de visitantes?
3. Ritmo de Juego (Pace): ¿Hay cambios en la rotación que afecten la ofensiva?
Concluye si la ventaja de ${analysis?.edge} puntos es sólida o si hay un riesgo alto por descanso de jugadores.`;
    
    navigator.clipboard.writeText(prompt);
    alert("Prompt de NBA copiado.");
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-orange-500 flex items-center gap-2">
            <Basketball size={28} /> NBA RADAR
          </h2>
          <p className="text-gray-500 text-sm">Cálculo de Spread basado en Power Ratings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Partidos NBA */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Jornada NBA</span>
            <button onClick={fetchNbaMatches} className="text-orange-500 hover:rotate-180 transition-all">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center text-xs py-10 opacity-50">Sincronizando con Las Vegas...</p> : 
              matches.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all ${selectedMatch?.id === m.id ? 'bg-orange-500/20 border border-orange-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="font-bold">{m.home_team}</div>
                  <div className="text-gray-400">@ {m.away_team}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* Columna 2: Power Ratings */}
        <div className="glass-card p-5 space-y-5 border-t-2 border-t-orange-500">
          <span className="text-xs font-bold text-gray-400 uppercase">Ajuste de Ratings</span>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Rating {selectedMatch?.home_team || 'Local'}</label>
              <input type="number" className="input-field mt-1" placeholder="Ej: 112.5" value={ratingH} onChange={e => setRatingH(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Rating {selectedMatch?.away_team || 'Visita'}</label>
              <input type="number" className="input-field mt-1" placeholder="Ej: 108.2" value={ratingA} onChange={e => setRatingA(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-orange-500/70 uppercase font-bold">Línea (Spread de la Casa)</label>
              <input type="number" step="0.5" className="input-field mt-1 border-orange-500/20" placeholder="Ej: -5.5" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            className="btn-primary w-full bg-orange-600 hover:bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            <Activity size={18} /> CALCULAR SPREAD
          </button>
        </div>

        {/* Columna 3: Resultados NBA */}
        <div className="space-y-6">
          {analysis ? (
            <>
              <div className="glass-card p-6 border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-500/5 to-transparent">
                <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest">Edge Detectado</h3>
                <div className="text-5xl font-black mt-2 text-white">
                  {analysis.edge > 0 ? `+${analysis.edge}` : analysis.edge}
                </div>
                <p className="text-[10px] mt-2 text-orange-400 font-mono italic">Fair Line Proyectada: {analysis.expected_margin}</p>
              </div>

              <div className="glass-card p-5 border-dashed border-white/10">
                <div className="flex items-center gap-2 text-orange-400 mb-3 font-bold text-xs">
                  <Info size={14} /> ANALÍTICA IA RECOMENDADA
                </div>
                <button 
                  onClick={copyAIPrompt}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all uppercase tracking-widest"
                >
                  <Copy size={12} /> Copiar Análisis Estratégico
                </button>
              </div>
            </>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-10 text-center opacity-20 border-dashed">
              <Basketball size={40} className="mb-4" />
              <p className="text-xs uppercase tracking-widest">Esperando Datos de Mercado</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NbaModule;
