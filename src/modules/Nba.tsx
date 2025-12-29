import React, { useState, useEffect } from 'react';
import { 
  Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Activity, BarChart3, Clock, Hash, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  // --- ESTADOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}));
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '', odds: '' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '', odds: '' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA DE TIEMPO ---
  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const fetchNbaMatches = async () => {
    setLoading(true);
    try {
      // USAMOS EL MERCADO H2H (Moneyline) PORQUE ES EL QUE SIEMPRE TIENE LA PROGRAMACIÓN COMPLETA
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { 
          apiKey: CONFIG.ODDS_API_KEY, 
          regions: 'us', 
          markets: 'h2h', 
          dateFormat: 'iso' 
        }
      });
      setMatches(resp.data);
    } catch (e) {
      console.error("Error API NBA:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNbaMatches();
  }, []);

  // FILTRO RESILIENTE: Comparamos solo la parte de la fecha convertida a Colombia
  const filteredMatches = matches.filter((m: any) => {
    const matchDateInColombia = new Date(m.commence_time).toLocaleDateString('en-CA', {
      timeZone: 'America/Bogota'
    });
    return matchDateInColombia === selectedDate;
  });

  // --- ANÁLISIS ---
  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido.");
    setIsAnalyzing(true);
    try {
      if (ratingH && ratingA) {
        const respH = await axios.post(CONFIG.API_BACKEND, { h_rating: ratingH, a_rating: ratingA, sport: 'nba' });
        const resH = handicaps.filter(h => h.line).map(h => {
          const lineVal = parseFloat(h.line);
          const edge = h.team === 'home' ? (respH.data.expected_value + lineVal) : (lineVal - respH.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: respH.data.expected_value };
        });
        setResultsH(resH);
      }
      if (projTotal) {
        const resOU = ouLines.filter(l => l.value).map(l => {
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
# 🏀 AUDITORÍA NBA: CAPITAL SHIELD v3.1
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**FECHA (COL):** ${selectedDate}

## 📊 ANÁLISIS CUANTITATIVO
- **Margen Proyectado:** ${resultsH[0]?.expected || 'N/A'} pts a favor de ${selectedMatch.home_team}.
- **Total Proyectado:** ${projTotal || 'N/A'} puntos.

- **Matriz de Inversión:**
${resultsH.map(r => `  * SPREAD: ${r.team.toUpperCase()} [${r.line}] @ ${r.odds} -> EDGE: ${r.edge} pts`).join('\n')}
${resultsOU.map(r => `  * TOTALES: ${r.type.toUpperCase()} [${r.value}] @ ${r.odds} -> EDGE: ${r.edge} pts`).join('\n')}

## 🧠 INVESTIGACIÓN IA
1. **LESIONES:** ¿Hay estrellas confirmadas como OUT o GTD?
2. **FATIGA:** ¿Juegan hoy su segundo partido en 48 horas?
3. **NOTAS:** "${analystNotes}"

**VERDICTO:** ¿Confirmas la inversión? Justifica.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt NBA Copiado!");
  };

  return (
    <div className="animate-reveal space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">NBA <span className="text-orange-500 not-italic font-light">Radar</span></h2>
        <button onClick={fetchNbaMatches} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-orange-500">
           <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: JORNADA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-[2rem] p-6 border-white/5">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Calendar size={14} /> 1. Programación
            </h3>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2 mb-6">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent p-3 text-sm text-white scheme-dark outline-none font-bold text-center"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <p className="text-center py-20 text-[10px] animate-pulse uppercase tracking-widest">Cargando Calendario Global...</p>
              ) : filteredMatches.length > 0 ? (
                filteredMatches.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMatch(m)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-500 border ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40 shadow-xl scale-[1.02]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <div className="font-black text-[11px] text-white uppercase tracking-tight mb-1">{m.home_team} @ {m.away_team}</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold">
                      <Clock size={10} /> {getColombiaTime(m.commence_time)} (COL)
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-20 opacity-20">
                  <AlertCircle className="mx-auto mb-2" size={32} />
                  <p className="text-[10px] font-bold uppercase">No hay juegos para esta fecha</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: CORE */}
        <div className="lg:col-span-4">
          <div className="glass-titanium rounded-[2rem] p-6 border-t-orange-500/50 border-t-2">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Target size={14} /> 2. Core de Inteligencia
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold text-center block">Home RTG</span>
                <input type="number" placeholder="0.0" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center text-white outline-none focus:border-orange-500" onChange={e => setRatingH(e.target.value)} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold text-center block">Away RTG</span>
                <input type="number" placeholder="0.0" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center text-white outline-none focus:border-orange-500" onChange={e => setRatingA(e.target.value)} />
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50"><Hash size={14} /></div>
              <input type="number" placeholder="Dunkel Total Prediction" className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-2xl text-xs text-white outline-none focus:border-orange-500" onChange={e => setProjTotal(e.target.value)} />
            </div>

            <textarea 
              placeholder="Notas: Lesiones, Back-to-Back, Pace..." 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none h-16 resize-none mb-6"
              onChange={e => setAnalystNotes(e.target.value)}
            />

            <div className="space-y-4">
               <div className="border-t border-white/5 pt-4">
                 <div className="flex justify-between items-center mb-3 px-2">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Spreads & Totales</span>
                   <div className="flex gap-2">
                     <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="p-2 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all"><Plus size={14}/></button>
                     <button onClick={() => setOuLines([...ouLines, { type: 'over', value: '', odds: '' }])} className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><BarChart3 size={14}/></button>
                   </div>
                 </div>

                 <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {handicaps.map((h, i) => (
                      <div key={`h-${i}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-reveal">
                        <select onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="bg-transparent text-[10px] text-orange-500 font-bold mb-2 outline-none uppercase">
                          <option value="home">Spread LOCAL</option>
                          <option value="away">Spread VISITANTE</option>
                        </select>
                        <div className="flex gap-2">
                          <input placeholder="Línea" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white text-center font-bold" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                          <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white text-center font-bold" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                          <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900 px-2"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                    {ouLines.map((l, i) => (
                      <div key={`ou-${i}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-reveal">
                        <select onChange={(e) => { const n = [...ouLines]; n[i].type = e.target.value; setOuLines(n); }} className="bg-transparent text-[10px] text-blue-500 font-bold mb-2 outline-none uppercase">
                          <option value="over">OVER (Altas)</option>
                          <option value="under">UNDER (Bajas)</option>
                        </select>
                        <div className="flex gap-2">
                          <input placeholder="Línea" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white text-center font-bold" onChange={(e) => { const n = [...ouLines]; n[i].value = e.target.value; setOuLines(n); }} />
                          <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white text-center font-bold" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
                          <button onClick={() => setOuLines(ouLines.filter((_, idx) => idx !== i))} className="text-red-900 px-2"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>

               <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-xl hover:bg-orange-500 transition-all active:scale-95">
                 {isAnalyzing ? <RefreshCw className="animate-spin mx-auto" /> : 'Procesar NBA Intelligence'}
               </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS */}
        <div className="lg:col-span-4 space-y-6">
          {(resultsH.length > 0 || resultsOU.length > 0) ? (
            <div className="animate-reveal space-y-6">
               <div className="glass-titanium rounded-[2rem] p-8 border-l-4 border-orange-500">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10">Auditoría NBA Final</h3>
                  <div className="space-y-8">
                    {resultsH.map((r, i) => (
                      <div key={`rh-${i}`} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0">
                        <div>
                          <div className={`text-[11px] font-black uppercase ${r.edge > 1.5 ? 'text-orange-500' : 'text-gray-500'}`}>
                            SPREAD: {r.team} [{r.line}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Cuota: {r.odds}</div>
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
                          <div className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-5xl font-black italic tracking-tighter ${Math.abs(r.edge) > 3 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                      </div>
                    ))}
                  </div>
               </div>
               <button onClick={copyNbaSuperPrompt} className="w-full glass-titanium border-blue-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all group active:scale-95 shadow-2xl">
                 <ClipboardCheck size={32} className="text-blue-400 group-hover:scale-110 transition-all" />
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
