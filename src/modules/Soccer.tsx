import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, RefreshCw, Plus, Trash2, Search, Target, 
  MessageSquare, ClipboardCheck, Calendar, Clock, Globe2, Copy, AlertTriangle
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

  // --- LOGICA DE EXTRACCION DE CUOTAS REALES ---
  // Esta funcion busca en los datos de la API las cuotas actuales
  const extractMarketOdds = (match: any) => {
    if (!match || !match.bookmakers?.[0]) return { h2h: 'N/A', spreads: 'N/A', totals: 'N/A' };
    const market = match.bookmakers[0].markets[0];
    return market.outcomes.map((o: any) => `${o.name}: ${o.price}`).join(' | ');
  };

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
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${selectedLeague}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      setMatches(resp.data);
    } catch (e) { console.error("Error API"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(); }, [selectedLeague]);

  const filteredMatches = matches.filter((m: any) => 
    new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}) === selectedDate
  );

  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido.");
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

  // --- PROMPTS MAESTROS ---

  const copyRadarPrompt = () => {
    const list = filteredMatches.map(m => `- ${m.home_team} vs ${m.away_team} (CUOTAS: ${extractMarketOdds(m)})`).join('\n');
    const prompt = `Actúa como Senior Quant Trader. Analiza esta cartelera y selecciona los 3 eventos con más ineficiencia de cuotas:\n\n${list}\n\nResponde con ranking 1-3 y justificación técnica breve.`;
    navigator.clipboard.writeText(prompt);
    alert("Lista con cuotas reales copiada para el Radar.");
  };

  const copyMasterPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA DE INVERSIÓN CAPITAL SHIELD: ${selectedMatch.home_team} vs ${selectedMatch.away_team}
CUOTAS DE APERTURA (API): ${extractMarketOdds(selectedMatch)}

📊 ANÁLISIS MATEMÁTICO:
* Margen Proyectado: ${resultsH[0]?.expected} goles.
* Matriz Hándicaps: ${resultsH.map(r => `[${r.team.toUpperCase()} ${r.line} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}
* Matriz Totales: ${resultsOU.map(r => `[${r.type.toUpperCase()} ${r.value} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}

🧠 MISIÓN IA: Investiga lesiones de última hora, H2H, promedio de tiros a puerta y clima. 
Cruza la información: ¿Por qué la casa de apuestas puso esas cuotas? ¿Hay un error en el precio o las noticias anulan nuestro EDGE matemático? Da un veredicto final sobre qué línea apostar.`;
    navigator.clipboard.writeText(prompt);
    alert("Veredicto Maestro con datos de cuotas copiado.");
  };

  return (
    <div className="animate-reveal space-y-8 pb-20 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO */}
        <div className="lg:col-span-4 glass-titanium rounded-[2.5rem] p-8 border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">1. Mercado Real-Time</h3>
            <button onClick={copyRadarPrompt} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/40">
              <Zap size={12} fill="currentColor"/> Smart Radar
            </button>
          </div>
          
          <div className="space-y-4 mb-8">
            <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-xs outline-none focus:ring-2 ring-emerald-500/20 transition-all appearance-none cursor-pointer">
               <option value="">Seleccionar Liga...</option>
               {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id} className="bg-neutral-900">{l.name}</option>)}
            </select>
            
            <div className="flex items-center bg-white/5 border border-white/10 rounded-[1.5rem] px-4 focus-within:ring-2 ring-emerald-500/20">
              <Calendar size={18} className="text-gray-500" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-transparent p-5 text-xs scheme-dark outline-none font-bold" />
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center py-20 text-[10px] animate-pulse uppercase tracking-widest text-emerald-500">Conectando con servidores...</p> : 
              filteredMatches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-500 ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                  <div className="font-black text-[11px] uppercase mb-2 tracking-tight">{m.home_team} vs {m.away_team}</div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase"><Clock size={10} /> {getColombiaTime(m.commence_time)}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA */}
        <div className="lg:col-span-4 glass-titanium rounded-[2.5rem] p-8 border-t-emerald-500 border-t-4">
          <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] text-center mb-8"><Target size={16} className="inline mr-2"/> 2. Análisis Técnico</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 ml-4 font-black uppercase">Home ELO</span>
              <input type="number" placeholder="1800" className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-sm text-center outline-none focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 ml-4 font-black uppercase">Away ELO</span>
              <input type="number" placeholder="1800" className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-sm text-center outline-none focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
            </div>
          </div>

          <div className="relative mb-6">
            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
            <input type="number" placeholder="Goles Proyectados (Total)" className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-[1.5rem] text-xs outline-none focus:border-emerald-500" onChange={e => setProjTotal(e.target.value)} />
          </div>

          <textarea placeholder="Notas (lesiones, tiros, clima...)" className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-xs h-20 mb-6 resize-none focus:border-emerald-500 outline-none" onChange={e => setAnalystNotes(e.target.value)} />
          
          <div className="space-y-6 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center px-2">
               <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest italic">Líneas de Apuesta</span>
               <div className="flex gap-2">
                 <button onClick={() => setHandicaps([...handicaps, {team:'home', line:'', odds:''}])} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 transition-all"><Trophy size={14}/></button>
                 <button onClick={() => setOuLines([...ouLines, {type:'over', value:'', odds:''}])} className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 transition-all"><BarChart3 size={14}/></button>
               </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {handicaps.map((h, i) => (
                <div key={`h-${i}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-2 animate-reveal">
                  <select value={h.team} onChange={e => {const n=[...handicaps]; n[i].team=e.target.value; setHandicaps(n);}} className="bg-transparent text-[10px] font-black text-emerald-500 outline-none uppercase">
                    <option value="home">Handicap Local</option><option value="away">Handicap Visita</option>
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Línea (0/-0.5)" className="flex-1 bg-black/40 p-3 rounded-xl text-xs font-bold text-center" onChange={e => {const n=[...handicaps]; n[i].line=e.target.value; setHandicaps(n);}} />
                    <input placeholder="Cuota" className="w-20 bg-black/40 p-3 rounded-xl text-xs font-bold text-center" onChange={e => {const n=[...handicaps]; n[i].odds=e.target.value; setHandicaps(n);}} />
                    <button onClick={() => setHandicaps(handicaps.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
              {ouLines.map((l, i) => (
                <div key={`ou-${i}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-2 animate-reveal">
                  <select value={l.type} onChange={e => {const n=[...ouLines]; n[i].type=e.target.value; setOuLines(n);}} className="bg-transparent text-[10px] font-black text-blue-500 outline-none uppercase">
                    <option value="over">OVER (Altas)</option><option value="under">UNDER (Bajas)</option>
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Total (2.5)" className="flex-1 bg-black/40 p-3 rounded-xl text-xs font-bold text-center" onChange={e => {const n=[...ouLines]; n[i].value=e.target.value; setOuLines(n);}} />
                    <input placeholder="Cuota" className="w-20 bg-black/40 p-3 rounded-xl text-xs font-bold text-center" onChange={e => {const n=[...ouLines]; n[i].odds=e.target.value; setOuLines(n);}} />
                    <button onClick={() => setOuLines(ouLines.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 transition-all active:scale-95">
              {isAnalyzing ? <RefreshCw className="animate-spin mx-auto"/> : 'Procesar Inversión'}
            </button>
          </div>
        </div>

        {/* PANEL 3: REPORTE */}
        <div className="lg:col-span-4 space-y-6">
          {resultsH.length > 0 || resultsOU.length > 0 ? (
            <div className="animate-reveal space-y-6">
              <div className="glass-titanium p-8 rounded-[2.5rem] border-l-4 border-emerald-500 relative overflow-hidden shadow-2xl">
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-10 text-center">Matriz de Probabilidades</h3>
                <div className="space-y-8">
                  {resultsH.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0 transition-all hover:bg-white/5 px-2 rounded-lg">
                      <div className="space-y-1">
                        <div className={`text-[11px] font-black uppercase ${r.edge > 0.3 ? 'text-emerald-500' : 'text-gray-500'}`}>H: {r.team} [{r.line}]</div>
                        <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">Paga: {r.odds}</div>
                      </div>
                      <div className={`text-5xl font-black italic tracking-tighter ${r.edge > 0.3 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                  {resultsOU.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0 transition-all hover:bg-white/5 px-2 rounded-lg">
                      <div className="space-y-1">
                        <div className={`text-[11px] font-black uppercase ${r.edge > 0.5 ? 'text-blue-500' : 'text-gray-500'}`}>OU: {r.type} [{r.value}]</div>
                        <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">Paga: {r.odds}</div>
                      </div>
                      <div className={`text-5xl font-black italic tracking-tighter ${r.edge > 0.5 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={copyMasterPrompt} className="w-full glass-titanium border-blue-500/40 p-10 rounded-[2.5rem] flex flex-col items-center gap-5 hover:border-blue-500/80 transition-all group active:scale-95 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                 <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform shadow-inner"><ClipboardCheck size={40} /></div>
                 <span className="text-white text-xl font-black tracking-tight uppercase">Obtener Veredicto Maestro</span>
                 <p className="text-[10px] text-blue-500/70 font-bold uppercase tracking-widest italic">Auditoría 360 integrada</p>
              </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed border-white/10 min-h-[500px]">
               <Trophy size={80} className="mb-8 text-gray-700" />
               <p className="text-xs font-black uppercase tracking-[0.4em] leading-loose text-white">Seleccione evento para<br/>iniciar el radar</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
