import React, { useState, useEffect } from 'react';
import { 
  Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Activity, BarChart3, Clock, Hash, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-4.5', odds: '1.90' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '228.5', odds: '1.90' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- MEJORA: Conversión y Filtro de Fecha ---
  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const fetchNbaMatches = async () => {
    setLoading(true);
    setMatches([]);
    try {
      // Pedimos 'h2h' (Ganador) porque siempre está disponible incluso días antes
      // Esto garantiza que los partidos de mañana y pasado aparezcan en la lista
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { 
          apiKey: CONFIG.ODDS_API_KEY, 
          regions: 'us', 
          markets: 'h2h', // Mercado base para ver la programación
          dateFormat: 'iso' 
        }
      });

      setMatches(resp.data);
    } catch (e) {
      alert("Error de conexión con la API de NBA.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar todos los partidos una sola vez al entrar
  useEffect(() => {
    fetchNbaMatches();
  }, []);

  // Filtrar los partidos localmente según la fecha seleccionada en el calendario
  const filteredMatches = matches.filter((m: any) => {
    const matchDateUTC = new Date(m.commence_time);
    const matchDateInColombia = matchDateUTC.toLocaleDateString('en-CA', {
      timeZone: 'America/Bogota'
    }); 
    return matchDateInColombia === selectedDate;
  });

  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido.");
    setIsAnalyzing(true);
    try {
      if (ratingH && ratingA) {
        const respH = await axios.post(CONFIG.API_BACKEND, { h_rating: ratingH, a_rating: ratingA, sport: 'nba' });
        const resH = handicaps.map(h => {
          const lineVal = parseFloat(h.line);
          const edge = h.team === 'home' ? (respH.data.expected_value + lineVal) : (lineVal - respH.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: respH.data.expected_value };
        });
        setResultsH(resH);
      }
      if (projTotal) {
        const resOU = ouLines.map(l => {
          const val = parseFloat(l.value);
          const edge = l.type === 'over' ? (parseFloat(projTotal) - val) : (val - parseFloat(projTotal));
          return { ...l, edge: Math.round(edge * 100) / 100 };
        });
        setResultsOU(resOU);
      }
    } catch (e) { alert("Error matemático."); }
    finally { setIsAnalyzing(false); }
  };

  const copyNbaSuperPrompt = () => {
    const prompt = `
# 🏀 AUDITORÍA ESTRATÉGICA NBA: CAPITAL SHIELD v3.1
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**FECHA (COL):** ${selectedDate}

## 📊 FASE 1: ANÁLISIS CUANTITATIVO
- **Spread Proyectado:** ${resultsH[0]?.expected || 'N/A'} pts a favor de ${selectedMatch.home_team}.
- **Total Proyectado:** ${projTotal || 'N/A'} puntos.

- **Matriz de Inversión:**
${resultsH.map(r => `  * SPREAD: ${r.team === 'home' ? selectedMatch.home_team : selectedMatch.away_team} [${r.line}] @ ${r.odds} -> EDGE: ${r.edge} pts`).join('\n')}
${resultsOU.map(r => `  * TOTALES: ${r.type.toUpperCase()} [${r.value}] @ ${r.odds} -> EDGE: ${r.edge} pts`).join('\n')}

## 🧠 FASE 2: INVESTIGACIÓN IA
Actúa como experto en NBA. Investiga:
1. **LESIONES Y DESCANSO:** ¿Juegan las estrellas o hay "Load Management"?
2. **BACK-TO-BACK:** ¿Alguno jugó anoche?
3. **PACE:** ¿El estilo de hoy favorece el OVER o el UNDER?
4. **NOTAS:** "${analystNotes}"

**VERDICTO:** Basado en el EDGE, ¿confirmas la inversión? Justifica.
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
        
        {/* PANEL 1: JORNADA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-[2rem] p-6 border-white/5">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Calendar size={14} /> 1. Programación (Colombia Time)
            </h3>
            
            <div className="grid grid-cols-12 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 ring-orange-500/20 transition-all mb-6">
              <div className="col-span-2 flex justify-center text-gray-500 border-r border-white/10 py-4">
                 <Search size={18} />
              </div>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="col-span-10 bg-transparent p-4 text-xs text-white scheme-dark outline-none w-full font-bold"
              />
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              <button onClick={fetchNbaMatches} className="w-full mb-4 py-2 border border-dashed border-orange-500/30 rounded-xl text-[9px] font-bold uppercase text-orange-500 hover:bg-orange-500/10 transition-all">
                Sincronizar Calendario Global
              </button>

              {loading ? (
                <div className="flex flex-col items-center py-20 gap-4 opacity-50 text-orange-500">
                  <RefreshCw className="animate-spin" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Buscando en la nube...</span>
                </div>
              ) : filteredMatches.length > 0 ? (
                filteredMatches.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMatch(m)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-500 border ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <div className="font-black text-[11px] text-white uppercase tracking-tight mb-1">{m.home_team} @ {m.away_team}</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                      <Clock size={10} /> {getColombiaTime(m.commence_time)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-20 opacity-30">
                  <AlertCircle className="mx-auto mb-2" size={32} />
                  <p className="text-[10px] font-bold uppercase leading-relaxed">No hay juegos scheduleados<br/>o líneas disponibles para esta fecha</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: CORE */}
        <div className="lg:col-span-4">
          <div className="glass-titanium rounded-[2rem] p-6 border-t-orange-500/50 border-t-2">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Target size={14} /> 2. Inteligencia NBA
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold text-center block">Home RTG</span>
                <input type="number" placeholder="110.5" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center text-white outline-none focus:border-orange-500 transition-colors" onChange={e => setRatingH(e.target.value)} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold text-center block">Away RTG</span>
                <input type="number" placeholder="108.2" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center text-white outline-none focus:border-orange-500 transition-colors" onChange={e => setRatingA(e.target.value)} />
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50"><Hash size={14} /></div>
              <input type="number" placeholder="Total Dunkel Prediction" className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-2xl text-xs text-white outline-none focus:border-orange-500" onChange={e => setProjTotal(e.target.value)} />
            </div>

            <textarea 
              placeholder="Notas: Lesiones, Back-to-Back, Pace..." 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-orange-500/50 h-16 resize-none mb-6"
              onChange={e => setAnalystNotes(e.target.value)}
            />

            <div className="space-y-6">
               <div className="border-t border-white/5 pt-4">
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Spreads & Totales</span>
                   <div className="flex gap-2">
                     <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="p-1 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 transition-all"><Plus size={14}/></button>
                   </div>
                 </div>

                 {handicaps.map((h, i) => (
                    <div key={`h-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 mb-2 flex flex-col gap-2">
                      <select onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="bg-transparent text-[10px] text-orange-500 font-bold mb-1 outline-none uppercase">
                        <option value="home">Spread LOCAL</option>
                        <option value="away">Spread VISITANTE</option>
                      </select>
                      <div className="flex gap-2">
                        <input placeholder="Línea (-5.5)" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                        <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                      </div>
                    </div>
                  ))}

                  <button onClick={() => setOuLines([...ouLines, { type: 'over', value: '', odds: '' }])} className="w-full py-2 mb-3 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded-lg uppercase tracking-widest">+ Añadir Over/Under</button>

                  {ouLines.map((l, i) => (
                    <div key={`ou-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 mb-2 flex flex-col gap-2">
                      <select onChange={(e) => { const n = [...ouLines]; n[i].type = e.target.value; setOuLines(n); }} className="bg-transparent text-[10px] text-blue-500 font-bold mb-1 outline-none uppercase">
                        <option value="over">OVER (Altas)</option>
                        <option value="under">UNDER (Bajas)</option>
                      </select>
                      <div className="flex gap-2">
                        <input placeholder="Línea 225.5" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center" onChange={(e) => { const n = [...ouLines]; n[i].value = e.target.value; setOuLines(n); }} />
                        <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
                      </div>
                    </div>
                  ))}
               </div>

               <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-xl hover:bg-orange-500 transition-all active:scale-95">
                 {isAnalyzing ? <RefreshCw className="animate-spin mx-auto" /> : 'Procesar NBA Analytics'}
               </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS */}
        <div className="lg:col-span-4 space-y-6">
          {(resultsH.length > 0 || resultsOU.length > 0) ? (
            <div className="animate-reveal space-y-6">
               <div className="glass-titanium rounded-[2rem] p-8 border-l-4 border-orange-500 relative overflow-hidden">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10">Veredicto Matemático</h3>
                  <div className="space-y-8">
                    {resultsH.map((r, i) => (
                      <div key={`rh-${i}`} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0">
                        <div>
                          <div className={`text-[11px] font-black uppercase ${r.edge > 1.5 ? 'text-orange-500' : 'text-gray-500'}`}>
                            SPREAD: {r.team} [{r.line}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono mt-1 uppercase">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-5xl font-black italic tracking-tighter ${r.edge > 1.5 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                      </div>
                    ))}
                    {resultsOU.map((r, i) => (
                      <div key={`rou-${i}`} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0">
                        <div>
                          <div className={`text-[11px] font-black uppercase ${Math.abs(r.edge) > 3 ? 'text-orange-400' : 'text-gray-500'}`}>
                            TOTAL: {r.type} [{r.value}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono mt-1 uppercase">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-5xl font-black italic tracking-tighter ${Math.abs(r.edge) > 3 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                      </div>
                    ))}
                  </div>
               </div>

               <button onClick={copyNbaSuperPrompt} className="w-full glass-titanium border-blue-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all group active:scale-95 shadow-2xl">
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><ClipboardCheck size={32} /></div>
                 <span className="text-white text-lg font-bold">Generar Reporte IA</span>
               </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed min-h-[450px]">
               <Dribbble size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-white text-center">Filtre por fecha y elija un partido<br/>para auditar</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NbaModule;
