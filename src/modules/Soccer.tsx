import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, BarChart3, Info } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
}

const SoccerModule = () => {
  // Estados de carga y datos
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(CONFIG.LEAGUES.SOCCER[0].id);
  
  // Estados del Formulario
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [eloHome, setEloHome] = useState('');
  const [eloAway, setEloAway] = useState('');
  const [marketLine, setMarketLine] = useState('');
  
  // Estado de Resultado
  const [analysis, setAnalysis] = useState<any>(null);

  // 1. Cargar partidos desde The Odds API
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${selectedLeague}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h' }
      });
      setMatches(resp.data.slice(0, 15)); // Tomamos los próximos 15
    } catch (error) {
      console.error("Error cargando cuotas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, [selectedLeague]);

  // 2. Ejecutar Análisis en el Backend (Python)
  const runAnalysis = async () => {
    if (!eloHome || !eloAway || !marketLine) return;
    
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'soccer',
        h_rating: eloHome,
        a_rating: eloAway,
        line: marketLine
      });
      setAnalysis(resp.data);
    } catch (error) {
      alert("Error en el cálculo");
    }
  };

  // 3. Generador de Prompt para ChatGPT/Gemini
  const copyAIPrompt = () => {
    const prompt = `Actúa como un Experto en Inteligencia Deportiva.
PROYECTO: Capital Shield Analysis.
EVENTO: ${selectedMatch?.home_team} vs ${selectedMatch?.away_team}
DATA MATEMÁTICA: 
- Mi Modelo ELO proyecta un margen de: ${analysis?.expected_margin} goles.
- La línea del mercado actual es: ${marketLine}.
- Ventaja detectada (Edge): ${analysis?.edge}.

TAREA: Investiga factores cualitativos que el ELO no ve:
1. ¿Hay bajas de último minuto (lesiones/sanciones)?
2. ¿Cómo afecta el clima o el estado del campo hoy?
3. ¿Existe algún factor motivacional (derbi, descenso)?
Dame una conclusión de si estos factores CONFIRMAN o CONTRADICEN mi ventaja matemática.`;
    
    navigator.clipboard.writeText(prompt);
    alert("Prompt copiado. Pégalo en ChatGPT.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header del Módulo */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-emerald-500 flex items-center gap-2">
            <Trophy size={28} /> SOCCER ENGINE
          </h2>
          <p className="text-gray-500 text-sm">Análisis basado en ELO Rating y Spread de Goles</p>
        </div>
        <select 
          className="input-field w-48 border-emerald-500/30 text-emerald-500"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
        >
          {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Selección de Partido (API) */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Próximos Juegos</span>
            <button onClick={fetchMatches} className="text-emerald-500 hover:rotate-180 transition-all">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center text-xs py-10 animate-pulse">Cargando mercados...</p> : 
              matches.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all ${selectedMatch?.id === m.id ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="font-bold">{m.home_team}</div>
                  <div className="text-gray-500">vs {m.away_team}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* Columna 2: Inputs Manuales (Cerebro) */}
        <div className="glass-card p-5 space-y-5 border-t-2 border-t-emerald-500">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inputs del Analista</span>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase ml-1">ELO {selectedMatch?.home_team || 'Local'}</label>
              <input type="number" className="input-field mt-1" placeholder="Ej: 1850" value={eloHome} onChange={e => setEloHome(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase ml-1">ELO {selectedMatch?.away_team || 'Visita'}</label>
              <input type="number" className="input-field mt-1" placeholder="Ej: 1720" value={eloAway} onChange={e => setEloAway(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-emerald-500/70 uppercase ml-1">Línea de Hándicap Mercado</label>
              <input type="number" step="0.25" className="input-field mt-1 border-emerald-500/20" placeholder="Ej: -0.75" value={marketLine} onChange={e => setMarketLine(e.target.value)} />
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            disabled={!eloHome || !eloAway || !marketLine}
            className="btn-primary w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Zap size={18} fill="currentColor" /> ANALIZAR VALOR
          </button>
        </div>

        {/* Columna 3: Dashboard de Resultados */}
        <div className="space-y-6">
          {analysis ? (
            <>
              <div className="glass-card p-6 border-l-4 border-l-emerald-500 relative overflow-hidden">
                <BarChart3 className="absolute right-[-10px] bottom-[-10px] text-white/5" size={100} />
                <h3 className="text-gray-400 text-xs uppercase font-bold">Ventaja Matemática</h3>
                <div className="text-5xl font-black mt-2 text-white">
                  {analysis.edge > 0 ? `+${analysis.edge}` : analysis.edge}
                </div>
                <p className="text-xs mt-2 text-emerald-400 font-mono">Proyección: {analysis.expected_margin} goles</p>
              </div>

              <div className="glass-card p-5 bg-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-tighter">AI Structural Prompt</span>
                </div>
                <p className="text-[10px] text-gray-400 italic leading-relaxed mb-4">
                  Genera una consulta técnica para tu IA externa basada en los datos financieros calculados.
                </p>
                <button 
                  onClick={copyAIPrompt}
                  className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded flex items-center justify-center gap-2 text-xs font-bold transition-all"
                >
                  <Copy size={14} /> COPIAR ESTRATEGIA
                </button>
              </div>
            </>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-10 text-center opacity-30">
              <BarChart3 size={48} className="mb-4" />
              <p className="text-sm">Introduce los datos para calcular la ventaja competitiva</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
