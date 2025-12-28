import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '1.90' }]);
  const [results, setResults] = useState<any[]>([]);

  const fetchMatches = async (leagueId: string, dateStr: string) => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
    } catch (e) { alert("Error de API. Verifica tus llaves en Vercel."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague, selectedDate); }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos.");
    setIsAnalyzing(true);
    try {
      const analysisResults = await Promise.all(handicaps.map(async (h) => {
        const adjustedLine = h.team === 'home' ? h.line : (parseFloat(h.line) * -1).toString();
        const resp = await axios.post(CONFIG.API_BACKEND, {
          sport: 'soccer', h_rating: eloH, a_rating: eloA, line: adjustedLine
        });
        return { ...h, ...resp.data };
      }));
      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo matemático."); }
    finally { setIsAnalyzing(false); }
  };

  const copyPromptMaestro = () => {
    const prompt = `### INFORME ESTRATÉGICO CAPITAL SHIELD ###
EVENTO: ${selectedMatch.home_team} vs ${selectedMatch.away_team}
DATA ELO: Local ${eloH} | Visitante ${eloA}
VENTAJA MATEMÁTICA DETECTADA:
${results.map(r => `- LÍNEA ${r.team.toUpperCase()} [${r.line}] @ ${r.odds}: EDGE de ${r.edge}`).join('\n')}

TAREA DE INVESTIGACIÓN PARA IA:
1. Analiza el H2H de los últimos 2 años.
2. Busca lesiones confirmadas de última hora (Porteros y Delanteros).
3. Fuerza de Localía: Rendimiento del local en casa vs rendimiento del visita fuera.
4. Motivación: ¿Es un derbi, se juegan descenso, o rotan por jugar Copa?
5. Clima: ¿Afecta el viento o lluvia al promedio de goles?

CONCLUSIÓN: ¿Basado en el EDGE de ${results[0]?.edge}, es una apuesta segura o hay riesgos cualitativos?`;
    navigator.clipboard.writeText(prompt);
    alert("Prompt Maestro Copiado");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest">1. Mercado</h3>
        <select onChange={(e) => setSelectedLeague(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-4 outline-none">
          <option value="">Seleccionar Competición...</option>
          {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-6" />
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? <p className="text-center py-10 text-[10px] animate-pulse">Sincronizando...</p> : 
            matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold text-[10px] uppercase text-white">{m.home_team} vs {m.away_team}</p>
              </button>
            ))
          }
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-emerald-600">
        <h3 className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-widest text-center">2. Inteligencia de Datos</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input type="number" placeholder="ELO Home" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloH(e.target.value)} />
          <input type="number" placeholder="ELO Away" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloA(e.target.value)} />
        </div>
        <div className="flex justify-between items-center mb-4 border-t border-white/5 pt-4">
           <span className="text-[9px] text-gray-500 uppercase">Hándicaps + Cuota</span>
           <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500"><Plus size={16}/></button>
        </div>
        {handicaps.map((h, i) => (
          <div key={i} className="bg-white/5 p-3 rounded-xl mb-2 border border-white/5">
            <select onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }} className="w-full bg-transparent text-[10px] text-emerald-500 font-bold mb-2 outline-none">
              <option value="home">Hándicap Local</option>
              <option value="away">Hándicap Visitante</option>
            </select>
            <div className="flex gap-2">
              <input placeholder="Línea" className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
              <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
              <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
        <button onClick={runFullAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-4 hover:bg-emerald-500 transition-all">
          {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
        </button>
      </div>

      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="animate-in zoom-in-95 duration-500 space-y-4">
            <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase mb-4 tracking-widest text-center">Edge Detectado</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{r.team} [{r.line}]</span>
                  <span className="text-3xl font-black text-white">{r.edge}</span>
                </div>
              ))}
            </div>
            <button onClick={copyPromptMaestro} className="w-full bg-blue-600/20 border border-blue-500/40 p-5 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600/40 transition-all shadow-lg">
              COPIAR PROMPT MAESTRO
            </button>
          </div>
        ) : (
          <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center opacity-20 grayscale border-dashed border-white/10">
            <Trophy size={48} className="mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Configuración pendiente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoccerModule;
