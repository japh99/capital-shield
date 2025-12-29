import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Globe2, BarChart3, Clock, Hash, BrainCircuit, AlertCircle
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
  const [projTotal, setProjTotal] = useState(''); // Proyección goles totales (Dunkel/Manual)
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  // Matrices de mercado
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '2.00' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '2.5', odds: '1.90' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA DE APOYO ---
  
  // Traduce hándicaps asiáticos: "0/-0.5" -> -0.25
  const parseLine = (input: string): number => {
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean);
  };

  // Hora local Colombia
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

      // Filtro inteligente de fecha (Sincronizado con Colombia)
      const filtered = resp.data.filter((m: any) => {
        const matchInCol = new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'});
        return matchInCol === selectedDate;
      });
      setMatches(filtered);
    } catch (e) {
      alert("Error de conexión. Revisa tus API Keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!selectedMatch) return alert("Selecciona un partido.");
    setIsAnalyzing(true);
    setAiResponse(''); // Limpiar IA previa
    try {
      // 1. Análisis Hándicaps (si hay ELOs)
      if (eloH && eloA) {
        const respH = await axios.post(CONFIG.API_BACKEND, { h_rating: eloH, a_rating: eloA, sport: 'soccer' });
        const resH = handicaps.filter(h => h.line).map(h => {
          const lVal = parseLine(h.line);
          const edge = h.team === 'home' ? (respH.data.expected_value + lVal) : (lVal - respH.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: respH.data.expected_value };
        });
        setResultsH(resH);
      }

      // 2. Análisis Over/Under (si hay Proyección Total)
      if (projTotal) {
        const resOU = ouLines.filter(l => l.value).map(l => {
          const val = parseFloat(l.value);
          const edge = l.type === 'over' ? (parseFloat(projTotal) - val) : (val - parseFloat(projTotal));
          return { ...l, edge: Math.round(edge * 100) / 100 };
        });
        setResultsOU(resOU);
      }
    } catch (e) { alert("Error en el cálculo matemático."); }
    finally { setIsAnalyzing(false); }
  };

  const requestAiAnalysis = async () => {
    setAiLoading(true);
    const prompt = `
      Actúa como experto en Inteligencia Deportiva. Analiza el partido: ${selectedMatch.home_team} vs ${selectedMatch.away_team}.
      MATEMÁTICA: Margen esperado ${resultsH[0]?.expected || 'N/A'}, Proyección goles ${projTotal || 'N/A'}.
      LÍNEAS ANALIZADAS:
      ${resultsH.map(r => `* Handicap ${r.team} [${r.line}] Edge: ${r.edge}`).join(', ')}
      ${resultsOU.map(r => `* Total ${r.type} [${r.value}] Edge: ${r.edge}`).join(', ')}
      NOTAS: ${analystNotes}
      Investiga H2H, bajas (lesiones/sanciones) y clima. Da un veredicto: ¿Cuál línea es la mejor inversión y por qué?
    `;

    try {
      const resp = await axios.post('/api/ai_analysis', { prompt });
      setAiResponse(resp.data.analysis);
    } catch (e) { setAiResponse("Error al procesar el análisis con OpenRouter."); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="animate-reveal space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Soccer <span className="text-emerald-500 not-italic font-light">Terminal</span></h2>
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
             <Globe2 size={12} className="text-emerald-500/50" />
             <span>Capital Shield Intelligence Hub (Colombia GMT-5)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO Y FECHA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-[2rem] p-6 border-white/5">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 flex items-center gap-2"><Search size={14} /> 1. Mercado y Fecha</h3>
            
            <div className="space-y-3">
              <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:ring-2 ring-emerald-500/20 transition-all">
                <option value="">Seleccionar Competición...</option>
                {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id} className="bg-neutral-900">{l.name}</option>)}
              </select>

              <div className="grid grid-cols-12 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 ring-emerald-500/20 transition-all">
                <div className="col-span-2 flex justify-center text-gray-500 border-r border-white/10 py-4"><Calendar size={18} /></div>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="col-span-10 bg-transparent p-4 text-xs text-white scheme-dark outline-none font-bold" />
              </div>
            </div>

            <div className="mt-8 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-white">
              {loading ? <div className="text-center py-20 animate-pulse text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Sincronizando...</div> : 
                matches.length > 0 ? matches.map(m => (
                  <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                    <div className="font-black text-[11px] text-white uppercase tracking-tight mb-1">{m.home_team} vs {m.away_team}</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase"><Clock size={10} /> {getColombiaTime(m.commence_time)} (COL)</div>
                  </button>
                )) : selectedLeague && <p className="text-center py-20 text-[10px] opacity-30 uppercase tracking-widest">No hay juegos scheduleados</p>
              }
            </div>
          </div>
        </div>

        {/* PANEL 2: CORE DE ANÁLISIS */}
        <div className="lg:col-span-4">
          <div className="glass-titanium rounded-[2rem] p-6 border-t-emerald-500/50 border-t-2">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 flex items-center gap-2"><Target size={14} /> 2. Core de Inteligencia</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" placeholder="Home ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
              <input type="number" placeholder="Away ELO" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white text-center outline-none focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
            </div>

            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50"><Hash size={14} /></div>
              <input type="number" placeholder="Goles Totales Proyectados" className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-2xl text-xs text-white outline-none focus:border-emerald-500" onChange={e => setProjTotal(e.target.value)} />
            </div>

            <textarea placeholder="Notas: Lesiones, H2H, Clima, Tiros..." className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none h-16 resize-none mb-6" onChange={e => setAnalystNotes(e.target.value)} />
            
            <div className="space-y-6">
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Hándicaps & Totales</span>
                  <div className="flex gap-2">
                    <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 transition-all"><Plus size={14}/></button>
                    <button onClick={() => setOuLines([...ouLines, { type: 'over', value: '', odds: '' }])} className="p-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 transition-all"><BarChart3 size={14}/></button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {handicaps.map((h, i) => (
                    <div key={`h-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                      <select value={h.team} onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="bg-transparent text-[10px] text-emerald-500 font-bold outline-none uppercase">
                        <option value="home">LOCAL</option><option value="away">VISITANTE</option>
                      </select>
                      <div className="flex gap-2">
                        <input placeholder="Línea" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center font-bold" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                        <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center font-bold" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                        <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900 px-1"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                  {ouLines.map((l, i) => (
                    <div key={`ou-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                      <select value={l.type} onChange={(e) => { const n = [...ouLines]; n[i].type = e.target.value; setOuLines(n); }} className="bg-transparent text-[10px] text-blue-500 font-bold outline-none uppercase">
                        <option value="over">OVER (Altas)</option><option value="under">UNDER (Bajas)</option>
                      </select>
                      <div className="flex gap-2">
                        <input placeholder="Total" className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center font-bold" onChange={(e) => { const n = [...ouLines]; n[i].value = e.target.value; setOuLines(n); }} />
                        <input placeholder="Cuota" className="w-16 bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white text-center font-bold" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
                        <button onClick={() => setOuLines(ouLines.filter((_, idx) => idx !== i))} className="text-red-900 px-1"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-xl hover:bg-emerald-500 transition-all active:scale-95">
                {isAnalyzing ? <RefreshCw className="animate-spin mx-auto" /> : 'Procesar Inversión'}
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: AUDITORÍA IA */}
        <div className="lg:col-span-4 space-y-6">
          {(resultsH.length > 0 || resultsOU.length > 0) ? (
            <div className="animate-reveal space-y-6">
              <div className="glass-titanium rounded-[2rem] p-8 border-l-4 border-emerald-500 relative overflow-hidden">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 tracking-[0.2em]">Resultado Matemático</h3>
                <div className="space-y-6">
                  {resultsH.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div>
                        <div className={`text-[10px] font-black uppercase ${r.edge > 0.3 ? 'text-emerald-500' : 'text-gray-500'}`}>H: {r.team} [{r.line}]</div>
                        <div className="text-[9px] text-gray-600 uppercase mt-1">Cuota: {r.odds}</div>
                      </div>
                      <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 0.3 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                    </div>
                  ))}
                  {resultsOU.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0">
                      <div>
                        <div className={`text-[10px] font-black uppercase ${r.edge > 0.5 ? 'text-blue-500' : 'text-gray-500'}`}>OU: {r.type} [{r.value}]</div>
                        <div className="text-[9px] text-gray-600 uppercase mt-1">Cuota: {r.odds}</div>
                      </div>
                      <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 0.5 ? 'text-white' : 'text-gray-700'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-titanium rounded-[2rem] p-6 border border-emerald-500/20 bg-emerald-500/5 shadow-2xl">
                 <button onClick={requestAiAnalysis} disabled={aiLoading} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                    {aiLoading ? <RefreshCw className="animate-spin" size={16} /> : <BrainCircuit size={18} />}
                    {aiLoading ? 'AI Analizando...' : 'Ejecutar Auditoría IA'}
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
               <Trophy size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-white text-center">Filtre por fecha y elija un partido<br/>para auditar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoccerModule;
