import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, MessageSquare } from 'lucide-react';
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
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '1.90' }]);
  const [results, setResults] = useState<any[]>([]);

  // TRADUCTOR INTELIGENTE DE HÁNDICAPS
  const parseHandicap = (input: string): number => {
    let clean = input.replace(/\s+/g, '').replace('+', '');
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
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
    } catch (e) { alert("Error de API. Revisa las llaves en Vercel."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague, selectedDate); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Selecciona partido e ingresa ELOs.");
    setIsAnalyzing(true);
    setResults([]); // Limpiar resultados previos

    try {
      const analysisResults = await Promise.all(handicaps.map(async (h) => {
        const numericLine = parseHandicap(h.line);
        if (isNaN(numericLine)) throw new Error(`Línea inválida: ${h.line}`);

        const adjustedLine = h.team === 'home' ? numericLine : (numericLine * -1);
        
        const resp = await axios.post(CONFIG.API_BACKEND, {
          sport: 'soccer',
          h_rating: parseFloat(eloH),
          a_rating: parseFloat(eloA),
          line: adjustedLine
        });
        return { ...h, ...resp.data };
      }));
      setResults(analysisResults);
    } catch (e: any) {
      alert(e.message || "Error en el cálculo matemático.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copySuperPrompt = () => {
    const prompt = `
### REPORTE TÉCNICO: CAPITAL SHIELD ###
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**ELO:** Local ${eloH} | Visita ${eloA}
**VENTAJA MATEMÁTICA:**
${results.map(r => `- ${r.team.toUpperCase()} [${r.line}] @ ${r.odds}: EDGE ${r.edge}`).join('\n')}

**MISIÓN IA:**
Analiza H2H, bajas por lesión de última hora y motivación (¿se juegan algo?). 
Notas del analista: ${analystNotes || 'Ninguna'}.
¿El EDGE matemático se justifica con la realidad?
    `;
    navigator.clipboard.writeText(prompt);
    alert("Prompt Copiado");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      {/* PANEL 1: MERCADO */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest">1. Selección</h3>
        <select onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-4">
          <option value="">Competición...</option>
          {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-6" />
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {matches.map(m => (
            <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-3 rounded-xl text-[10px] ${selectedMatch?.id === m.id ? 'bg-emerald-500/20 border-emerald-500/50 border' : 'bg-white/5'}`}>
              {m.home_team} vs {m.away_team}
            </button>
          ))}
        </div>
      </div>

      {/* PANEL 2: CONFIGURACIÓN */}
      <div className="glass-card p-6 border-t-4 border-emerald-600">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest">2. Inteligencia</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input type="number" placeholder="ELO Home" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloH(e.target.value)} />
          <input type="number" placeholder="ELO Away" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloA(e.target.value)} />
        </div>
        <textarea placeholder="Notas (lesiones, clima...)" className="w-full bg-white/5 p-3 rounded-xl text-[11px] mb-4 border border-white/5 h-16" onChange={e => setAnalystNotes(e.target.value)} />
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] uppercase font-bold text-gray-400">Hándicaps</span>
            <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500"><Plus size={16}/></button>
          </div>
          {handicaps.map((h, i) => (
            <div key={i} className="bg-white/5 p-3 rounded-xl mb-2 border border-white/5">
              <select onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="w-full bg-transparent text-[10px] text-emerald-500 font-bold mb-1 outline-none">
                <option value="home">Hándicap Local</option>
                <option value="away">Hándicap Visitante</option>
              </select>
              <div className="flex gap-2">
                <input placeholder="0/-0.5" className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-4">
            {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
          </button>
        </div>
      </div>

      {/* PANEL 3: RESULTADOS */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Matriz de Resultados</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{r.team} [{r.line}]</span>
                  <span className="text-3xl font-black text-white">{r.edge}</span>
                </div>
              ))}
            </div>
            <button onClick={copySuperPrompt} className="w-full bg-blue-600/20 border border-blue-500/40 p-5 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-widest shadow-lg">
              COPIAR SÚPER PROMPT
            </button>
          </div>
        ) : (
          <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center opacity-20 border-dashed border-white/10">
            <Trophy size={48} className="mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Configuración pendiente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoccerModule;
