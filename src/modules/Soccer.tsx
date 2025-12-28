import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Calendar, Search, Target, AlertCircle } from 'lucide-react';
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
      // Usamos la API KEY generada en el config
      const apiKey = CONFIG.ODDS_API_KEY;
      
      if (!apiKey) {
        alert("Error: No hay API KEY cargada. Revisa Vercel.");
        setLoading(false);
        return;
      }

      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${leagueId}/odds`, {
        params: { 
          apiKey: apiKey, 
          regions: 'eu', 
          markets: 'h2h',
          dateFormat: 'iso' 
        }
      });

      // Filtrar partidos por la fecha elegida en el calendario
      const filtered = resp.data.filter((m: any) => m.commence_time.startsWith(dateStr));
      setMatches(filtered);
      
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message;
      alert(`Error de API: ${errorMsg}. Verifica que las llaves en Vercel no tengan comillas ni corchetes.`);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para buscar automáticamente cuando cambie la fecha o la liga
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL 1: BÚSQUEDA */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-2 mb-6 text-emerald-500">
            <Search size={16} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Filtros de Búsqueda</h3>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[9px] text-gray-500 uppercase mb-1 block">Competición</label>
              <select 
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-emerald-500 text-white"
              >
                <option value="">-- Seleccionar Liga --</option>
                {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase mb-1 block">Fecha del Evento</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-emerald-500 text-white scheme-dark font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <div className="text-center py-10 animate-pulse text-[10px] text-emerald-500 uppercase italic tracking-widest">Sincronizando...</div> : 
              matches.length > 0 ? matches.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="font-black text-[10px] text-white uppercase">{m.home_team} vs {m.away_team}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{new Date(m.commence_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </button>
              )) : selectedLeague && <p className="text-center text-[10px] text-gray-600 py-10 uppercase tracking-widest">No hay partidos para esta fecha</p>
            }
          </div>
        </div>

        {/* PANEL 2: ANALISIS */}
        <div className="glass-card p-6 border-t-4 border-emerald-600">
          <div className="flex items-center gap-2 mb-6 text-emerald-500 font-bold uppercase text-[10px] tracking-widest">
            <Target size={16} /> Configuración de Análisis
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="ELO Home" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloH(e.target.value)} />
              <input type="number" placeholder="ELO Away" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white" onChange={e => setEloA(e.target.value)} />
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-[0.2em]">Hándicaps</span>
                <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500"><Plus size={16}/></button>
              </div>
              
              {handicaps.map((h, i) => (
                <div key={i} className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5 mb-3">
                  <select 
                    value={h.team} 
                    onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }}
                    className="w-full bg-transparent border-none text-[10px] rounded uppercase font-bold text-emerald-500 outline-none"
                  >
                    <option value="home">LOCAL</option>
                    <option value="away">VISITANTE</option>
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Línea" value={h.line} className="flex-1 bg-black border border-white/10 p-2 rounded text-[11px] font-mono text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                    <input placeholder="Cuota" value={h.odds} className="w-20 bg-black border border-white/10 p-2 rounded text-[11px] font-mono text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                    <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={runFullAnalysis} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
              <Zap size={18} fill="currentColor" /> Procesar Matriz
            </button>
          </div>
        </div>

        {/* PANEL 3: RESULTADOS */}
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="space-y-4 animate-in zoom-in-95">
              <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
                <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4 tracking-[0.2em]">Edge Detectado</h3>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                      <div>
                        <div className={`text-[10px] font-bold uppercase ${r.team === 'home' ? 'text-emerald-500' : 'text-blue-500'}`}>
                          {r.team === 'home' ? 'Local' : 'Visitante'} [{r.line}]
                        </div>
                        <div className="text-[9px] text-gray-500 mt-1">Cuota: {r.odds}</div>
                      </div>
                      <div className={`text-3xl font-black ${r.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-30">
              <AlertCircle size={48} className="mb-4 text-gray-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Configure liga y fecha<br/>para comenzar</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
