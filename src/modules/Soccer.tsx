import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, MessageSquare, ClipboardCheck, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '2.00' }]);
  const [results, setResults] = useState<any[]>([]);

  const parseHandicap = (input: string): number => {
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean);
  };

  const fetchMatches = async (leagueId: string, dateStr: string) => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      setMatches(resp.data.filter((m: any) => m.commence_time.startsWith(dateStr)));
    } catch (e) { alert("Error de API. Revisa tus llaves."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague, selectedDate); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos.");
    setIsAnalyzing(true);
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, { h_rating: eloH, a_rating: eloA });
      const expectedMargin = resp.data.expected_margin;

      const analysisResults = handicaps.map((h) => {
        const lineVal = parseHandicap(h.line);
        // EDGE = (Margen Proyectado + Handicap). 
        // Si el resultado es positivo, hay valor en esa línea.
        const edge = h.team === 'home' 
          ? (expectedMargin + lineVal) 
          : (lineVal - expectedMargin);
        
        return { ...h, edge: round(edge, 2), expected_margin: expectedMargin };
      });

      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo."); }
    finally { setIsAnalyzing(false); }
  };

  const round = (num: number, decimales: number) => {
    return Math.round(num * Math.pow(10, decimales)) / Math.pow(10, decimales);
  };

  const copySuperPrompt = () => {
    const bestLine = results.reduce((prev, current) => (prev.edge > current.edge) ? prev : current);
    
    const prompt = `
# 🛡️ AUDITORÍA DE INVERSIÓN: CAPITAL SHIELD v3.0
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**LIGA:** ${CONFIG.LEAGUES.SOCCER.find(l => l.id === selectedLeague)?.name}

## 📊 FASE 1: ANÁLISIS CUANTITATIVO (MODELO ELO)
- **Margen de Goles Proyectado (Fair Value):** ${results[0]?.expected_margin} a favor de ${selectedMatch.home_team}.
- **Matriz de Ventaja (EDGE) Comparada:**
${results.map(r => `  * APUESTA: ${r.team === 'home' ? selectedMatch.home_team : selectedMatch.away_team} [${r.line}] | CUOTA: ${r.odds} -> EDGE: ${r.edge}`).join('\n')}

## 🧠 FASE 2: AUDITORÍA CUALITATIVA (TU TAREA)
Como experto en Big Data Deportivo e Insider de mercados, investiga:

1. **H2H Y TIROS (Matchup):** Revisa los últimos 5 partidos. ¿Cuántos tiros a puerta (SoT) promedian? ¿El estilo del ${selectedMatch.away_team} complica al bloque defensivo del ${selectedMatch.home_team}?
2. **PERSONAL Y BAJAS:** Busca noticias de las últimas 12 horas. ¿Hay bajas en el "Eje Central" (Portero, Defensa Central o Mediocentro)?
3. **LOGÍSTICA:** ¿Algún equipo viene de jugar más de 90 min en copa o tuvo un viaje largo?
4. **NOTAS DEL ANALISTA:** "${analystNotes || 'Sin observaciones'}"

## ⚖️ VERDICTO FINAL Y RECOMENDACIÓN:
Basado en que la línea con mayor valor matemático es **${bestLine.team.toUpperCase()} [${bestLine.line}]** con un EDGE de **${bestLine.edge}**:
- ¿Consideras que esta es la mejor opción de inversión hoy?
- ¿Existe otra línea en la matriz con mejor relación Riesgo/Beneficio según las noticias?
- Da un veredicto final: **INVERTIR** o **NO INVERTIR (TRAP)** y justifica por qué.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡SÚPER PROMPT MAESTRO ACTUALIZADO!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* SECCIÓN 1: MERCADO */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest flex items-center gap-2"><Search size={14}/> 1. Mercado</h3>
        <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-4 outline-none focus:border-emerald-500">
          <option value="">Seleccionar Competición...</option>
          {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-6 scheme-dark" />
        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? <p className="text-center py-10 text-[10px] animate-pulse">Sincronizando...</p> : 
            matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <div className="font-black text-[10px] text-white uppercase">{m.home_team} vs {m.away_team}</div>
              </button>
            ))
          }
        </div>
      </div>

      {/* SECCIÓN 2: DATOS */}
      <div className="glass-card p-6 border-t-4 border-emerald-600 bg-gradient-to-b from-emerald-600/5 to-transparent">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest text-center">2. Inteligencia</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input type="number" placeholder="ELO Local" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloH(e.target.value)} />
          <input type="number" placeholder="ELO Visita" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloA(e.target.value)} />
        </div>
        <textarea placeholder="Notas pro (Tiros, H2H, Lesiones...)" className="w-full bg-white/5 p-4 rounded-xl text-[11px] mb-4 border border-white/5 h-24 outline-none focus:border-emerald-500/50" onChange={e => setAnalystNotes(e.target.value)} />
        
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] uppercase font-bold text-gray-400">Líneas de Mercado</span>
            <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500 hover:scale-110"><Plus size={18}/></button>
          </div>
          {handicaps.map((h, i) => (
            <div key={i} className="bg-white/5 p-3 rounded-xl mb-2 border border-white/5 animate-in slide-in-from-right-2">
              <select value={h.team} onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="w-full bg-transparent text-[10px] text-emerald-500 font-bold mb-2 outline-none">
                <option value="home">Hándicap LOCAL</option>
                <option value="away">Hándicap VISITANTE</option>
              </select>
              <div className="flex gap-2">
                <input placeholder="Línea" className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white font-mono" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white font-mono" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] mt-4 shadow-lg hover:bg-emerald-500 transition-all">
            {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
          </button>
        </div>
      </div>

      {/* SECCIÓN 3: RESULTADOS */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="animate-in zoom-in-95 space-y-4">
            <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Matriz de Valoración</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2">
                  <div>
                    <div className={`text-[10px] font-bold uppercase ${r.edge > 0.5 ? 'text-emerald-500' : 'text-gray-500'}`}>
                      {r.team} [{r.line}]
                    </div>
                    <div className="text-[9px] text-gray-600 uppercase mt-1">Cuota: {r.odds}</div>
                  </div>
                  <div className={`text-3xl font-black ${r.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{r.edge}</div>
                </div>
              ))}
            </div>
            <button onClick={copySuperPrompt} className="w-full bg-blue-600 border border-blue-500/40 p-5 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              <ClipboardCheck size={18} /> Copiar Prompt Estratégico
            </button>
          </div>
        ) : (
          <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-20">
            <Trophy size={48} className="mb-4 text-gray-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Esperando Parámetros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoccerModule;
