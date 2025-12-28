import React, { useState } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado para hándicaps detallados
  const [handicaps, setHandicaps] = useState<any[]>([
    { team: 'home', line: '-0.5', odds: '1.90' }
  ]);
  const [results, setResults] = useState<any[]>([]);

  const fetchMatches = async (leagueId: string) => {
    if (!leagueId) return;
    setLoading(true);
    setMatches([]);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { 
          apiKey: CONFIG.ODDS_API_KEY, 
          regions: 'eu', 
          markets: 'h2h', // Traemos h2h para identificar los equipos reales
          dateFormat: 'iso' 
        }
      });
      setMatches(resp.data);
    } catch (e) {
      alert("Error al conectar con Odds API. Verifica tu API KEY en Vercel y los créditos.");
    } finally {
      setLoading(false);
    }
  };

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) {
      alert("Introduce ELOs y selecciona un partido.");
      return;
    }

    const analysisResults = await Promise.all(handicaps.map(async (h) => {
      // Ajustamos la línea para el backend: si es para el visitante, invertimos el signo para la fórmula
      const adjustedLine = h.team === 'home' ? h.line : (parseFloat(h.line) * -1).toString();
      
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'soccer', 
        h_rating: eloH, 
        a_rating: eloA, 
        line: adjustedLine
      });
      
      return { ...h, ...resp.data };
    }));
    setResults(analysisResults);
  };

  const copyDetailedPrompt = () => {
    const prompt = `
### SOLICITUD DE INTELIGENCIA DEPORTIVA - CAPITAL SHIELD ###
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**LIGA:** Mercado de Fútbol Profesional

**MODELO MATEMÁTICO (DATA PURA):**
- Rating ELO Local: ${eloH} | Rating ELO Visitante: ${eloA}
- Margen de Goles Proyectado: ${results[0]?.expected_margin}
- Análisis de Valor en Hándicaps:
${results.map(r => `  * Para ${r.team === 'home' ? selectedMatch.home_team : selectedMatch.away_team}: Línea [${r.line}] con Cuota [${r.odds}] -> EDGE: ${r.edge}`).join('\n')}

**MISIÓN DE INVESTIGACIÓN (IA):**
Investiga y analiza los siguientes factores cualitativos para confirmar si la ventaja matemática es sólida:
1. **Bajas Críticas:** ¿Hay porteros, defensas centrales o goleadores fuera por lesión o tarjetas en las últimas horas?
2. **Historial H2H:** ¿Existe una "paternidad" táctica de uno sobre el otro?
3. **Contexto de Liga/Copa:** ¿Es un partido de eliminación? ¿Hay rotación por fatiga de partidos previos?
4. **Condiciones de Campo:** Clima extremo (lluvia/nieve) o estado del césped.
5. **Mercado:** ¿La cuota ha subido o bajado drásticamente en las últimas horas (Steam Moves)?

**CONCLUSIÓN:** Basado en el EDGE matemático y tus hallazgos, ¿recomiendas la inversión? Justifica.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Estructural Copiado!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL 1: SELECCIÓN DE PARTIDO */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6 text-emerald-500">
            <Search size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Mercado en Tiempo Real</h3>
          </div>
          <select 
            onChange={(e) => fetchMatches(e.target.value)}
            className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs mb-6 outline-none focus:border-emerald-500"
          >
            <option value="">-- Seleccionar Competición --</option>
            {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <div className="text-center py-20 animate-pulse text-[10px] text-emerald-500 uppercase tracking-widest">Sincronizando...</div> : 
              matches.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="font-black text-[11px] text-white uppercase">{m.home_team}</div>
                  <div className="text-[9px] text-gray-500 mt-1 italic">vs {m.away_team}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL 2: CONFIGURACIÓN DE APUESTA */}
        <div className="glass-card p-6 border-t-4 border-emerald-600">
          <div className="flex items-center gap-2 mb-6 text-emerald-500 font-bold uppercase text-[10px] tracking-widest">
            <Target size={16} /> Configuración de Análisis
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder={`ELO ${selectedMatch?.home_team || 'Home'}`} className="bg-black border border-white/10 p-4 rounded-xl text-xs" onChange={e => setEloH(e.target.value)} />
              <input type="number" placeholder={`ELO ${selectedMatch?.away_team || 'Away'}`} className="bg-black border border-white/10 p-4 rounded-xl text-xs" onChange={e => setEloA(e.target.value)} />
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] text-gray-400 uppercase font-bold">Líneas de Hándicap + Cuotas</span>
                <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500 p-1"><Plus size={16}/></button>
              </div>
              
              {handicaps.map((h, i) => (
                <div key={i} className="space-y-2 p-3 bg-white/5 rounded-xl mb-3 border border-white/5 relative">
                  <select 
                    value={h.team} 
                    onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }}
                    className="w-full bg-black/60 border-none text-[10px] rounded uppercase font-bold text-emerald-500"
                  >
                    <option value="home">Hándicap LOCAL</option>
                    <option value="away">Hándicap VISITANTE</option>
                  </select>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Línea (+/-)" 
                      value={h.line}
                      className="flex-1 bg-black border border-white/10 p-2 rounded text-[11px] font-mono" 
                      onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }}
                    />
                    <input 
                      placeholder="Cuota" 
                      value={h.odds}
                      className="w-20 bg-black border border-white/10 p-2 rounded text-[11px] font-mono" 
                      onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }}
                    />
                    <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900 px-1"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={runFullAnalysis}
              className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <Zap size={18} fill="currentColor" /> Procesar Matriz
            </button>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS E IA */}
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="space-y-4 animate-in zoom-in-95">
              <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
                <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Edge Detectado</h3>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                      <div>
                        <div className={`text-[10px] font-bold ${r.team === 'home' ? 'text-emerald-500' : 'text-blue-500'}`}>
                          {r.team === 'home' ? 'LOCAL' : 'VISITANTE'} [{r.line}]
                        </div>
                        <div className="text-[9px] text-gray-500">Cuota: {r.odds}</div>
                      </div>
                      <div className={`text-2xl font-black ${r.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 border-dashed border-blue-500/30">
                <button 
                  onClick={copyDetailedPrompt}
                  className="w-full bg-blue-600/20 border border-blue-500/40 p-4 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600/40 transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> Copiar Prompt Maestro
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-30">
              <Trophy size={48} className="mb-4 text-gray-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Esperando Parámetros...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
