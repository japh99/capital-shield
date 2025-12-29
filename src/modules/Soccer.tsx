import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Globe2, BarChart3, Clock, Hash
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  // --- ESTADOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [projTotal, setProjTotal] = useState(''); // Proyección goles totales
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '2.00' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '2.5', odds: '1.90' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA ---
  const parseLine = (input: string): number => {
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean);
  };

  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const fetchMatches = async (leagueId: string, dateStr: string) => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      setMatches(resp.data.filter((m: any) => m.commence_time.startsWith(dateStr)));
    } catch (e) { alert("Error de API."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague, selectedDate); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido.");
    setIsAnalyzing(true);
    try {
      // 1. Análisis Hándicaps
      if (eloH && eloA) {
        const respH = await axios.post(CONFIG.API_BACKEND, { h_rating: eloH, a_rating: eloA, sport: 'soccer' });
        const resH = handicaps.map(h => {
          const lVal = parseLine(h.line);
          const edge = h.team === 'home' ? (respH.data.expected_value + lVal) : (lVal - respH.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: respH.data.expected_value };
        });
        setResultsH(resH);
      }

      // 2. Análisis Over/Under
      if (projTotal) {
        const resOU = ouLines.map(l => {
          const val = parseFloat(l.value);
          const edge = l.type === 'over' ? (parseFloat(projTotal) - val) : (val - parseFloat(projTotal));
          return { ...l, edge: Math.round(edge * 100) / 100 };
        });
        setResultsOU(resOU);
      }
    } catch (e) { alert("Error en el cálculo."); }
    finally { setIsAnalyzing(false); }
  };

  const copySuperPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA DE INVERSIÓN: CAPITAL SHIELD v3.1
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**LIGA:** ${CONFIG.LEAGUES.SOCCER.find(l => l.id === selectedLeague)?.name}

## 📊 FASE 1: ANÁLISIS CUANTITATIVO
- **Hándicap (Fair Value):** ${resultsH[0]?.expected || 'N/A'} a favor de ${selectedMatch.home_team}.
- **Goles Totales (Fair Value):** ${projTotal || 'N/A'} goles.

- **Matriz de Valor Detectada:**
${resultsH.map(r => `  * HÁNDICAP: ${r.team === 'home' ? selectedMatch.home_team : selectedMatch.away_team} [${r.line}] @ ${r.odds} -> EDGE: ${r.edge}`).join('\n')}
${resultsOU.map(r => `  * TOTALES: ${r.type.toUpperCase()} [${r.value}] @ ${r.odds} -> EDGE: ${r.edge}`).join('\n')}

## 🧠 FASE 2: INVESTIGACIÓN IA
Investiga: 
1. **H2H Y TIROS:** Promedio de tiros a puerta y posesión últimos 3 juegos.
2. **PERSONAL:** Bajas de porteros o delanteros de última hora.
3. **NOTAS:** "${analystNotes}"

**VERDICTO:** ¿Cuál es la mejor línea para invertir (Hándicap o Over/Under)? Justifica.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Maestro Copiado!");
  };

  return (
    <div className="animate-reveal space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Soccer <span className="text-emerald-500 not-italic font-light">Terminal</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO Y FECHA CORREGIDO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-[2rem] p-6">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 flex items-center gap-2"><Search size={14} /> 1. Mercado y Fecha</h3>
            
            <div className="space-y-3">
              <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:ring-2 ring-emerald-500/20">
                <option value="">Seleccionar Competición...</option>
                {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id} className="bg-neutral-900">{l.name}</option>)}
              </select>

              <div className="grid grid-cols-12 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 ring-emerald-500/20 transition-all">
                <div className="col-span-2 flex justify-center text-gray-500 border-r border-white/10 py-4">
                   <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="col-span-10 bg-transparent p-4 text-xs text-white scheme-dark outline-none w-full"
                />
              </div>
            </div>

            <div className="mt-8 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-white">
              {loading ? <p className="text-center py-10 text-[10px] animate-pulse">Sincronizando...</p> : 
                matches.map(m => (
                  <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                    <div className="font-black text-xs uppercase tracking-tight mb-1">{m.home_team} vs {m.away_team}</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase"><Clock size={10} /> {getColombiaTime(m.commence_time)} (COL)</div>
                  </button>
                ))
              }
            </div>
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA + OVER/UNDER */}
        <div className="lg:col-span-4">
          <div className="glass-titanium rounded-[2rem] p-6 border-t-emerald-500/50 border-t-2">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 flex items-center gap-2"><Target size={14} /> 2. Core de Análisis</h3>

            {/* RATINGS ELO */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" placeholder="Home ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
              <input type="number" placeholder="Away ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
            </div>

            {/* PROYECCIÓN TOTAL GOLES */}
            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50"><Hash size={14} /></div>
              <input type="number" placeholder="Proyección Goles Totales (Dunkel)" className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-2xl text-xs text-white outline-none focus:border-emerald-500" onChange={e => setProjTotal(e.target.value)} />
            </div>

            <textarea placeholder="Notas (lesiones, clima...)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[11px] mb-6 border border-white/5 h-16 text-white outline-none" onChange={e => setAnalystNotes(e.target.value)} />
            
            <div className="space-y-6">
              {/* SECCIÓN HANDICAPS */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Matriz Hándicap</span>
                  <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Plus size={14}/></button>
                </div>
                {handicaps.map((h, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 mb-2 flex flex-col gap-2">
                    <select onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="bg-transparent text-[10px] text-emerald-500 font-bold uppercase outline-none">
                      <option value="home">Hándicap LOCAL</option>
                      <option value="away">Hándicap VISITANTE</option>
                    </select>
                    <div className="flex gap-2">
                      <input placeholder="Línea" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                      <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* SECCIÓN OVER/UNDER */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Matriz Over/Under</span>
                  <button onClick={() => setOuLines([...ouLines, { type: 'over', value: '', odds: '' }])} className="p-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Plus size={14}/></button>
                </div>
                {ouLines.map((l, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 mb-2 flex flex-col gap-2">
                    <select onChange={(e) => { const n = [...ouLines]; n[i].type = e.target.value; setOuLines(n); }} className="bg-transparent text-[10px] text-blue-500 font-bold uppercase outline-none">
                      <option value="over">OVER (Altas)</option>
                      <option value="under">UNDER (Bajas)</option>
                    </select>
                    <div className="flex gap-2">
                      <input placeholder="Línea 2.5" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white" onChange={(e) => { const n = [...ouLines]; n[i].value = e.target.value; setOuLines(n); }} />
                      <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-xl hover:bg-emerald-500 transition-all active:scale-95">
                {isAnalyzing ? <RefreshCw className="animate-spin mx-auto" /> : 'Procesar Todo'}
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS */}
        <div className="lg:col-span-4 space-y-6">
          {(resultsH.length > 0 || resultsOU.length > 0) ? (
            <div className="animate-reveal space-y-6">
               <div className="glass-titanium rounded-[2rem] p-8 border-l-4 border-emerald-500 relative overflow-hidden">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">Auditoría de Inversión</h3>
                  
                  <div className="space-y-6">
                    {/* Resultados Handicap */}
                    {resultsH.map((r, i) => (
                      <div key={`h-${i}`} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                        <div>
                          <div className={`text-[10px] font-black uppercase ${r.edge > 0.3 ? 'text-emerald-500' : 'text-gray-500'}`}>
                            H: {r.team} [{r.line}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-widest uppercase mt-1">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 0.3 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                      </div>
                    ))}
                    {/* Resultados Over/Under */}
                    {resultsOU.map((r, i) => (
                      <div key={`ou-${i}`} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                        <div>
                          <div className={`text-[10px] font-black uppercase ${r.edge > 0.5 ? 'text-blue-500' : 'text-gray-500'}`}>
                            OU: {r.type} [{r.value}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-widest uppercase mt-1">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 0.5 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                      </div>
                    ))}
                  </div>
               </div>

               <button onClick={copySuperPrompt} className="w-full glass-titanium border-blue-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all group active:scale-95 shadow-2xl">
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><ClipboardCheck size={32} /></div>
                 <span className="text-white text-lg font-bold">Copiar Reporte Maestro</span>
               </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed min-h-[450px]">
               <Trophy size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-gray-500 text-white">Esperando parámetros<br/>para auditoría táctica</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
