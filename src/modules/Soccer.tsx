import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, RefreshCw, Plus, Trash2, Search, Target, 
  MessageSquare, ClipboardCheck, Calendar, Clock, Globe2, Copy 
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  // --- ESTADOS DE DATOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}));
  
  // --- ESTADOS DE ANÁLISIS ---
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // --- MATRICES DE LÍNEAS ---
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '2.00' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '2.5', odds: '1.90' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- UTILIDADES ---
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

  // --- ACCIONES API ---
  const fetchMatches = async () => {
    if (!selectedLeague) return;
    setLoading(true);
    setMatches([]);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${selectedLeague}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      const filtered = resp.data.filter((m: any) => {
        const mDate = new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'});
        return mDate === selectedDate;
      });
      setMatches(filtered);
    } catch (e) { alert("Error al conectar con la API de cuotas."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Seleccione un partido.");
    setIsAnalyzing(true);
    try {
      if (eloH && eloA) {
        const resH = await Promise.all(handicaps.filter(h => h.line).map(async (h) => {
          const lVal = parseLine(h.line);
          const resp = await axios.post(CONFIG.API_BACKEND, { task: 'math', sport: 'soccer', h_rating: eloH, a_rating: eloA, line: lVal });
          const edge = h.team === 'home' ? resp.data.edge : (lVal - resp.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: resp.data.expected_value };
        }));
        setResultsH(resH);
      }
      if (projTotal) {
        const resOU = await Promise.all(ouLines.filter(l => l.value).map(async (l) => {
          const lVal = parseFloat(l.value);
          const resp = await axios.post(CONFIG.API_BACKEND, { task: 'math', sport: 'ou', h_rating: projTotal, line: lVal });
          const edge = l.type === 'over' ? resp.data.edge : (lVal - parseFloat(projTotal));
          return { ...l, edge: Math.round(edge * 100) / 100 };
        }));
        setResultsOU(resOU);
      }
    } catch (e) { alert("Error en el cálculo matemático."); }
    finally { setIsAnalyzing(false); }
  };

  // --- GENERADORES DE PROMPTS ---

  const copyRadarPrompt = () => {
    const list = matches.map(m => {
        let odds = "N/A";
        if (m.bookmakers?.[0]) {
            odds = m.bookmakers[0].markets[0].outcomes.map((o:any) => `${o.name}: ${o.price}`).join(' | ');
        }
        return `- ${m.home_team} vs ${m.away_team} (Cuotas: ${odds})`;
    }).join('\n');

    const prompt = `Actúa como Senior Quant Trader. Analiza esta cartelera y selecciona los 3 mejores eventos para invertir:\n\n${list}\n\nResponde con ranking 1-3 y una razón técnica por cada uno.`;
    navigator.clipboard.writeText(prompt);
    alert("Lista de Radar copiada. Pégala en tu IA.");
  };

  const copyMasterPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA CAPITAL SHIELD: ${selectedMatch.home_team} vs ${selectedMatch.away_team}
MATEMÁTICA: Margen Proyectado ${resultsH[0]?.expected} goles.
HÁNDICAPS: ${resultsH.map(r => `[${r.team.toUpperCase()} ${r.line} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}
TOTALES (O/U): ${resultsOU.map(r => `[${r.type.toUpperCase()} ${r.value} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}
NOTAS: ${analystNotes || 'Sin observaciones'}

MISIÓN PARA IA: Investiga lesiones de última hora, H2H, promedio de tiros a puerta y clima. 
Compara el valor de las líneas. ¿Cuál es la mejor opción de inversión hoy? Da un veredicto final.`;
    navigator.clipboard.writeText(prompt);
    alert("Veredicto Maestro copiado. Pégalo en tu IA.");
  };

  return (
    <div className="animate-reveal space-y-8 pb-20 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO */}
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest italic">1. Mercado</h3>
            <button onClick={copyRadarPrompt} className="px-3 py-1.5 bg-emerald-600 rounded-xl text-[9px] font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg">
              <Copy size={12}/> Copiar Radar
            </button>
          </div>
          
          <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs mb-3 outline-none focus:border-emerald-500 transition-all">
             <option value="">Seleccionar Liga...</option>
             {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id} className="bg-black">{l.name}</option>)}
          </select>
          
          <div className="grid grid-cols-12 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="col-span-2 flex justify-center text-gray-500 border-r border-white/10 py-4"><Calendar size={18} /></div>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="col-span-10 bg-transparent p-4 text-xs scheme-dark outline-none font-bold" />
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center py-20 text-[10px] animate-pulse uppercase">Sincronizando...</p> : 
              matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                  <div className="font-black text-[10px] uppercase mb-1">{m.home_team} vs {m.away_team}</div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase"><Clock size={10} className="inline mr-1" /> {getColombiaTime(m.commence_time)}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA */}
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-t-emerald-500 border-t-2">
          <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest text-center mb-6 flex items-center justify-center gap-2"><Target size={14}/> 2. Inteligencia de Datos</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input type="number" placeholder="Home ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white text-center outline-none focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
            <input type="number" placeholder="Away ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white text-center outline-none focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
          </div>

          <div className="relative mb-4">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input type="number" placeholder="Goles Totales Proyectado" className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-xl text-xs text-white outline-none focus:border-emerald-500" onChange={e => setProjTotal(e.target.value)} />
          </div>

          <textarea placeholder="Notas pro (lesiones, clima, tiros...)" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white outline-none h-16 mb-6 resize-none" onChange={e => setAnalystNotes(e.target.value)} />
          
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center mb-2 px-2">
               <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest italic">Hándicap / Totales</span>
               <div className="flex gap-2">
                 <button onClick={() => setHandicaps([...handicaps, {team:'home', line:'', odds:''}])} className="p-1 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500 transition-all"><Plus size={14}/></button>
                 <button onClick={() => setOuLines([...ouLines, {type:'over', value:'', odds:''}])} className="p-1 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500 transition-all"><Plus size={14}/></button>
               </div>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {handicaps.map((h, i) => (
                <div key={`h-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2">
                  <select onChange={e => {const n=[...handicaps]; n[i].team=e.target.value; setHandicaps(n);}} className="bg-transparent text-[9px] font-bold text-emerald-500 outline-none w-16">
                    <option value="home">LOC</option><option value="away">VIS</option>
                  </select>
                  <input placeholder="Hnd" className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...handicaps]; n[i].line=e.target.value; setHandicaps(n);}} />
                  <input placeholder="Odds" className="w-14 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...handicaps]; n[i].odds=e.target.value; setHandicaps(n);}} />
                  <button onClick={() => setHandicaps(handicaps.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={14}/></button>
                </div>
              ))}
              {ouLines.map((l, i) => (
                <div key={`ou-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2">
                  <select onChange={e => {const n=[...ouLines]; n[i].type=e.target.value; setOuLines(n);}} className="bg-transparent text-[9px] font-bold text-blue-500 outline-none w-16">
                    <option value="over">OVR</option><option value="under">UND</option>
                  </select>
                  <input placeholder="Tot" className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...ouLines]; n[i].value=e.target.value; setOuLines(n);}} />
                  <input placeholder="Odds" className="w-14 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white text-center" onChange={e => {const n=[...ouLines]; n[i].odds=e.target.value; setOuLines(n);}} />
                  <button onClick={() => setOuLines(ouLines.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>

            <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-500 transition-all active:scale-95">
              {isAnalyzing ? <RefreshCw className="animate-spin mx-auto"/> : 'Procesar Matemática'}
            </button>
          </div>
        </div>

        {/* PANEL 3: REPORTE */}
        <div className="lg:col-span-4 space-y-6">
          {resultsH.length > 0 || resultsOU.length > 0 ? (
            <div className="animate-reveal space-y-6">
              <div className="glass-titanium p-8 rounded-[2rem] border-l-4 border-emerald-500 relative overflow-hidden">
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-8">Auditoría de Valor</h3>
                <div className="space-y-6">
                  {resultsH.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div><div className={`text-[10px] font-black uppercase ${r.edge > 0.3 ? 'text-emerald-500' : 'text-gray-500'}`}>{r.team} [{r.line}]</div><div className="text-[9px] text-gray-400">Cuota: {r.odds}</div></div>
                      <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 0.3 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                  {resultsOU.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div><div className={`text-[10px] font-black uppercase ${r.edge > 0.5 ? 'text-blue-500' : 'text-gray-500'}`}>{r.type} [{r.value}]</div><div className="text-[9px] text-gray-400">Cuota: {r.odds}</div></div>
                      <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 0.5 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={copyMasterPrompt} className="w-full glass-titanium border-blue-500/40 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all group active:scale-95 shadow-2xl">
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><ClipboardCheck size={32} /></div>
                 <span className="text-white text-lg font-bold">Generar Veredicto Maestro</span>
              </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed min-h-[450px]">
               <Trophy size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-white text-center">Filtre por fecha y elija un partido<br/>para auditar táctica</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
