import React, { useState, useEffect } from 'react';
import { 
  Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, 
  MessageSquare, ClipboardCheck, Calendar, Clock, Activity, BarChart3 
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  // --- ESTADOS DE DATOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}));
  
  // --- ESTADOS DE ANÁLISIS ---
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // --- MATRICES DE LÍNEAS ---
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-4.5', odds: '1.90' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '228.5', odds: '1.90' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- UTILIDADES ---
  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const parseLine = (input: string): number => {
    return parseFloat(input.toString().replace(/\s+/g, '').replace('+', ''));
  };

  // --- ACCIONES API ---
  const fetchNbaMatches = async () => {
    setLoading(true);
    setMatches([]);
    try {
      // Cargamos 'h2h' (Moneyline) para ver toda la programación disponible
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'h2h', dateFormat: 'iso' }
      });
      // Filtro exacto por fecha en Colombia
      const filtered = resp.data.filter((m: any) => {
        const mDate = new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'});
        return mDate === selectedDate;
      });
      setMatches(filtered);
    } catch (e) { alert("Error al conectar con la API de NBA."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(); }, [selectedDate]);

  const runNbaAnalysis = async () => {
    if (!selectedMatch) return alert("Seleccione un partido.");
    setIsAnalyzing(true);
    try {
      if (ratingH && ratingA) {
        const respH = await axios.post(CONFIG.API_BACKEND, { task: 'math', sport: 'nba', h_rating: ratingH, a_rating: ratingA, line: 0 });
        const expH = respH.data.expected_value;
        setResultsH(handicaps.filter(h => h.line).map(h => ({ ...h, edge: h.team === 'home' ? (expH + parseFloat(h.line)) : (parseFloat(h.line) - expH), expected: expH })));
      }
      if (projTotal) {
        setResultsOU(ouLines.filter(l => l.value).map(l => ({ ...l, edge: l.type === 'over' ? (parseFloat(projTotal) - parseFloat(l.value)) : (parseFloat(l.value) - parseFloat(projTotal)) })));
      }
    } catch (e) { alert("Error matemático."); }
    finally { setIsAnalyzing(false); }
  };

  // --- GENERADORES DE PROMPTS ---

  const copyRadarPrompt = () => {
    const list = matches.map(m => `- ${m.home_team} @ ${m.away_team} (${getColombiaTime(m.commence_time)})`).join('\n');
    const prompt = `Actúa como Senior NBA Quant. Analiza esta jornada y selecciona los 3 eventos con más valor basándote en la paridad de equipos o rachas ofensivas:\n\n${list}\n\nResponde con ranking 1-3 y justificación táctica.`;
    navigator.clipboard.writeText(prompt);
    alert("Lista de NBA para Radar copiada.");
  };

  const copyMasterPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA NBA CAPITAL SHIELD: ${selectedMatch.home_team} @ ${selectedMatch.away_team}
MATEMÁTICA: Margen ${resultsH[0]?.expected} pts. Proyectado Dunkel: ${projTotal} pts.
SPREADS: ${resultsH.map(r => `[${r.team.toUpperCase()} ${r.line} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}
TOTALES: ${resultsOU.map(r => `[${r.type.toUpperCase()} ${r.value} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}
NOTAS: ${analystNotes || 'Sin observaciones'}

MISIÓN PARA IA: Investiga "Load Management" (estrellas fuera), si alguno es Back-to-Back y el Ritmo (Pace). 
¿Cuál es la mejor línea para invertir hoy? Compara Spread vs Over/Under. Da un veredicto.`;
    navigator.clipboard.writeText(prompt);
    alert("Veredicto NBA Maestro copiado.");
  };

  return (
    <div className="animate-reveal space-y-8 pb-20 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO */}
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest italic">1. Jornada NBA</h3>
            <button onClick={copyRadarPrompt} className="px-3 py-1.5 bg-orange-600 rounded-xl text-[9px] font-bold uppercase flex items-center gap-2 shadow-lg"><Copy size={12}/> Radar IA</button>
          </div>
          
          <div className="grid grid-cols-12 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="col-span-2 flex justify-center text-gray-500 border-r border-white/10 py-4"><Calendar size={18} /></div>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="col-span-10 bg-transparent p-4 text-xs scheme-dark outline-none font-bold text-center" />
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center py-20 text-[10px] animate-pulse">Sincronizando NBA...</p> : 
              matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                  <div className="font-black text-[10px] uppercase mb-1">{m.home_team} @ {m.away_team}</div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{getColombiaTime(m.commence_time)} (COL)</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA */}
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-t-orange-500 border-t-2">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest text-center mb-6 flex items-center justify-center gap-2"><Activity size={14}/> 2. Power Ratings</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input type="number" placeholder="Home Rating" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white text-center outline-none focus:border-orange-500" onChange={e => setRatingH(e.target.value)} />
            <input type="number" placeholder="Away Rating" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white text-center outline-none focus:border-orange-500" onChange={e => setRatingA(e.target.value)} />
          </div>

          <input type="number" placeholder="Total Score Proyectado" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white text-center outline-none focus:border-orange-500 mb-4" onChange={e => setProjTotal(e.target.value)} />
          <textarea placeholder="Notas (lesiones, fatiga, pace...)" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white h-16 mb-6 resize-none" onChange={e => setAnalystNotes(e.target.value)} />
          
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center mb-2 px-2">
               <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest italic">Spread / Totales</span>
               <div className="flex gap-2">
                 <button onClick={() => setHandicaps([...handicaps, {team:'home', line:'', odds:''}])} className="p-1 bg-orange-500/10 text-orange-500 rounded hover:bg-orange-500 transition-all"><Plus size={14}/></button>
                 <button onClick={() => setOuLines([...ouLines, {type:'over', value:'', odds:''}])} className="p-1 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500 transition-all"><Plus size={14}/></button>
               </div>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {handicaps.map((h, i) => (
                <div key={`h-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2">
                  <select onChange={e => {const n=[...handicaps]; n[i].team=e.target.value; setHandicaps(n);}} className="bg-transparent text-[9px] font-bold text-orange-500 outline-none w-16">
                    <option value="home">LOC</option><option value="away">VIS</option>
                  </select>
                  <input placeholder="Sprd" className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...handicaps]; n[i].line=e.target.value; setHandicaps(n);}} />
                  <input placeholder="Odds" className="w-14 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...handicaps]; n[i].odds=e.target.value; setHandicaps(n);}} />
                </div>
              ))}
              {ouLines.map((l, i) => (
                <div key={`ou-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2">
                  <select onChange={e => {const n=[...ouLines]; n[i].type=e.target.value; setOuLines(n);}} className="bg-transparent text-[9px] font-bold text-blue-500 outline-none w-16">
                    <option value="over">OVR</option><option value="under">UND</option>
                  </select>
                  <input placeholder="Tot" className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...ouLines]; n[i].value=e.target.value; setOuLines(n);}} />
                  <input placeholder="Odds" className="w-14 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...ouLines]; n[i].odds=e.target.value; setOuLines(n);}} />
                </div>
              ))}
            </div>

            <button onClick={runNbaAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-orange-500 transition-all active:scale-95">
              {isAnalyzing ? <RefreshCw className="animate-spin mx-auto"/> : 'Analizar NBA Core'}
            </button>
          </div>
        </div>

        {/* PANEL 3: REPORTE */}
        <div className="lg:col-span-4 space-y-6">
          {resultsH.length > 0 || resultsOU.length > 0 ? (
            <div className="animate-reveal space-y-6">
              <div className="glass-titanium p-8 rounded-[2rem] border-l-4 border-orange-500 relative overflow-hidden">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 text-center">Veredicto Matemático</h3>
                <div className="space-y-6">
                  {resultsH.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div><div className={`text-[10px] font-black uppercase ${r.edge > 1.5 ? 'text-orange-500' : 'text-gray-500'}`}>S: {r.team} [{r.line}]</div><div className="text-[9px] text-gray-600 mt-1">Cuota: {r.odds}</div></div>
                      <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 1.5 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                    </div>
                  ))}
                  {resultsOU.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div><div className={`text-[10px] font-black uppercase ${Math.abs(r.edge) > 3 ? 'text-blue-400' : 'text-gray-500'}`}>OU: {r.type} [{r.value}]</div><div className="text-[9px] text-gray-600 mt-1">Cuota: {r.odds}</div></div>
                      <div className={`text-3xl font-black italic tracking-tighter ${Math.abs(r.edge) > 3 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={copyMasterPrompt} className="w-full glass-titanium border-blue-500/40 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all active:scale-95 shadow-2xl">
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><ClipboardCheck size={32} /></div>
                 <span className="text-white text-lg font-bold">Copiar Auditoría IA</span>
              </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed min-h-[450px]">
               <Dribbble size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-white text-center">Filtre por fecha y elija un juego<br/>para auditar NBA</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NbaModule;
