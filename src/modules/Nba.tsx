import React, { useState, useEffect } from 'react';
import { Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, ClipboardCheck, Activity } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-4.5', odds: '1.90' }]);
  const [results, setResults] = useState<any[]>([]);

  const parseLine = (input: string): number => {
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean);
  };

  const fetchNbaMatches = async (dateStr: string) => {
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'spreads', dateFormat: 'iso' }
      });
      // Filtrar por la fecha del calendario
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
    } catch (e) { alert("Error cargando NBA. Revisa tus API Keys."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(selectedDate); }, [selectedDate]);

  const runNbaAnalysis = async () => {
    if (!ratingH || !ratingA || !selectedMatch) return alert("Faltan ratings o seleccionar partido.");
    setIsAnalyzing(true);
    try {
      const resp = await axios.post(CONFIG.API_BACKEND, { h_rating: ratingH, a_rating: ratingA, sport: 'nba' });
      const expectedMargin = resp.data.expected_margin;

      const analysisResults = handicaps.map((h) => {
        const lineVal = parseLine(h.line);
        // EDGE NBA = Diferencia entre el margen esperado y el spread del mercado
        const edge = h.team === 'home' ? (expectedMargin + lineVal) : (lineVal - expectedMargin);
        return { ...h, edge: Math.round(edge * 100) / 100, expected_margin: expectedMargin };
      });
      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo."); }
    finally { setIsAnalyzing(false); }
  };

  const copyNbaSuperPrompt = () => {
    const bestLine = results.reduce((prev, current) => (prev.edge > current.edge) ? prev : current);
    const prompt = `
# 🏀 AUDITORÍA NBA: CAPITAL SHIELD STRATEGIC REPORT
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**FECHA:** ${selectedDate}

## 📊 FASE 1: PROYECCIÓN MATEMÁTICA (POWER RATINGS)
- **Margen de Puntos Esperado:** ${results[0]?.expected_margin} puntos a favor de ${selectedMatch.home_team}.
- **Matriz de Spreads Analizados:**
${results.map(r => `  * ${r.team.toUpperCase()} [${r.line}] @ ${r.odds} -> EDGE: ${r.edge} puntos`).join('\n')}

## 🧠 FASE 2: AUDITORÍA DE CAMPO (IA)
Actúa como un experto en handicapping de la NBA. Investiga los siguientes factores clave para validar la ventaja:

1. **LOAD MANAGEMENT Y LESIONES:** ¿Hay estrellas confirmadas como OUT o GTD (Game Time Decision)? (Revisa a los máximos anotadores).
2. **FACTOR CANSANCIO (B2B):** ¿Alguno de los equipos jugó anoche? ¿Están al final de una gira de visitantes por el Oeste/Este?
3. **RITMO Y DEFENSA (Pace/DefRTG):** ¿El estilo de juego rápido del ${selectedMatch.home_team} favorece a la defensa del ${selectedMatch.away_team}? 
4. **NOTAS DEL ANALISTA:** "${analystNotes || 'Sin observaciones'}"

## ⚖️ VERDICTO FINAL:
La línea con mayor EDGE matemático es **${bestLine.team.toUpperCase()} [${bestLine.line}]** con **${bestLine.edge}** puntos de ventaja sobre el mercado.
- ¿Consideras que el riesgo de "Load Management" o "Back-to-Back" anula esta ventaja?
- ¿Cuál es la mejor línea para invertir según tu investigación de última hora?
- Veredicto: **INVERTIR / NO INVERTIR** y justifica.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Súper Prompt de NBA Copiado!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* 1. SELECCION NBA */}
      <div className="glass-card p-6 border-white/5">
        <div className="flex items-center gap-2 mb-6 text-orange-500 uppercase text-[10px] font-bold tracking-widest">
          <Search size={16} /> Radar de Jornada
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-6 scheme-dark outline-none focus:border-orange-500" />
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? <p className="text-center py-10 text-[10px] animate-pulse">Consultando NBA...</p> : 
            matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <div className="font-black text-[10px] text-white uppercase">{m.home_team} @ {m.away_team}</div>
              </button>
            ))
          }
        </div>
      </div>

      {/* 2. DATOS NBA */}
      <div className="glass-card p-6 border-t-4 border-orange-600 bg-gradient-to-b from-orange-600/5 to-transparent">
        <h3 className="text-[10px] font-bold text-orange-500 uppercase mb-4 tracking-widest text-center">2. Power Ratings</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input type="number" placeholder="Rating Home" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-orange-500" onChange={e => setRatingH(e.target.value)} />
          <input type="number" placeholder="Rating Away" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-orange-500" onChange={e => setRatingA(e.target.value)} />
        </div>
        <textarea placeholder="Notas (B2B, Lesiones estrellas, Ritmo...)" className="w-full bg-white/5 p-4 rounded-xl text-[11px] mb-4 border border-white/5 h-24 outline-none focus:border-orange-500/50 text-white" onChange={e => setAnalystNotes(e.target.value)} />
        
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] uppercase font-bold text-gray-400">Spreads de Mercado</span>
            <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-orange-500 hover:scale-110"><Plus size={18}/></button>
          </div>
          {handicaps.map((h, i) => (
            <div key={i} className="bg-white/5 p-3 rounded-xl mb-2 border border-white/5 animate-in slide-in-from-right-2">
              <select value={h.team} onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="w-full bg-transparent text-[10px] text-orange-500 font-bold mb-2 outline-none">
                <option value="home">Spread LOCAL</option>
                <option value="away">Spread VISITANTE</option>
              </select>
              <div className="flex gap-2">
                <input placeholder="Línea (-5.5)" className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white font-mono" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white font-mono" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900 px-1"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          <button onClick={runNbaAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] mt-4 shadow-lg hover:bg-orange-500 transition-all">
            {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
          </button>
        </div>
      </div>

      {/* 3. RESULTADOS NBA */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="animate-in zoom-in-95 space-y-4">
            <div className="glass-card p-6 border-l-4 border-orange-500 bg-orange-500/5">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Matriz de Ventaja (Points Edge)</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2">
                  <div>
                    <div className={`text-[10px] font-bold uppercase ${r.edge > 1.5 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {r.team} [{r.line}]
                    </div>
                    <div className="text-[9px] text-gray-600 uppercase mt-1">Cuota: {r.odds}</div>
                  </div>
                  <div className={`text-3xl font-black ${r.edge > 1.5 ? 'text-orange-400' : 'text-white'}`}>{r.edge}</div>
                </div>
              ))}
            </div>
            <button onClick={copyNbaSuperPrompt} className="w-full bg-blue-600 border border-blue-500/40 p-5 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              <ClipboardCheck size={18} /> Copiar Super Prompt NBA
            </button>
          </div>
        ) : (
          <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-20">
            <Activity size={48} className="mb-4 text-gray-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Esperando Parámetros NBA</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default NbaModule;
