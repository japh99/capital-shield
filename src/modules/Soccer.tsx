import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Clock, Globe2, BarChart3, Hash, BrainCircuit, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  // --- ESTADOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}));
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '2.5', odds: '' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA DE APOYO (SEGURA) ---
  
  const parseLine = (input: string): number => {
    if (!input) return 0;
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean) || 0;
  };

  const getColombiaTime = (utcDate: string) => {
    try {
      return new Date(utcDate).toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch (e) { return "N/A"; }
  };

  const extractOdds = (match: any) => {
    if (!match?.bookmakers?.[0]?.markets?.[0]) return "Sin cuotas disponibles";
    try {
      return match.bookmakers[0].markets[0].outcomes
        .map((o: any) => `${o.name}: ${o.price}`)
        .join(' | ');
    } catch (e) { return "Error al leer cuotas"; }
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
      if (resp.data) {
        const filtered = resp.data.filter((m: any) => 
          new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}) === selectedDate
        );
        setMatches(filtered);
      }
    } catch (e) {
      console.error("Error API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, [selectedLeague, selectedDate]);

  const runFullAnalysis = async () => {
    if (!selectedMatch || !eloH || !eloA) return alert("Selecciona partido e ingresa ELOs.");
    setIsAnalyzing(true);
    try {
      const respH = await axios.post('/api', { task: 'math', sport: 'soccer', h_rating: eloH, a_rating: eloA, line: 0 });
      const expH = respH.data.expected_value;
      
      setResultsH(handicaps.filter(h => h.line).map(h => ({ 
        ...h, 
        edge: h.team === 'home' ? (expH + parseLine(h.line)) : (parseLine(h.line) - expH), 
        expected: expH 
      })));
      
      if (projTotal) {
        setResultsOU(ouLines.filter(l => l.value).map(l => ({ 
          ...l, 
          edge: l.type === 'over' ? (parseFloat(projTotal) - parseFloat(l.value)) : (parseFloat(l.value) - parseFloat(projTotal)) 
        })));
      }
    } catch (e) { alert("Error en el cálculo."); }
    finally { setIsAnalyzing(false); }
  };

  const copyPrompt = () => {
    if (!selectedMatch) return;
    const prompt = `
# 🛡️ AUDITORÍA CAPITAL SHIELD: ${selectedMatch.home_team} vs ${selectedMatch.away_team}
CUOTAS API: ${extractOdds(selectedMatch)}
MATEMÁTICA: Margen ${resultsH[0]?.expected || 'N/A'} goles.
HÁNDICAPS: ${resultsH.map(r => `[${r.team} ${r.line} Edge ${r.edge}]`).join(', ')}
TOTALES: ${resultsOU.map(r => `[${r.type} ${r.value} Edge ${r.edge}]`).join(', ')}
NOTAS: ${analystNotes}
MISIÓN IA: Investiga lesiones, H2H y clima. ¿Cuál es la mejor línea para invertir?`;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Maestro Copiado!");
  };

  return (
    <div className="animate-reveal space-y-8 pb-20 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO */}
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-white/5">
          <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-6 flex items-center gap-2"><Search size={14} /> 1. Mercado</h3>
          
          <div className="space-y-3 mb-6">
            <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none">
                <option value="">Seleccionar Liga...</option>
                {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id} className="bg-black">{l.name}</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white scheme-dark" />
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center py-10 text-[10px] animate-pulse">Sincronizando...</p> : 
              matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl border transition-all ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xl' : 'bg-white/5 border-transparent'}`}>
                  <div className="font-black text-[10px] uppercase mb-1">{m.home_team} vs {m.away_team}</div>
                  <div className="text-[9px] text-gray-500"><Clock size={10} className="inline mr-1"/>{getColombiaTime(m.commence_time)}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA */}
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-t-emerald-500 border-t-2">
          <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest text-center mb-6">2. Análisis Profundo</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input type="number" placeholder="Home ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloH(e.target.value)} />
            <input type="number" placeholder="Away ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloA(e.target.value)} />
          </div>
          <input type="number" placeholder="Proyección Goles (Dunkel)" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white mb-4" onChange={e => setProjTotal(e.target.value)} />
          <textarea placeholder="Notas (lesiones, clima...)" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-white h-16 mb-4 resize-none" onChange={e => setAnalystNotes(e.target.value)} />
          
          <div className="space-y-4 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center"><span className="text-[9px] uppercase font-bold text-gray-500">Añadir Líneas</span>
              <div className="flex gap-2">
                <button onClick={() => setHandicaps([...handicaps, {team:'home', line:'', odds:''}])} className="p-1 bg-emerald-500/10 text-emerald-500 rounded"><Plus size={14}/></button>
                <button onClick={() => setOuLines([...ouLines, {type:'over', value:'', odds:''}])} className="p-1 bg-blue-500/10 text-blue-500 rounded"><Plus size={14}/></button>
              </div>
            </div>
            {handicaps.map((h, i) => (
              <div key={`h-${i}`} className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                <select onChange={e => {const n=[...handicaps]; n[i].team=e.target.value; setHandicaps(n);}} className="bg-transparent text-[9px] font-bold text-emerald-500 outline-none w-16">
                  <option value="home">LOC</option><option value="away">VIS</option>
                </select>
                <input placeholder="Hnd" className="flex-1 bg-black/40 p-1 rounded text-[10px] text-white" onChange={e => {const n=[...handicaps]; n[i].line=e.target.value; setHandicaps(n);}} />
                <input placeholder="Odds" className="w-12 bg-black/40 p-1 rounded text-[10px] text-white" onChange={e => {const n=[...handicaps]; n[i].odds=e.target.value; setHandicaps(n);}} />
                <button onClick={() => setHandicaps(handicaps.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={12}/></button>
              </div>
            ))}
            {ouLines.map((l, i) => (
              <div key={`ou-${i}`} className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                <select onChange={e => {const n=[...ouLines]; n[i].type=e.target.value; setOuLines(n);}} className="bg-transparent text-[9px] font-bold text-blue-500 outline-none w-16">
                  <option value="over">OVR</option><option value="under">UND</option>
                </select>
                <input placeholder="Tot" className="flex-1 bg-black/40 p-1 rounded text-[10px] text-white" onChange={e => {const n=[...ouLines]; n[i].value=e.target.value; setOuLines(n);}} />
                <input placeholder="Odds" className="w-12 bg-black/40 p-1 rounded text-[10px] text-white" onChange={e => {const n=[...ouLines]; n[i].odds=e.target.value; setOuLines(n);}} />
                <button onClick={() => setOuLines(ouLines.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={12}/></button>
              </div>
            ))}
            <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-5 rounded-2xl font-black uppercase text-[11px] mt-4 shadow-xl active:scale-95 transition-all">
              {isAnalyzing ? <RefreshCw className="animate-spin mx-auto"/> : 'Procesar Matemática'}
            </button>
          </div>
        </div>

        {/* PANEL 3: REPORTE */}
        <div className="lg:col-span-4 space-y-6">
          {resultsH.length > 0 || resultsOU.length > 0 ? (
            <div className="animate-reveal space-y-6">
              <div className="glass-titanium p-8 rounded-[2.5rem] border-l-4 border-emerald-500">
                <h3 className="text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest text-center">Veredicto Matemático</h3>
                <div className="space-y-6">
                  {resultsH.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div><div className={`text-[10px] font-black uppercase ${r.edge > 0.3 ? 'text-emerald-500' : 'text-gray-500'}`}>H: {r.team} [{r.line}]</div><div className="text-[9px] text-gray-400 mt-1 uppercase">Cuota: {r.odds}</div></div>
                      <div className={`text-4xl font-black italic tracking-tighter ${r.edge > 0.3 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                  {resultsOU.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div><div className={`text-[10px] font-black uppercase ${r.edge > 0.5 ? 'text-blue-500' : 'text-gray-500'}`}>OU: {r.type} [{r.value}]</div><div className="text-[9px] text-gray-400 mt-1 uppercase">Cuota: {r.odds}</div></div>
                      <div className={`text-4xl font-black italic tracking-tighter ${r.edge > 0.5 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={copyPrompt} className="w-full glass-titanium border-blue-500/40 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all group active:scale-95 shadow-2xl">
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><ClipboardCheck size={32} /></div>
                 <span className="text-white text-lg font-bold">Generar Veredicto Maestro</span>
              </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed min-h-[450px]">
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
