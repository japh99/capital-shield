import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, MessageSquare, ClipboardCheck, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '2.00' }]);
  const [results, setResults] = useState<any[]>([]);

  const parseHandicap = (input: string): number => {
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean);
  };

  const fetchMatches = async (leagueId: string, dateStr: string) => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      setMatches(resp.data.filter((m: any) => m.commence_time.startsWith(dateStr)));
    } catch (e) { alert("Error de API. Revisa tus llaves."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague, selectedDate); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos.");
    setIsAnalyzing(true);
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, { h_rating: eloH, a_rating: eloA });
      const expectedMargin = resp.data.expected_margin;

      const analysisResults = handicaps.map((h) => {
        const lineVal = parseHandicap(h.line);
        // EDGE = (Margen Proyectado + Handicap). 
        // Si el resultado es positivo, hay valor en esa línea.
        const edge = h.team === 'home' 
          ? (expectedMargin + lineVal) 
          : (lineVal - expectedMargin);
        
        return { ...h, edge: round(edge, 2), expected_margin: expectedMargin };
      });

      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo."); }
    finally { setIsAnalyzing(false); }
  };

  const round = (num: number, decimales: number) => {
    return Math.round(num * Math.pow(10, decimales)) / Math.pow(10, decimales);
  };

  const copySuperPrompt = () => {
    const bestLine = results.reduce((prev, current) => (prev.edge > current.edge) ? prev : current);
    
    const prompt = `
# 🛡️ AUDITORÍA DE INVERSIÓN: CAPITAL SHIELD v3.0
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**LIGA:** ${CONFIG.LEAGUES.SOCCER.find(l => l.id === selectedLeague)?.name}

## 📊 FASE 1: ANÁLISIS CUANTITATIVO (MODELO ELO)
- **Margen de Goles Proyectado (Fair Value):** ${results[0]?.expected_margin} a favor de ${selectedMatch.home_team}.
- **Matriz de Ventaja (EDGE) Comparada:**
${results.map(r => `  * APUESTA: ${r.team === 'home' ? selectedMatch.home_team : selectedMatch.away_team} [${r.line}] | CUOTA: ${r.odds} -> EDGE: ${r.edge}`).join('\n')}

## 🧠 FASE 2: AUDITORÍA CUALITATIVA (TU TAREA)
Como experto en Big Data Deportivo e Insider de mercados, investiga:

1. **H2H Y TIROS (Matchup):** Revisa los últimos 5 partidos. ¿Cuántos tiros a puerta (SoT) promedian? ¿El estilo del ${selectedMatch.away_team} complica al bloque defensivo del ${selectedMatch.home_team}?
2. **PERSONAL Y BAJAS:** Busca noticias de las últimas 12 horas. ¿Hay bajas en el "Eje Central" (Portero, Defensa Central o Mediocentro)?
3. **LOGÍSTICA:** ¿Algún equipo viene de jugar más de 90 min en copa o tuvo un viaje largo?
4. **NOTAS DEL ANALISTA:** "${analystNotes || 'Sin observaciones'}"

## ⚖️ VERDICTO FINAL Y RECOMENDACIÓN:
Basado en que la línea con mayor valor matemático es **${bestLine.team.toUpperCase()} [${bestLine.line}]** con un EDGE de **${bestLine.edge}**:
- ¿Consideras que esta es la mejor opción de inversión hoy?
- ¿Existe otra línea en la matriz con mejor relación Riesgo/Beneficio según las noticias?
- Da un veredicto final: **INVERTIR** o **NO INVERTIR (TRAP)** y justifica por qué.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡SÚPER PROMPT MAESTRO ACTUALIZADO!");
  };

  // Solo las partes clave del cambio visual para no repetir todo el código previo
// Mantener toda la lógica previa de ELO y Prompts que ya funciona.

return (
    <div className="space-y-6">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Soccer <span className="text-emerald-500 not-italic">Terminal</span></h2>
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
             <Globe2 size={12} />
             <span>Data Stream: The Odds API + ClubElo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL DE SELECCIÓN - OCUPA 4/12 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-3xl p-6">
             <label className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-4 block">1. Fuente de Datos</label>
             <select 
               value={selectedLeague}
               onChange={(e) => setSelectedLeague(e.target.value)}
               className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm mb-4 outline-none focus:ring-2 ring-emerald-500/20 transition-all cursor-pointer"
             >
               <option value="">Seleccionar Competición...</option>
               {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id} className="bg-neutral-900">{l.name}</option>)}
             </select>
             
             <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-sm text-white scheme-dark outline-none focus:ring-2 ring-emerald-500/20"
                />
             </div>

             <div className="mt-6 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <RefreshCw className="animate-spin text-emerald-500" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sincronizando mercados...</span>
                  </div>
                ) : matches.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMatch(m)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <div className="font-black text-xs text-white uppercase mb-1">{m.home_team} vs {m.away_team}</div>
                    <div className="text-[9px] text-gray-500 font-mono tracking-tighter">ID: {m.id.substring(0,8)}</div>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* PANEL DE ANÁLISIS - OCUPA 4/12 */}
        <div className="lg:col-span-4">
           <div className="glass-titanium rounded-3xl p-6 border-t-emerald-500/50 border-t-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500">
                <Target size={80} />
              </div>
              
              <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Cpu size={14} /> 2. Configuración Core
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="space-y-1">
                   <span className="text-[9px] text-gray-500 ml-2 uppercase font-bold">Home ELO</span>
                   <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center outline-none focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] text-gray-500 ml-2 uppercase font-bold">Away ELO</span>
                   <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center outline-none focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
                 </div>
              </div>

              <textarea 
                placeholder="Observaciones de campo (Lesiones, clima, tactica...)" 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-emerald-500/50 min-h-[80px] mb-6 resize-none"
                onChange={e => setAnalystNotes(e.target.value)}
              />

              <div className="space-y-3 mb-6">
                {handicaps.map((h, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 relative group animate-reveal">
                    <div className="flex justify-between items-center">
                      <select 
                        className="bg-transparent text-[10px] font-black text-emerald-500 uppercase outline-none"
                        onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }}
                      >
                        <option value="home">Hándicap Local</option>
                        <option value="away">Hándicap Visita</option>
                      </select>
                      <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-500/50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input placeholder="Línea" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-center" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                      <input placeholder="Cuota" className="w-20 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-center" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-white hover:border-white/20 transition-all mb-4">
                 + Añadir Línea Alternativa
              </button>

              <button 
                onClick={runFullAnalysis} 
                disabled={isAnalyzing} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 p-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                {isAnalyzing ? 'Calculando Core' : 'Analizar Inversión'}
              </button>
           </div>
        </div>

        {/* PANEL DE RESULTADOS - OCUPA 4/12 */}
        <div className="lg:col-span-4 space-y-6">
           {results.length > 0 ? (
             <div className="animate-reveal space-y-6">
                <div className="glass-titanium rounded-3xl p-8 border-l-4 border-emerald-500">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">Matriz de Valoración Final</h3>
                  <div className="space-y-6">
                    {results.map((r, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0 group">
                        <div className="space-y-1">
                          <div className={`text-[10px] font-black uppercase ${r.edge > 0.5 ? 'text-emerald-500' : 'text-gray-500'}`}>
                            {r.team} [{r.line}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Cuota Mercado: {r.odds}</div>
                        </div>
                        <div className={`text-4xl font-black italic tracking-tighter ${r.edge > 0.5 ? 'text-white' : 'text-gray-700'}`}>
                          {r.edge > 0 ? `+${r.edge}` : r.edge}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={copySuperPrompt} 
                  className="w-full glass-titanium border-blue-500/30 p-8 rounded-3xl flex flex-col items-center gap-4 hover:border-blue-500/50 transition-all group shadow-2xl"
                >
                  <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <ClipboardCheck size={32} />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-1">Capa de Inteligencia</span>
                    <span className="text-white text-lg font-bold">Copiar Reporte Estratégico</span>
                  </div>
                </button>
             </div>
           ) : (
             <div className="glass-titanium rounded-3xl p-12 flex flex-col items-center justify-center text-center opacity-30 border-dashed min-h-[400px]">
                <BarChart3 size={64} className="mb-6 text-gray-600" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] leading-loose text-gray-500">
                  Esperando entrada de datos<br/>para auditoría táctica
                </p>
             </div>
           )}
        </div>

      </div>
    </div>
);
