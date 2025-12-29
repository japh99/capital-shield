import React, { useState, useEffect } from 'react';
import { 
  Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Activity, BarChart3, Clock, Hash, BrainCircuit, AlertCircle 
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
  
  // Radar de Prioridad (Smart Scan)
  const [radarResults, setRadarResults] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // IA Auditoría Directa
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  // Matrices de mercado
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '', odds: '' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '', odds: '' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA DE TIEMPO (COLOMBIA GMT-5) ---
  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  // --- ACCIONES API (PUERTA ÚNICA /api) ---

  const fetchNbaMatches = async () => {
    setLoading(true);
    setMatches([]);
    setRadarResults([]);
    try {
      // Cargamos programación base desde Odds API
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'h2h', dateFormat: 'iso' }
      });
      setMatches(resp.data);
    } catch (e) {
      alert("Error al obtener calendario. Revisa tu VITE_ODDS_KEYS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNbaMatches(); }, []);

  // Filtro de fecha exacto para Colombia
  const filteredMatches = matches.filter((m: any) => {
    const matchInCol = new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'});
    return matchInCol === selectedDate;
  });

  // TAREA 1: SMART RADAR (ESCANEO DE VALOR)
  const runSmartRadar = async () => {
    if (filteredMatches.length === 0) return alert("No hay juegos para escanear.");
    setIsScanning(true);
    try {
      const resp = await axios.post('/api', { 
        task: 'radar',
        matches: filteredMatches 
      });
      setRadarResults(resp.data.priorities || []);
    } catch (e: any) {
      alert("Error en Radar: " + (e.response?.data?.error || e.message));
    } finally {
      setIsScanning(false);
    }
  };

  // TAREA 2: ANÁLISIS MATEMÁTICO CORE
  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido.");
    setIsAnalyzing(true);
    setAiResponse('');
    try {
      // Análisis Spreads
      if (ratingH && ratingA) {
        const resH = await Promise.all(handicaps.filter(h => h.line).map(async (h) => {
          const resp = await axios.post('/api', { task: 'math', sport: 'nba', h_rating: ratingH, a_rating: ratingA, line: h.line });
          const edge = h.team === 'home' ? (resp.data.expected_value + parseFloat(h.line)) : (parseFloat(h.line) - resp.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: resp.data.expected_value };
        }));
        setResultsH(resH);
      }
      // Análisis Over/Under
      if (projTotal) {
        const resOU = await Promise.all(ouLines.filter(l => l.value).map(async (l) => {
          const resp = await axios.post('/api', { task: 'math', sport: 'nba_ou', h_rating: projTotal, line: l.value });
          const edge = l.type === 'over' ? (resp.data.expected_value - parseFloat(l.value)) : (parseFloat(l.value) - resp.data.expected_value);
          return { ...l, edge: Math.round(edge * 100) / 100 };
        }));
        setResultsOU(resOU);
      }
    } catch (e) { alert("Error en el cálculo matemático."); }
    finally { setIsAnalyzing(false); }
  };

  // TAREA 3: AUDITORÍA IA DIRECTA
  const requestAiAnalysis = async () => {
    setAiLoading(true);
    const prompt = `
      NBA Audit: ${selectedMatch.home_team} vs ${selectedMatch.away_team}. 
      Proyección Dunkel: ${projTotal} pts. Spreads analizados: ${resultsH.length}. 
      Notas: ${analystNotes}. 
      Investiga: Lesiones estrellas, B2B y Pace. ¿Veredicto de inversión?
    `;
    try {
      const resp = await axios.post('/api', { task: 'audit', prompt: prompt });
      setAiResponse(resp.data.analysis);
    } catch (e) { setAiResponse("Error al contactar con la IA."); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="animate-reveal space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">NBA <span className="text-orange-500 not-italic font-light">Radar</span></h2>
        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
           <Clock size={12} className="text-orange-500" />
           <span>Sincronizado: Colombia Time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: CARTELERA Y SMART SCAN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-[2rem] p-6 border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] flex items-center gap-2"><Search size={14} /> 1. Mercado</h3>
              <button 
                onClick={runSmartRadar} 
                disabled={isScanning || filteredMatches.length === 0}
                className="px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-black transition-all text-[9px] font-black uppercase flex items-center gap-2 border border-orange-500/20 active:scale-95"
              >
                {isScanning ? <RefreshCw className="animate-spin" size={10} /> : <BrainCircuit size={10} />}
                Smart Scan
              </button>
            </div>
            
            <div className="grid grid-cols-12 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
              <div className="col-span-2 flex justify-center text-gray-500 border-r border-white/10 py-4"><Calendar size={18} /></div>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="col-span-10 bg-transparent p-4 text-xs text-white scheme-dark outline-none font-bold text-center" />
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar text-white">
              {loading ? <p className="text-center py-20 text-[10px] animate-pulse">Consultando...</p> : 
                filteredMatches.map(m => {
                  const priority = radarResults.find(r => r.teams.toLowerCase().includes(m.home_team.toLowerCase()) || r.teams.toLowerCase().includes(m.away_team.toLowerCase()));
                  return (
                    <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl transition-all border relative overflow-hidden ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                      {priority && <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[7px] font-black px-3 py-1 rounded-bl-xl animate-pulse">VALUE: {priority.score}%</div>}
                      <div className="font-black text-[11px] uppercase mb-1">{m.home_team} @ {m.away_team}</div>
                      <div className="text-[9px] text-gray-500 font-bold tracking-widest">{getColombiaTime(m.commence_time)}</div>
                      {priority && <div className="mt-3 text-[8px] text-emerald-400 italic border-t border-white/5 pt-2">{priority.reason}</div>}
                    </button>
                  );
                })
              }
            </div>
          </div>
        </div>

        {/* PANEL 2: CORE ANALYTICS */}
        <div className="lg:col-span-4">
          <div className="glass-titanium rounded-[2rem] p-6 border-t-orange-500/50 border-t-2">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2"><Target size={14} /> 2. Core de Inteligencia</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" placeholder="Home RTG" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-orange-500" onChange={e => setRatingH(e.target.value)} />
              <input type="number" placeholder="Away RTG" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-orange-500" onChange={e => setRatingA(e.target.value)} />
            </div>
            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50"><Hash size={14} /></div>
              <input type="number" placeholder="Dunkel Total Prediction" className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-2xl text-xs text-white outline-none focus:border-orange-500" onChange={e => setProjTotal(e.target.value)} />
            </div>
            <textarea placeholder="Notas pro (Lesiones, Pace...)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none h-16 resize-none mb-6" onChange={e => setAnalystNotes(e.target.value)} />
            
            <div className="space-y-4">
               <div className="border-t border-white/5 pt-4">
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Líneas Vegas</span>
                   <div className="flex gap-2">
                     <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="p-1 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500"><Plus size={14}/></button>
                     <button onClick={() => setOuLines([...ouLines, { type: 'over', value: '', odds: '' }])} className="p-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500"><Plus size={14}/></button>
                   </div>
                 </div>

                 <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {handicaps.map((h, i) => (
                      <div key={`h-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2">
                        <select onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="bg-transparent text-[10px] text-orange-500 font-bold outline-none uppercase w-24">
                          <option value="home">LOCAL</option><option value="away">VISITA</option>
                        </select>
                        <input placeholder="Línea" className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-xs text-white text-center" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                        <input placeholder="Cuota" className="w-14 bg-black/40 border border-white/10 p-2 rounded text-xs text-white text-center" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                      </div>
                    ))}
                    {ouLines.map((l, i) => (
                      <div key={`ou-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2">
                        <select onChange={(e) => { const n = [...ouLines]; n[i].type = e.target.value; setOuLines(n); }} className="bg-transparent text-[10px] text-blue-500 font-bold outline-none uppercase w-24">
                          <option value="over">OVER</option><option value="under">UNDER</option>
                        </select>
                        <input placeholder="Total" className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-xs text-white text-center" onChange={(e) => { const n = [...ouLines]; n[i].value = e.target.value; setOuLines(n); }} />
                        <input placeholder="Cuota" className="w-14 bg-black/40 border border-white/10 p-2 rounded text-xs text-white text-center" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
                      </div>
                    ))}
                 </div>
               </div>

               <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-xl hover:bg-orange-500 transition-all active:scale-95">
                 {isAnalyzing ? <RefreshCw className="animate-spin mx-auto" /> : 'Analizar Probabilidades'}
               </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: AUDITORÍA IA */}
        <div className="lg:col-span-4 space-y-6">
          {(resultsH.length > 0 || resultsOU.length > 0) ? (
            <div className="animate-reveal space-y-6">
               <div className="glass-titanium rounded-[2rem] p-8 border-l-4 border-orange-500 relative overflow-hidden text-white">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10">Veredicto Matemático</h3>
                  <div className="space-y-6">
                    {resultsH.map((r, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                        <div><div className={`text-[10px] font-black uppercase ${r.edge > 1.5 ? 'text-orange-500' : 'text-gray-500'}`}>S: {r.team} [{r.line}]</div><div className="text-[9px] text-gray-400">Cuota: {r.odds}</div></div>
                        <div className={`text-4xl font-black italic tracking-tighter ${r.edge > 1.5 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                      </div>
                    ))}
                    {resultsOU.map((r, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                        <div><div className={`text-[10px] font-black uppercase ${Math.abs(r.edge) > 3 ? 'text-orange-400' : 'text-gray-500'}`}>OU: {r.type} [{r.value}]</div><div className="text-[9px] text-gray-400">Cuota: {r.odds}</div></div>
                        <div className={`text-4xl font-black italic tracking-tighter ${Math.abs(r.edge) > 3 ? 'text-white' : 'text-gray-800'}`}>{r.edge}</div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="glass-titanium rounded-[2rem] p-6 border border-emerald-500/20 bg-emerald-500/5 shadow-2xl">
                 <button onClick={requestAiAnalysis} disabled={aiLoading} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all active:scale-95 shadow-lg">
                    {aiLoading ? <RefreshCw className="animate-spin" size={16} /> : <BrainCircuit size={18} />}
                    {aiLoading ? 'Auditoría en Progreso...' : 'Ejecutar Auditoría IA'}
                 </button>
                 {aiResponse && (
                    <div className="mt-6 text-[11px] text-gray-300 leading-relaxed font-medium bg-black/40 p-5 rounded-2xl border border-white/5 animate-reveal max-h-[400px] overflow-y-auto custom-scrollbar">
                       {aiResponse}
                    </div>
                 )}
               </div>
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
