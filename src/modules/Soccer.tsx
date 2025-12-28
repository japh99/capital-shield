import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Calendar, Search, Target } from 'lucide-react';
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
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '1.90' }]);
  const [results, setResults] = useState<any[]>([]);

  const fetchMatches = async (leagueId: string, dateStr: string) => {
    if (!leagueId) return;
    setLoading(true);
    setMatches([]);
    
    try {
      const apiKey = CONFIG.ODDS_API_KEY;
      if (!apiKey) throw new Error("No hay API KEY");

      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { apiKey, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });

      // Filtro por fecha elegida
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
      
    } catch (e: any) {
      alert(`Error de Conexión: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLeague) fetchMatches(selectedLeague, selectedDate);
  }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos de ELO o Partido.");
    const analysisResults = await Promise.all(handicaps.map(async (h) => {
      const adjustedLine = h.team === 'home' ? h.line : (parseFloat(h.line) * -1).toString();
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'soccer', h_rating: eloH, a_rating: eloA, line: adjustedLine
      });
      return { ...h, ...resp.data };
    }));
    setResults(analysisResults);
  };

  const copyPrompt = () => {
    const prompt = `### CAPITAL SHIELD ANALYTICS ###\nEvento: ${selectedMatch.home_team} vs ${selectedMatch.away_team}\nELO: ${eloH} vs ${eloA}\n\nInvestiga H2H, bajas por lesiones y motivación para validar este EDGE de ${results[0]?.edge}.`;
    navigator.clipboard.writeText(prompt);
    alert("Prompt Copiado");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL BUSQUEDA */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-2 mb-6 text-emerald-500">
            <Search size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Búsqueda de Eventos</h3>
          </div>
          <div className="space-y-4 mb-6 text-white">
            <select 
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-emerald-500"
            >
              <option value="">-- Seleccionar Liga --</option>
              {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-emerald-500 text-white scheme-dark"
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <div className="text-center py-10 animate-pulse text-[10px] text-emerald-500 uppercase tracking-widest">Sincronizando...</div> : 
              matches.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="font-black text-[10px] text-white uppercase">{m.home_team} vs {m.away_team}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{new Date(m.commence_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* PANEL CONFIG */}
        <div className="glass-card p-6 border-t-4 border-emerald-600">
          <div className="flex items-center gap-2 mb-6 text-emerald-500 font-bold uppercase text-[10px] tracking-widest">
            <Target size={16} /> Configuración de Análisis
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="ELO Local" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloH(e.target.value)} />
              <input type="number" placeholder="ELO Visita" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloA(e.target.value)} />
            </div>
            {handicaps.map((h, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                <select 
                   className="w-full bg-transparent text-[10px] text-emerald-500 outline-none font-bold"
                   onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }}
                >
                    <option value="home">LOCAL</option>
                    <option value="away">VISITANTE</option>
                </select>
                <div className="flex gap-2">
                  <input placeholder="Línea" className="flex-1 bg-black border border-white/10 p-2 rounded text-[11px] text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                  <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-[11px] text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                </div>
              </div>
            ))}
            <button onClick={runFullAnalysis} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all">Procesar Matriz</button>
          </div>
        </div>

        {/* PANEL RESULTADOS */}
        <div className="space-y-6">
          {results.length > 0 && (
            <div className="space-y-4 animate-in zoom-in-95">
              <div className="glass-card p-6 border-l-4 border-emerald-500">
                <h3 className="text-[9px] font-bold text-gray-500 uppercase mb-4 tracking-widest">Edge Detectado</h3>
                {results.map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{r.team} [{r.line}]</span>
                    <span className="text-3xl font-black text-white">{r.edge}</span>
                  </div>
                ))}
              </div>
              <button onClick={copyPrompt} className="w-full bg-blue-600/20 border border-blue-500/40 p-4 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-widest">Copiar Prompt IA</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoccerModule;
