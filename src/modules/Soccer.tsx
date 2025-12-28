import React, { useState } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Calendar, Search } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [handicaps, setHandicaps] = useState<string[]>(['-0.5']);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async (leagueId: string) => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h' }
      });
      setMatches(resp.data);
    } catch (e) { alert("Error al conectar con Odds API."); } 
    finally { setLoading(false); }
  };

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) {
      alert("Introduce ELO Local, Visita y selecciona un partido.");
      return;
    }
    const analysisResults = await Promise.all(handicaps.map(async (line) => {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'soccer', h_rating: eloH, a_rating: eloA, line: line
      });
      return { line, ...resp.data };
    }));
    setResults(analysisResults);
  };

  const copyDetailedPrompt = () => {
    const prompt = `
### REPORTE TÉCNICO DE INTELIGENCIA DEPORTIVA - CAPITAL SHIELD ###
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**COMPETICIÓN:** Análisis de Mercado de Hándicap

**1. DATA MATEMÁTICA (MODELO ELO):**
- Rating Local: ${eloH} | Rating Visita: ${eloA}
- Margen Proyectado: ${results[0]?.expected_margin} goles de ventaja.
- Ventaja (Edge) Calculada por Línea:
${results.map(r => `  * Línea [${r.line}]: Ventaja de ${r.edge}`).join('\n')}

**2. TAREA DE INVESTIGACIÓN CUALITATIVA (IA):**
Actúa como un experto en análisis de datos y scouting deportivo. Tu misión es validar este valor matemático buscando información en tiempo real:

- **H2H (Cara a Cara):** Analiza los últimos 5 encuentros. ¿El estilo de juego de uno anula al otro independientemente del ELO?
- **Reporte de Bajas (Squad Report):** Busca noticias de lesiones o sanciones de última hora (últimas 12 horas). ¿Faltan jugadores clave en la columna vertebral?
- **Factor Campo y Clima:** ¿Cómo afecta la localía hoy? Verifica pronóstico de lluvia pesada o viento que pueda bajar el promedio de goles.
- **Motivación y Calendario:** Si es una COPA (Copa del Rey, Carabao, etc.), ¿hay indicios de rotación de titulares? ¿Alguno de los equipos tiene un partido de liga más importante en 3 días?
- **Análisis de Plantillas:** Compara la profundidad de banca de ambos equipos.

**3. CONCLUSIÓN ESTRATÉGICA:**
Basado en que mi modelo detecta un EDGE de ${results.find(r => Math.abs(r.edge) === Math.max(...results.map(x => Math.abs(x.edge))))?.edge} en la línea ${results.find(r => Math.abs(r.edge) === Math.max(...results.map(x => Math.abs(x.edge))))?.line}, ¿consideras que es una apuesta de valor o los factores cualitativos destruyen la ventaja? Justifica detalladamente.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Maestro Copiado!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: SELECCIÓN */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-2 mb-6 text-emerald-500">
            <Search size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Mercado y Eventos</h3>
          </div>
          <select 
            onChange={(e) => fetchMatches(e.target.value)}
            className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-xs mb-6 outline-none focus:border-emerald-500/50 transition-all text-white"
          >
            <option value="">-- Seleccionar Competición --</option>
            {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <div className="text-center py-20 animate-pulse text-[10px] text-emerald-500 uppercase tracking-widest">Conectando con servidores...</div> : 
              matches.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="font-black text-[11px] text-white uppercase">{m.home_team}</div>
                  <div className="text-[10px] text-gray-500 mt-1 italic">vs {m.away_team}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* COLUMNA 2: DATA ENTRY */}
        <div className="glass-card p-6 border-t-4 border-emerald-600 bg-gradient-to-b from-emerald-600/5 to-transparent">
          <div className="flex items-center gap-2 mb-6 text-emerald-500">
            <Zap size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Cálculo Proyectado</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-gray-500 uppercase ml-1 mb-1 block">Rating ELO Local</label>
              <input type="number" placeholder="Ej: 1850" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 uppercase ml-1 mb-1 block">Rating ELO Visitante</label>
              <input type="number" placeholder="Ej: 1720" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Hándicaps de Mercado</span>
                <button onClick={() => setHandicaps([...handicaps, ''])} className="bg-emerald-500/20 text-emerald-500 p-1 rounded-md hover:bg-emerald-500 hover:text-white transition-all"><Plus size={14}/></button>
              </div>
              {handicaps.map((h, i) => (
                <div key={i} className="flex gap-2 mb-2 animate-in slide-in-from-right-2">
                  <input 
                    value={h} 
                    onChange={(e) => { const n = [...handicaps]; n[i] = e.target.value; setHandicaps(n); }}
                    placeholder="Línea (ej: -0.75)" 
                    className="flex-1 bg-black/60 border border-white/10 p-3 rounded-lg text-xs font-mono" 
                  />
                  <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>

            <button 
              onClick={runFullAnalysis}
              className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-6 hover:bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
            >
              <Zap size={18} fill="currentColor" /> Procesar Valor Matemático
            </button>
          </div>
        </div>

        {/* COLUMNA 3: INTELLIGENCE */}
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="glass-card p-6 border-l-4 border-emerald-500">
                <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Ventaja Real Detectada</h3>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-xs font-mono text-gray-400">LINE {r.line}</span>
                      <span className={`text-2xl font-black ${r.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{r.edge}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 bg-blue-600/5 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <Copy size={16} />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Analítica Externa (IA)</h3>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-6 italic">Genera el reporte estructural para que tu IA investigue lesiones, rotaciones de copa y clima.</p>
                <button 
                  onClick={copyDetailedPrompt}
                  className="w-full bg-blue-600/20 border border-blue-500/40 p-4 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600/40 transition-all shadow-lg"
                >
                  Copiar Prompt Estructural
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-30">
              <Calendar size={48} className="mb-4 text-gray-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Configuración Pendiente:<br/>Elija Evento e Introduzca ELO</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
