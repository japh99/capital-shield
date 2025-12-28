import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, MessageSquare, ClipboardCheck } from 'lucide-react';
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
    } catch (e) { alert("Error de API. Revisa las Keys en Vercel."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague, selectedDate); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos críticos.");
    setIsAnalyzing(true);
    try {
      const analysisResults = await Promise.all(handicaps.map(async (h) => {
        const numericLine = parseHandicap(h.line);
        const adjustedLine = h.team === 'home' ? numericLine : (numericLine * -1);
        const resp = await axios.post(CONFIG.API_BACKEND, { h_rating: eloH, a_rating: eloA, line: adjustedLine, sport: 'soccer' });
        return { ...h, ...resp.data };
      }));
      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo."); }
    finally { setIsAnalyzing(false); }
  };

  const copySuperPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA DE INTELIGENCIA DEPORTIVA: CAPITAL SHIELD
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**LIGA:** ${CONFIG.LEAGUES.SOCCER.find(l => l.id === selectedLeague)?.name}

## 📊 CAPA 1: MATEMÁTICA PURA (ELO MODEL)
- **Ratings:** Local [${eloH}] | Visitante [${eloA}]
- **Margen de Goles Proyectado:** ${results[0]?.expected_margin}
- **Matriz de Ventaja (EDGE) Detectada:**
${results.map(r => `  * [${r.team.toUpperCase()}] Línea [${r.line}] @ Cuota [${r.odds}] -> EDGE: ${r.edge}`).join('\n')}

## 🧠 CAPA 2: MISIÓN DE INVESTIGACIÓN (IA)
Actúa como un Senior Analyst de un Hedge Fund Deportivo. Investiga y audita estos pilares:

1. **H2H Y ESTADÍSTICAS (The Matchup):** Analiza los últimos 5 enfrentamientos. Revisa el promedio de tiros a puerta (Shots on Target) y posesión. ¿Hay un equipo que domine tácticamente al otro?
2. **PERSONAL (Squad Report):** Busca noticias de lesiones o sanciones de las últimas 12h. ¿Faltan jugadores clave (Portero titular, Centrales, Goleadores)?
3. **LOGÍSTICA Y FATIGA:** ¿Vienen de jugar Copa o prórroga? ¿Cuántos días de descanso reales tienen?
4. **FACTORES EXTERNOS:** Clima (viento/lluvia), estado del césped y motivación (¿Derbi? ¿Descenso? ¿Prioridad de otra copa?).
5. **OBSERVACIONES DEL ANALISTA:** "${analystNotes || 'Sin notas adicionales'}"

## ⚖️ VERDICTO FINAL:
Compara el EDGE matemático de cada línea presentada. Basado en tu investigación cualitativa: 
- ¿Cuál es la **mejor línea y cuota** para invertir hoy? 
- ¿El EDGE matemático se mantiene o las noticias lo anulan? 
Justifica si es una apuesta de valor real o una "Trampa del Mercado".
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡SÚPER PROMPT MAESTRO COPIADO!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* PANEL 1: SELECCION */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest">1. Mercado</h3>
        <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-4 outline-none focus:border-emerald-500">
          <option value="">Seleccionar Liga/Copa...</option>
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

      {/* PANEL 2: INPUTS */}
      <div className="glass-card p-6 border-t-4 border-emerald-600">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest text-center">2. Datos de Inteligencia</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input type="number" placeholder="ELO Home" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloH(e.target.value)} />
          <input type="number" placeholder="ELO Away" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloA(e.target.value)} />
        </div>
        <textarea placeholder="Notas (lesiones, H2H, tiros...)" className="w-full bg-white/5 p-3 rounded-xl text-[11px] mb-4 border border-white/5 h-20 outline-none focus:border-emerald-500/50" onChange={e => setAnalystNotes(e.target.value)} />
        
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Añadir Líneas de Mercado</span>
            <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500 hover:scale-110 transition-all"><Plus size={16}/></button>
          </div>
          {handicaps.map((h, i) => (
            <div key={i} className="bg-white/5 p-3 rounded-xl mb-2 border border-white/5 animate-in slide-in-from-right-2">
              <select value={h.team} onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="w-full bg-transparent text-[10px] text-emerald-500 font-bold mb-2 outline-none">
                <option value="home">Hándicap LOCAL</option>
                <option value="away">Hándicap VISITANTE</option>
              </select>
              <div className="flex gap-2">
                <input placeholder="Línea (0/-0.5)" className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-4 shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all">
            {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
          </button>
        </div>
      </div>

      {/* PANEL 3: RESULTADOS */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="animate-in zoom-in-95 duration-500 space-y-4">
            <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Matriz de Valor</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2 hover:border-white/20 transition-all">
                  <div>
                    <div className={`text-[10px] font-bold uppercase ${r.team === 'home' ? 'text-emerald-500' : 'text-blue-500'}`}>
                      {r.team} [{r.line}]
                    </div>
                    <div className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest">Cuota: {r.odds}</div>
                  </div>
                  <div className={`text-4xl font-black ${r.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{r.edge}</div>
                </div>
              ))}
            </div>
            <button onClick={copySuperPrompt} className="w-full bg-blue-600 border border-blue-500/40 p-5 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              <ClipboardCheck size={18} /> Copiar Súper Prompt Maestro
            </button>
          </div>
        ) : (
          <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-20">
            <Trophy size={48} className="mb-4 text-gray-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Configuración pendiente<br/>para reporte maestro</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoccerModule;
