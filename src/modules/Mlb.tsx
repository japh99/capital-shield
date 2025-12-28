import React, { useState, useEffect } from 'react';
import { Zap, Activity, Copy, RefreshCw, Plus, Trash2, Search, Target, Circle } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const MlbModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-1.5', odds: '1.90' }]);
  const [results, setResults] = useState<any[]>([]);

  const fetchMatches = async (dateStr: string) => {
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/baseball_mlb/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'spreads', dateFormat: 'iso' }
      });
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(selectedDate); }, [selectedDate]);

  const runAnalysis = async () => {
    if (!ratingH || !ratingA || !selectedMatch) return alert("Faltan datos.");
    setIsAnalyzing(true);
    try {
      const analysisResults = await Promise.all(handicaps.map(async (h) => {
        const lineVal = parseFloat(h.line.replace('+', ''));
        const adjustedLine = h.team === 'home' ? lineVal : (lineVal * -1);
        const resp = await axios.post(CONFIG.API_BACKEND, {
          sport: 'mlb', h_rating: parseFloat(ratingH), a_rating: parseFloat(ratingA), line: adjustedLine
        });
        return { ...h, ...resp.data };
      }));
      setResults(analysisResults);
    } catch (e) { alert("Error matemático"); }
    finally { setIsAnalyzing(false); }
  };

  const copyPrompt = () => {
    const prompt = `### MLB SABERMETRIC REPORT: CAPITAL SHIELD ###
EVENTO: ${selectedMatch.home_team} vs ${selectedMatch.away_team}
RATINGS: Local ${ratingH} | Visita ${ratingA}
VENTAJA MATEMÁTICA:
${results.map(r => `- ${r.team.toUpperCase()} [${r.line}] @ ${r.odds}: EDGE ${r.edge}`).join('\n')}

MISIÓN IA: Investiga Starting Pitchers (abridores), bullpen disponible y el viento en el estadio. Notas: ${analystNotes}`;
    navigator.clipboard.writeText(prompt);
    alert("Prompt MLB Copiado");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-[10px] font-bold text-blue-500 uppercase mb-4 tracking-widest">1. Selección MLB</h3>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-6" />
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {loading ? <p className="text-center py-10 text-[10px]">Sincronizando...</p> : 
            matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-3 rounded-xl text-[10px] ${selectedMatch?.id === m.id ? 'bg-blue-500/20 border-blue-500/50 border' : 'bg-white/5'}`}>
                {m.home_team} vs {m.away_team}
              </button>
            ))
          }
        </div>
      </div>
      <div className="glass-card p-6 border-t-4 border-blue-600">
        <h3 className="text-[10px] font-bold text-blue-500 uppercase mb-4 tracking-widest text-center">2. Sabermetrics</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input type="number" placeholder="ELO Home" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setRatingH(e.target.value)} />
          <input type="number" placeholder="ELO Away" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setRatingA(e.target.value)} />
        </div>
        <textarea placeholder="Notas (pitchers, bullpen, viento...)" className="w-full bg-white/5 p-3 rounded-xl text-[11px] mb-4 border border-white/5 h-16" onChange={e => setAnalystNotes(e.target.value)} />
        <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-blue-500 mb-2 flex items-center gap-1 text-[9px] uppercase font-bold"><Plus size={14}/> Añadir Línea</button>
        {handicaps.map((h, i) => (
          <div key={i} className="bg-white/5 p-3 rounded-xl mb-2 flex gap-2">
            <input placeholder="Run Line" className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
            <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
          </div>
        ))}
        <button onClick={runAnalysis} className="w-full bg-blue-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-4">
          {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
        </button>
      </div>
      <div className="space-y-4">
        {results.length > 0 && (
          <div className="glass-card p-6 border-l-4 border-blue-500 bg-blue-500/5">
            <h3 className="text-[9px] font-bold text-gray-500 mb-4 uppercase">Edge MLB</h3>
            {results.map((r, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl mb-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">{r.team} [{r.line}]</span>
                <span className="text-2xl font-black text-white">{r.edge}</span>
              </div>
            ))}
            <button onClick={copyPrompt} className="w-full bg-blue-600/20 p-4 rounded-xl text-blue-400 font-black text-[10px] mt-4 uppercase">Copiar Prompt MLB</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default MlbModule;
