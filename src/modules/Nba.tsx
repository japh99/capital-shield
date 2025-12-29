import React, { useState, useEffect } from 'react';
import { 
  Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Activity, BarChart3, Clock, Hash
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  // --- ESTADOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [projTotal, setProjTotal] = useState(''); // Proyección de puntos totales (Dunkel)
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-4.5', odds: '1.90' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '228.5', odds: '1.90' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA ---
  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const fetchNbaMatches = async (dateStr: string) => {
    setLoading(true);
    setMatches([]);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'spreads,totals', dateFormat: 'iso' }
      });
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
    } catch (e) { alert("Error de API NBA. Revisa tus credenciales."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(selectedDate); }, [selectedDate]);

  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido de la jornada.");
    setIsAnalyzing(true);
    try {
      // 1. Análisis de Spreads (Handicap)
      if (ratingH && ratingA) {
        const respH = await axios.post(CONFIG.API_BACKEND, { 
          h_rating: ratingH, a_rating: ratingA, sport: 'nba' 
        });
        const resH = handicaps.map(h => {
          const lineVal = parseFloat(h.line);
          const edge = h.team === 'home' ? (respH.data.expected_value + lineVal) : (lineVal - respH.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: respH.data.expected_value };
        });
        setResultsH(resH);
      }

      // 2. Análisis de Over/Under
      if (projTotal) {
        const resOU = ouLines.map(l => {
          const val = parseFloat(l.value);
          const edge = l.type === 'over' ? (parseFloat(projTotal) - val) : (val - parseFloat(projTotal));
          return { ...l, edge: Math.round(edge * 100) / 100 };
        });
        setResultsOU(resOU);
      }
    } catch (e) { alert("Error en el cálculo matemático."); }
    finally { setIsAnalyzing(false); }
  };

  const copyNbaSuperPrompt = () => {
    const prompt = `
# 🏀 AUDITORÍA ESTRATÉGICA NBA: CAPITAL SHIELD v3.1
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**COMPETICIÓN:** NBA Regular Season / Playoffs

## 📊 FASE 1: ANÁLISIS CUANTITATIVO (POWER RATINGS)
- **Spread Proyectado (Fair Line):** ${resultsH[0]?.expected || 'N/A'} puntos a favor de ${selectedMatch.home_team}.
- **Total Proyectado (Fair Value):** ${projTotal || 'N/A'} puntos.

- **Matriz de Inversión Detectada:**
${resultsH.map(r => `  * SPREAD: ${r.team === 'home' ? selectedMatch.home_team : selectedMatch.away_team} [${r.line}] @ ${r.odds} -> EDGE: ${r.edge} pts`).join('\n')}
${resultsOU.map(r => `  * TOTALES: ${r.type.toUpperCase()} [${r.value}] @ ${r.odds} -> EDGE: ${r.edge} pts`).join('\n')}

## 🧠 FASE 2: INVESTIGACIÓN IA (REAL-TIME)
Actúa como un experto en handicapping de la NBA y analista de fatiga. Investiga:
1. **LOAD MANAGEMENT / LESIONES:** ¿Hay estrellas confirmadas como OUT o GTD? (Revisa lineups iniciales de los últimos 15 min).
2. **FACTOR CANSANCIO (B2B):** ¿Es el segundo partido en noches consecutivas para alguno? ¿Están al final de un viaje por otra conferencia?
3. **PACE Y MATCHUP:** ¿El ritmo de juego (posesiones por partido) favorece el OVER o el UNDER hoy?
4. **NOTAS DEL ANALISTA:** "${analystNotes}"

**VERDICTO:** Basado en el EDGE matemático, ¿cuál es la línea con menor riesgo y mayor probabilidad de éxito hoy? Justifica.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Maestro NBA Copiado!");
  };

  return (
    <div className="animate-reveal space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">NBA <span className="text-orange-500 not-italic font-light">Radar</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO Y FECHA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-[2rem] p-6">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2"><Search size={14} /> 1. Jornada y Fecha</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-12 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 ring-orange-500/20 transition-all">
                <div className="col-span-2 flex justify-center text-gray-500 border-r border-white/10 py-4">
                   <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="col-span-10 bg-transparent p-4 text-xs text-white scheme-dark outline-none w-full font-bold"
                />
              </div>
            </div>

            <div className="mt-8 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-white">
              {loading ? <p className="text-center py-20 text-[10px] animate-pulse">Sincronizando NBA...</p> : 
                matches.map(m => (
                  <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                    <div className="font-black text-[10px] uppercase tracking-tight mb-1">{m.home_team} @ {m.away_team}</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase"><Clock size={10} /> {getColombiaTime(m.commence_time)} (COL)</div>
                  </button>
                ))
              }
            </div>
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA NBA */}
        <div className="lg:col-span-4">
          <div className="glass-titanium rounded-[2rem] p-6 border-t-orange-500/50 border-t-2">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2"><Target size={14} /> 2. Core de Análisis</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold text-center block">Home Rating</span>
                <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-orange-500" onChange={e => setRatingH(e.target.value)} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold text-center block">Away Rating</span>
                <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-orange-500" onChange={e => setRatingA(e.target.value)} />
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50"><Hash size={14} /></div>
              <input type="number" placeholder="Proyección Puntos Totales (Dunkel)" className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-2xl text-xs text-white outline-none focus:border-orange-500" onChange={e => setProjTotal(e.target.value)} />
            </div>

            <textarea placeholder="Notas pro (B2B, Lesiones estrellas, Pace...)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[11px] mb-6 border border-white/5 h-16 text-white outline-none" onChange={e => setAnalystNotes(e.target.value)} />
            
            <div className="space-y-6">
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Matriz Spreads</span>
                  <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="p-1 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 transition-all"><Plus size={14}/></button>
                </div>
                {handicaps.map((h, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 mb-2 flex flex-col gap-2">
                    <select value={h.team} onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="bg-transparent text-[10px] text-orange-500 font-bold uppercase outline-none">
                      <option value="home">Spread LOCAL</option>
                      <option value="away">Spread VISITANTE</option>
                    </select>
                    <div className="flex gap-2">
                      <input placeholder="Línea (-5.5)" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white font-mono" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                      <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white font-mono" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Matriz Over/Under</span>
                  <button onClick={() => setOuLines([...ouLines, { type: 'over', value: '', odds: '' }])} className="p-1 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 transition-all"><Plus size={14}/></button>
                </div>
                {ouLines.map((l, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 mb-2 flex flex-col gap-2">
                    <select value={l.type} onChange={(e) => { const n = [...ouLines]; n[i].type = e.target.value; setOuLines(n); }} className="bg-transparent text-[10px] text-orange-500 font-bold uppercase outline-none">
                      <option value="over">OVER (Altas)</option>
                      <option value="under">UNDER (Bajas)</option>
                    </select>
                    <div className="flex gap-2">
                      <input placeholder="Línea 225.5" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white font-mono" onChange={(e) => { const n = [...ouLines]; n[i].value = e.target.value; setOuLines(n); }} />
                      <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white font-mono" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-xl hover:bg-orange-500 transition-all active:scale-95">
                {isAnalyzing ? <RefreshCw className="animate-spin mx-auto" /> : 'Procesar NBA Core'}
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS NBA */}
        <div className="lg:col-span-4 space-y-6">
          {(resultsH.length > 0 || resultsOU.length > 0) ? (
            <div className="animate-reveal space-y-6">
               <div className="glass-titanium rounded-[2rem] p-8 border-l-4 border-orange-500 relative overflow-hidden">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">Auditoría NBA Final</h3>
                  
                  <div className="space-y-6">
                    {/* Spreads */}
                    {resultsH.map((r, i) => (
                      <div key={`h-${i}`} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                        <div>
                          <div className={`text-[10px] font-black uppercase ${r.edge > 1.5 ? 'text-orange-500' : 'text-gray-500'}`}>
                            SPREAD: {r.team} [{r.line}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-widest uppercase mt-1">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 1.5 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                      </div>
                    ))}
                    {/* Totales */}
                    {resultsOU.map((r, i) => (
                      <div key={`ou-${i}`} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                        <div>
                          <div className={`text-[10px] font-black uppercase ${Math.abs(r.edge) > 3 ? 'text-orange-400' : 'text-gray-500'}`}>
                            TOTAL: {r.type} [{r.value}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-widest uppercase mt-1">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-3xl font-black italic tracking-tighter ${Math.abs(r.edge) > 3 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                      </div>
                    ))}
                  </div>
               </div>

               <button onClick={copyNbaSuperPrompt} className="w-full glass-titanium border-blue-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all group active:scale-95 shadow-2xl">
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><ClipboardCheck size={32} /></div>
                 <span className="text-white text-lg font-bold">Copiar Reporte Estratégico</span>
               </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed min-h-[450px]">
               <Activity size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-gray-500 text-white">Ingrese parámetros NBA<br/>para auditoría táctica</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NbaModule;
