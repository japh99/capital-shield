import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Globe2, BarChart3, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  // --- ESTADOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Hándicaps Múltiples (Local/Visita, Línea y Cuota)
  const [handicaps, setHandicaps] = useState<any[]>([
    { team: 'home', line: '-0.5', odds: '2.00' }
  ]);
  const [results, setResults] = useState<any[]>([]);

  // --- LÓGICA DE APOYO ---
  
  // Traductor de Hándicaps Asiáticos (ej: 0/-0.5 -> -0.25)
  const parseHandicap = (input: string): number => {
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean);
  };

  // Conversión a Hora de Colombia
  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // --- ACCIONES API ---

  const fetchMatches = async (leagueId: string, dateStr: string) => {
    if (!leagueId) return;
    setLoading(true);
    setMatches([]);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      // Filtrar partidos que coincidan con la fecha elegida
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
    } catch (e) {
      alert("Error de conexión. Verifica tus API Keys en Vercel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLeague) fetchMatches(selectedLeague, selectedDate);
  }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos de ELO o selección de partido.");
    setIsAnalyzing(true);
    try {
      // Llamada al backend para obtener el margen esperado (Fair Value)
      const resp = await axios.post(CONFIG.API_BACKEND, { 
        h_rating: eloH, 
        a_rating: eloA, 
        sport: 'soccer' 
      });
      
      const expectedMargin = resp.data.expected_margin;

      // Calcular el EDGE para cada línea de hándicap ingresada
      const analysisResults = handicaps.map((h) => {
        const lineVal = parseHandicap(h.line);
        // EDGE positivo significa valor para el apostador
        const edge = h.team === 'home' 
          ? (expectedMargin + lineVal) 
          : (lineVal - expectedMargin);
        
        return { ...h, edge: Math.round(edge * 100) / 100, expected: expectedMargin };
      });

      setResults(analysisResults);
    } catch (e) {
      alert("Error en el cálculo matemático.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copySuperPrompt = () => {
    const bestLine = results.reduce((prev, current) => (prev.edge > current.edge) ? prev : current);
    
    const prompt = `
# 🛡️ AUDITORÍA DE INVERSIÓN: CAPITAL SHIELD v3.0
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**LIGA:** ${CONFIG.LEAGUES.SOCCER.find(l => l.id === selectedLeague)?.name}

## 📊 FASE 1: ANÁLISIS CUANTITATIVO (MODELO ELO)
- **Margen de Goles Proyectado (Fair Value):** ${results[0]?.expected} a favor de ${selectedMatch.home_team}.
- **Matriz de Ventaja (EDGE) Comparada:**
${results.map(r => `  * APUESTA: ${r.team === 'home' ? selectedMatch.home_team : selectedMatch.away_team} [${r.line}] | CUOTA: ${r.odds} -> EDGE: ${r.edge}`).join('\n')}

## 🧠 FASE 2: AUDITORÍA CUALITATIVA (IA)
Actúa como experto en Big Data Deportivo e Insider de mercados, investiga:

1. **H2H Y TIROS (Matchup):** Revisa los últimos 5 partidos. ¿Cuántos tiros a puerta (SoT) promedian? ¿El estilo del ${selectedMatch.away_team} complica al bloque defensivo del ${selectedMatch.home_team}?
2. **PERSONAL Y BAJAS:** Busca noticias de las últimas 12 horas. ¿Hay bajas en el "Eje Central" (Portero, Defensa Central o Mediocentro)?
3. **LOGÍSTICA Y MOTIVACIÓN:** ¿Vienen de jugar más de 90 min en copa o tuvo un viaje largo? ¿Se juegan el descenso o rotan por jugar torneo internacional?
4. **NOTAS DEL ANALISTA:** "${analystNotes || 'Sin observaciones'}"

## ⚖️ VERDICTO FINAL Y RECOMENDACIÓN:
Basado en que la línea con mayor valor matemático es ${bestLine.team.toUpperCase()} [${bestLine.line}] con un EDGE de ${bestLine.edge}:
- ¿Consideras que esta es la mejor opción de inversión hoy?
- ¿Existe otra línea en la matriz con mejor relación Riesgo/Beneficio según las noticias?
- Da un veredicto final: INVERTIR o NO INVERTIR (TRAP) y justifica por qué.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Súper Prompt Maestro Copiado!");
  };

  return (
    <div className="animate-reveal space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Soccer <span className="text-emerald-500 not-italic font-light">Terminal</span>
          </h2>
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
             <Globe2 size={12} className="text-emerald-500/50" />
             <span>Real-Time Intelligence Stream</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: SELECCIÓN (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-titanium rounded-[2rem] p-6 border-white/5">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Search size={14} /> 1. Mercado y Fecha
            </h3>
            
            <div className="space-y-4">
              <select 
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:ring-2 ring-emerald-500/20 transition-all"
              >
                <option value="">Seleccionar Competición...</option>
                {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id} className="bg-neutral-900">{l.name}</option>)}
              </select>

              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-xs text-white scheme-dark outline-none"
                />
              </div>
            </div>

            <div className="mt-8 space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center py-20 gap-4 opacity-50">
                  <RefreshCw className="animate-spin text-emerald-500" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                </div>
              ) : matches.length > 0 ? (
                matches.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMatch(m)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-500 border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <div className="font-black text-xs text-white uppercase tracking-tight mb-1">{m.home_team} vs {m.away_team}</div>
                    <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                      <Clock size={10} /> {getColombiaTime(m.commence_time)} (COL)
                    </div>
                  </button>
                ))
              ) : selectedLeague && (
                <div className="text-center py-20 opacity-20">
                  <AlertCircle className="mx-auto mb-2" size={32} />
                  <p className="text-[10px] font-bold uppercase">No hay partidos hoy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA (4/12) */}
        <div className="lg:col-span-4">
          <div className="glass-titanium rounded-[2rem] p-6 border-t-emerald-500/50 border-t-2">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Target size={14} /> 2. Core de Análisis
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold">Home ELO</span>
                <input type="number" placeholder="1800" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center text-white outline-none focus:border-emerald-500 transition-colors" onChange={e => setEloH(e.target.value)} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 ml-3 uppercase font-bold">Away ELO</span>
                <input type="number" placeholder="1800" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-lg font-black text-center text-white outline-none focus:border-emerald-500 transition-colors" onChange={e => setEloA(e.target.value)} />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                 <MessageSquare size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Notas de Campo</span>
              </div>
              <textarea 
                placeholder="Ej: Lluvia pesada, central titular lesionado..." 
                className="w-full bg-transparent text-xs text-white outline-none h-20 resize-none placeholder:opacity-20"
                onChange={e => setAnalystNotes(e.target.value)}
              />
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
               <div className="flex justify-between items-center px-2">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Matriz de Hándicaps</span>
                 <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                    <Plus size={16} />
                 </button>
               </div>

               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {handicaps.map((h, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-reveal relative group">
                      <div className="flex justify-between items-center mb-3">
                         <select 
                           value={h.team} 
                           onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }}
                           className="bg-transparent text-[10px] font-black text-emerald-500 uppercase outline-none"
                         >
                            <option value="home">Hándicap LOCAL</option>
                            <option value="away">Hándicap VISITANTE</option>
                         </select>
                         <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-500/30 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                         </button>
                      </div>
                      <div className="flex gap-2">
                        <input placeholder="0/-0.5" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-center text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                        <input placeholder="Cuota" className="w-20 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-center text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                      </div>
                    </div>
                  ))}
               </div>

               <button 
                onClick={runFullAnalysis} 
                disabled={isAnalyzing}
                className="w-full bg-emerald-600 p-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
               >
                 {isAnalyzing ? <RefreshCw className="animate-spin mx-auto" /> : 'Analizar Inversión'}
               </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {results.length > 0 ? (
            <div className="animate-reveal space-y-6">
               <div className="glass-titanium rounded-[2rem] p-8 border-l-4 border-emerald-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BarChart3 size={100} />
                  </div>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10">Auditoría de Valor Final</h3>
                  
                  <div className="space-y-8">
                    {results.map((r, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-white/5 pb-6 last:border-0">
                        <div className="space-y-1">
                          <div className={`text-[11px] font-black uppercase ${r.edge > 0.3 ? 'text-emerald-500' : 'text-gray-500'}`}>
                            {r.team} [{r.line}]
                          </div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Cuota: {r.odds}</div>
                        </div>
                        <div className={`text-5xl font-black italic tracking-tighter ${r.edge > 0.3 ? 'text-white' : 'text-gray-800'}`}>
                          {r.edge > 0 ? `+${r.edge}` : r.edge}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <button 
                onClick={copySuperPrompt}
                className="w-full glass-titanium border-blue-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:border-blue-500/60 transition-all group shadow-2xl active:scale-95"
               >
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <ClipboardCheck size={32} />
                 </div>
                 <div className="text-center">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-1">Capa de Inteligencia</span>
                    <span className="text-white text-lg font-bold">Copiar Reporte Maestro</span>
                 </div>
               </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed min-h-[450px]">
               <Trophy size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-gray-500">
                  Esperando entrada de datos<br/>para auditoría táctica
               </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Componente Clock para el icono
const Clock = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default SoccerModule;
