import React, { useState, useEffect } from 'react';
import { 
  Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Clock, Activity, BarChart3, Hash, Globe2
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
  const [projTotal, setProjTotal] = useState(''); // Proyección Dunkel
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '', odds: '' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '', odds: '' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA DE EXTRACCIÓN DE CUOTAS NBA ---
  const extractNbaOdds = (match: any) => {
    if (!match || !match.bookmakers?.[0]) return "Cuotas no disponibles aún";
    
    const bookie = match.bookmakers[0];
    const spreadMarket = bookie.markets.find((m: any) => m.key === 'spreads');
    const totalMarket = bookie.markets.find((m: any) => m.key === 'totals');

    let info = "";
    if (spreadMarket) {
      info += `Spreads: ${spreadMarket.outcomes.map((o: any) => `${o.name} ${o.point} (${o.price})`).join(' | ')} `;
    }
    if (totalMarket) {
      info += `\nTotales: ${totalMarket.outcomes.map((o: any) => `${o.name} ${o.point} (${o.price})`).join(' | ')}`;
    }
    return info || "Líneas de Vegas pendientes";
  };

  const parseLine = (input: string): number => {
    return parseFloat(input.toString().replace(/\s+/g, '').replace('+', ''));
  };

  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  // --- ACCIONES API ---
  const fetchNbaMatches = async () => {
    setLoading(true);
    setMatches([]);
    try {
      // Pedimos h2h, spreads y totals para tener la visión completa
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'h2h,spreads,totals', dateFormat: 'iso' }
      });
      setMatches(resp.data);
    } catch (e) { alert("Error API NBA"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(); }, [selectedDate]);

  const filteredMatches = matches.filter((m: any) => 
    new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}) === selectedDate
  );

  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido.");
    setIsAnalyzing(true);
    try {
      const respH = await axios.post('/api', { task: 'math', sport: 'nba', h_rating: ratingH, a_rating: ratingA, line: 0 });
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
    } catch (e) { alert("Error matemático."); }
    finally { setIsAnalyzing(false); }
  };

  // --- PROMPTS MAESTROS ---
  const copyRadarPrompt = () => {
    const list = filteredMatches.map(m => `- ${m.home_team} @ ${m.away_team}\n  MARKET: ${extractNbaOdds(m)}`).join('\n\n');
    const prompt = `Actúa como Senior NBA Trader. Analiza la cartelera y las cuotas de Vegas:\n\n${list}\n\nSelecciona los 3 partidos con más valor. Justifica basándote en si las cuotas parecen bajas para el nivel de los equipos.`;
    navigator.clipboard.writeText(prompt);
    alert("Radar de NBA copiado con cuotas reales.");
  };

  const copyMasterPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA NBA CAPITAL SHIELD: ${selectedMatch.home_team} vs ${selectedMatch.away_team}
LÍNEAS DE VEGAS (API): ${extractNbaOdds(selectedMatch)}

📊 ANÁLISIS CUANTITATIVO:
* Margen Proyectado: ${resultsH[0]?.expected} puntos.
* Totales Proyectados: ${projTotal} puntos.
* Matriz Spreads: ${resultsH.map(r => `[${r.team.toUpperCase()} ${r.line} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}
* Matriz Totales: ${resultsOU.map(r => `[${r.type.toUpperCase()} ${r.value} @ ${r.odds} Edge: ${r.edge}]`).join(', ')}

🧠 MISIÓN IA: Investiga Load Management (estrellas que descansan), si es segundo juego de un Back-to-Back y el Pace (ritmo) reciente.
Compara: ¿Por qué Vegas puso esa línea? ¿Nuestra ventaja de ${resultsH[0]?.edge || resultsOU[0]?.edge} es real o hay una lesión que no estamos viendo? Da un veredicto final.`;
    navigator.clipboard.writeText(prompt);
    alert("Veredicto Maestro NBA copiado.");
  };

  return (
    <div className="animate-reveal space-y-8 pb-20 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO */}
        <div className="lg:col-span-4 glass-titanium rounded-[2.5rem] p-8 border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em]">1. NBA Radar</h3>
            <button onClick={copyRadarPrompt} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-orange-900/40">
              <Zap size={12} fill="currentColor"/> Smart Scan
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] px-4 mb-8 focus-within:ring-2 ring-orange-500/20">
             <Calendar size={18} className="text-gray-500" />
             <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-transparent p-5 text-xs scheme-dark outline-none font-bold text-center" />
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <p className="text-center py-20 text-[10px] animate-pulse uppercase text-orange-500">Sincronizando NBA...</p> : 
              filteredMatches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-500 ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.15)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                  <div className="font-black text-[11px] uppercase mb-2 tracking-tight">{m.home_team} @ {m.away_team}</div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase"><Clock size={10} /> {getColombiaTime(m.commence_time)}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL 2: ANALISIS */}
        <div className="lg:col-span-4 glass-titanium rounded-[2.5rem] p-8 border-t-orange-500 border-t-4">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] text-center mb-8"><Activity size={16} className="inline mr-2"/> 2. Core Ratings</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 ml-4 font-black uppercase text-center block">Home RTG</span>
              <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-sm text-center outline-none focus:border-orange-500" onChange={e => setRatingH(e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 ml-4 font-black uppercase text-center block">Away RTG</span>
              <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-sm text-center outline-none focus:border-orange-500" onChange={e => setRatingA(e.target.value)} />
            </div>
          </div>

          <div className="relative mb-6 text-white">
            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" size={14} />
            <input type="number" placeholder="Total Dunkel Prediction" className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-[1.5rem] text-xs outline-none focus:border-orange-500" onChange={e => setProjTotal(e.target.value)} />
          </div>

          <textarea placeholder="Notas (B2B, Lesiones, Pace...)" className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-xs h-20 mb-6 resize-none focus:border-orange-500 outline-none text-white" onChange={e => setAnalystNotes(e.target.value)} />
          
          <div className="space-y-6 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center px-2">
               <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest italic">Spreads & Totales</span>
               <div className="flex gap-2">
                 <button onClick={() => setHandicaps([...handicaps, {team:'home', line:'', odds:''}])} className="p-2 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500 transition-all"><Plus size={14}/></button>
                 <button onClick={() => setOuLines([...ouLines, {type:'over', value:'', odds:''}])} className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 transition-all"><Plus size={14}/></button>
               </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {handicaps.map((h, i) => (
                <div key={`h-${i}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                  <select onChange={e => {const n=[...handicaps]; n[i].team=e.target.value; setHandicaps(n);}} className="bg-transparent text-[10px] font-black text-orange-500 outline-none uppercase">
                    <option value="home">Spread Local</option><option value="away">Spread Visita</option>
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Línea (-5.5)" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-center text-white" onChange={e => {const n=[...handicaps]; n[i].line=e.target.value; setHandicaps(n);}} />
                    <input placeholder="Cuota" className="w-16 bg-black/40 p-3 rounded-xl text-xs font-bold text-center text-white" onChange={e => {const n=[...handicaps]; n[i].odds=e.target.value; setHandicaps(n);}} />
                    <button onClick={() => setHandicaps(handicaps.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
              {ouLines.map((l, i) => (
                <div key={`ou-${i}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                  <select onChange={e => {const n=[...ouLines]; n[i].type=e.target.value; setOuLines(n);}} className="bg-transparent text-[10px] font-black text-blue-500 outline-none uppercase">
                    <option value="over">OVER (Altas)</option><option value="under">UNDER (Bajas)</option>
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Línea (225.5)" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-center text-white" onChange={e => {const n=[...ouLines]; n[i].value=e.target.value; setOuLines(n);}} />
                    <input placeholder="Cuota" className="w-16 bg-black/40 p-3 rounded-xl text-xs font-bold text-center text-white" onChange={e => {const n=[...ouLines]; n[i].odds=e.target.value; setOuLines(n);}} />
                    <button onClick={() => setOuLines(ouLines.filter((_,idx)=>idx!==i))} className="text-red-900"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-orange-500 transition-all active:scale-95">
              {isAnalyzing ? <RefreshCw className="animate-spin mx-auto"/> : 'Procesar NBA Engine'}
            </button>
          </div>
        </div>

        {/* PANEL 3: REPORTE */}
        <div className="lg:col-span-4 space-y-6">
          {resultsH.length > 0 || resultsOU.length > 0 ? (
            <div className="animate-reveal space-y-6">
              <div className="glass-titanium p-8 rounded-[2.5rem] border-l-4 border-orange-500 relative overflow-hidden shadow-2xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10 text-center">Matriz de Valor NBA</h3>
                <div className="space-y-8">
                  {resultsH.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0 text-white">
                      <div className="space-y-1">
                        <div className={`text-[11px] font-black uppercase ${r.edge > 1.5 ? 'text-orange-500' : 'text-gray-500'}`}>S: {r.team} [{r.line}]</div>
                        <div className="text-[9px] text-gray-400 uppercase">Cuota: {r.odds}</div>
                      </div>
                      <div className={`text-5xl font-black italic tracking-tighter ${r.edge > 1.5 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                  {resultsOU.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0 text-white">
                      <div className="space-y-1">
                        <div className={`text-[11px] font-black uppercase ${Math.abs(r.edge) > 3 ? 'text-blue-400' : 'text-gray-500'}`}>OU: {r.type} [{r.value}]</div>
                        <div className="text-[9px] text-gray-400 uppercase">Cuota: {r.odds}</div>
                      </div>
                      <div className={`text-5xl font-black italic tracking-tighter ${Math.abs(r.edge) > 3 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={copyMasterPrompt} className="w-full glass-titanium border-blue-500/40 p-10 rounded-[2.5rem] flex flex-col items-center gap-5 hover:border-blue-500/80 transition-all group active:scale-95 shadow-2xl">
                 <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform shadow-inner"><ClipboardCheck size={40} /></div>
                 <span className="text-white text-xl font-black tracking-tight uppercase">Obtener Veredicto Maestro</span>
                 <p className="text-[10px] text-blue-500/70 font-bold uppercase tracking-widest italic">Auditoría NBA 360</p>
              </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed border-white/10 min-h-[500px]">
               <Dribbble size={80} className="mb-8 text-gray-700" />
               <p className="text-xs font-black uppercase tracking-[0.4em] leading-loose text-white text-center">Configure parámetros NBA<br/>para iniciar auditoría</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NbaModule;
