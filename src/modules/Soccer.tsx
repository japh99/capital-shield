import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [analystNotes, setAnalystNotes] = useState(''); // Campo de notas
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '1.90' }]);
  const [results, setResults] = useState<any[]>([]);

  const fetchMatches = async (leagueId: string, dateStr: string) => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
    } catch (e) { alert("Error de API. Verifica tus llaves en Vercel."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague, selectedDate); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos.");
    setIsAnalyzing(true);
    try {
      const analysisResults = await Promise.all(handicaps.map(async (h) => {
        const adjustedLine = h.team === 'home' ? h.line : (parseFloat(h.line) * -1).toString();
        const resp = await axios.post(CONFIG.API_BACKEND, {
          sport: 'soccer', h_rating: eloH, a_rating: eloA, line: adjustedLine
        });
        return { ...h, ...resp.data };
      }));
      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo matemático."); }
    finally { setIsAnalyzing(false); }
  };

  const copySuperPrompt = () => {
    const prompt = `
# 🛡️ REPORTE TÉCNICO DE INTELIGENCIA DEPORTIVA: CAPITAL SHIELD
**ESTADO:** Análisis de Valor Matemático vs Realidad Cualitativa
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**COMPETICIÓN:** ${CONFIG.LEAGUES.SOCCER.find(l => l.id === selectedLeague)?.name}

## 📊 CAPA 1: AUDITORÍA MATEMÁTICA (ELO ENGINE)
- **Rating Proyectado:** Local [${eloH}] vs Visitante [${eloA}]
- **Margen de Goles Esperado:** ${results[0]?.expected_margin}
- **Matriz de Ventaja (EDGE) por Línea:**
${results.map(r => `  * [${r.team.toUpperCase()}] Línea [${r.line}] @ Cuota [${r.odds}] -> EDGE: ${r.edge}`).join('\n')}

## 🧠 CAPA 2: INTELIGENCIA CUALITATIVA (TU MISIÓN)
Actúa como un Analista Senior de Inversiones Deportivas. Investiga y audita los siguientes 5 pilares para este partido:

1. **INTELIGENCIA DE PERSONAL (Personal Report):**
   - Busca lesiones/sanciones de las últimas 12h. ¿Faltan jugadores del Tier 1 (Portero titular, Central líder o Goleador)?
   - ¿Hay algún regreso importante que el ELO aún no capture?

2. **INTELIGENCIA DE CALENDARIO (Fatigue/Schedule):**
   - ¿Cuántos días de descanso tiene cada uno? ¿Vienen de jugar prórroga en Copa o viajes de más de 4 horas?
   - Si es COPA (Carabao/Copa del Rey): ¿Hay indicios de rotaciones masivas?

3. **INTELIGENCIA TÁCTICA (The Matchup):**
   - H2H: ¿El estilo de juego de uno anula al otro? (Ej: Posesión vs Contraataque).
   - Superficie y Clima: ¿Lluvia pesada o césped artificial que favorezca al "Dog" (inferior)?

4. **INTELIGENCIA DE MOTIVACIÓN (The Hunger):**
   - ¿Se juegan el descenso, título o puestos europeos?
   - ¿Es un Derbi local donde la intensidad emocional equilibra la diferencia técnica?

5. **INTELIGENCIA DE MERCADO (Smart Money):**
   - ¿La cuota ha subido o bajado drásticamente (Steam Moves)? ¿El mercado está contradiciendo nuestra ventaja matemática?

## 📝 NOTAS ADICIONALES DEL ANALISTA:
"${analystNotes || 'Sin observaciones adicionales'}"

## ⚖️ VERDICTO FINAL:
Basado en un EDGE matemático de ${Math.max(...results.map(r => r.edge))}, ¿recomiendas la inversión o es un "TRAP" (Trampa)? Justifica si los factores cualitativos CONFIRMAN o ANULAN el valor detectado.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡SÚPER PROMPT MAESTRO COPIADO! Pégalo en ChatGPT o Gemini.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL 1: MERCADO */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-2 mb-6 text-emerald-500 uppercase text-[10px] font-bold tracking-widest">
            <Search size={16} /> Filtros de Mercado
          </div>
          <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white mb-4 outline-none focus:border-emerald-500 transition-all">
            <option value="">Seleccionar Liga/Copa...</option>
            {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white scheme-dark mb-6" />
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center py-10 animate-pulse text-[10px] uppercase">Sincronizando...</p> : 
              matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                  <div className="font-black text-[10px] text-white uppercase">{m.home_team} vs {m.away_team}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL 2: INPUTS + OBSERVACIONES */}
        <div className="glass-card p-6 border-t-4 border-emerald-600">
          <div className="flex items-center gap-2 mb-6 text-emerald-500 font-bold uppercase text-[10px] tracking-widest">
            <Target size={16} /> Inteligencia de Datos
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="ELO Local" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
              <input type="number" placeholder="ELO Visita" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-3 text-gray-400">
                <MessageSquare size={14} />
                <span className="text-[9px] uppercase font-bold tracking-widest">Observaciones del Analista</span>
              </div>
              <textarea 
                placeholder="Ej: Llueve fuerte, Goleador duda..." 
                className="w-full bg-transparent text-[11px] outline-none text-emerald-400 placeholder:opacity-30 resize-none h-16"
                onChange={(e) => setAnalystNotes(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] text-gray-500 uppercase font-bold italic">Líneas de Hándicap</span>
                <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500"><Plus size={16}/></button>
              </div>
              {handicaps.map((h, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 mb-3">
                  <select onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="w-full bg-transparent text-[10px] text-emerald-500 font-bold uppercase outline-none mb-2">
                    <option value="home">Hándicap Local</option>
                    <option value="away">Hándicap Visitante</option>
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Línea" className="flex-1 bg-black border border-white/10 p-2 rounded text-[11px] text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                    <input placeholder="Cuota" className="w-20 bg-black border border-white/10 p-2 rounded text-[11px] text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                    <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20">
              {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
            </button>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS */}
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="animate-in zoom-in-95 duration-500 space-y-4">
              <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
                <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Matriz de Valoración</h3>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 transition-all hover:border-white/20">
                      <div>
                        <div className={`text-[10px] font-bold uppercase ${r.team === 'home' ? 'text-emerald-500' : 'text-blue-500'}`}>
                          {r.team === 'home' ? 'LOCAL' : 'VISITANTE'} [{r.line}]
                        </div>
                        <div className="text-[9px] text-gray-500 mt-1 uppercase">Cuota: {r.odds}</div>
                      </div>
                      <div className={`text-3xl font-black ${r.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 border-dashed border-blue-500/30 bg-blue-500/5">
                <button onClick={copySuperPrompt} className="w-full bg-blue-600/20 border border-blue-500/40 p-5 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600/40 transition-all shadow-lg flex items-center justify-center gap-2">
                  <Copy size={16} /> COPIAR SÚPER PROMPT
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-30">
              <Trophy size={48} className="mb-4 text-gray-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Configure mercado y datos<br/>para auditoría</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
