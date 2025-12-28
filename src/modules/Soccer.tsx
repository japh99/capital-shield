import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, LayoutGrid } from 'lucide-react';
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
  
  // Hándicaps Múltiples
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
    } catch (e) {
      alert("Error de conexión. Revisa tus API Keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLeague) fetchMatches(selectedLeague, selectedDate);
  }, [selectedDate, selectedLeague]);

  const runFullAnalysis = async () => {
    if (!eloH || !eloA || !selectedMatch) return alert("Faltan datos de ELO o Partido.");
    setLoading(true);
    try {
      const analysisResults = await Promise.all(handicaps.map(async (h) => {
        // Lógica de signo: si es hándicap al visitante, invertimos para el backend
        const adjustedLine = h.team === 'home' ? h.line : (parseFloat(h.line) * -1).toString();
        const resp = await axios.post(CONFIG.API_BACKEND, {
          sport: 'soccer', h_rating: eloH, a_rating: eloA, line: adjustedLine
        });
        return { ...h, ...resp.data };
      }));
      setResults(analysisResults);
    } catch (e) {
      alert("Error en el cálculo matemático.");
    } finally {
      setLoading(false);
    }
  };

  const copyPromptMaestro = () => {
    const prompt = `
### INFORME ESTRATÉGICO CAPITAL SHIELD ###
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**FECHA:** ${selectedDate}
**MODELO:** ELO Proyectado (H:${eloH} | A:${eloA})

**ANÁLISIS DE MERCADO (VENTAJA MATEMÁTICA):**
${results.map(r => `- LÍNEA ${r.team === 'home' ? 'LOCAL' : 'VISITANTE'} [${r.line}] @ ${r.odds}: EDGE de ${r.edge}`).join('\n')}

**MISIÓN PARA LA IA:**
Actúa como un Senior Sports Betting Analyst. Tu objetivo es contrastar esta ventaja matemática con la realidad cualitativa:
1. **Contexto de Competición:** Si es Copa, ¿hay rotaciones previstas? ¿Cuál es la prioridad de los entrenadores?
2. **Estado de Forma y H2H:** Analiza los últimos 3 partidos de cada uno. ¿Hay alguna racha que el ELO no esté capturando?
3. **Bajas Sensibles:** Investiga lesiones de última hora en portería, defensa central y delanteros estrella.
4. **Factor Clima/Campo:** ¿Hay condiciones climáticas que favorezcan el "Under" o compliquen al equipo favorito?
5. **Valor Final:** Con un EDGE máximo de ${Math.max(...results.map(r => r.edge))}, ¿recomiendas la inversión o detectas un "trap" (trampa) en las cuotas?

Justifica tu decisión basándote en si las noticias CONFIRMAN o ANULAN nuestra ventaja proyectada.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Maestro copiado al portapapeles!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: FILTROS (EL BUSCADOR) */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-2 mb-6 text-emerald-500 font-bold uppercase text-[10px] tracking-widest">
            <Search size={16} /> Mercado y Eventos
          </div>
          <div className="space-y-4 mb-6">
            <select 
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 transition-all"
            >
              <option value="">Seleccionar Competición...</option>
              {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white scheme-dark outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? <div className="text-center py-20 animate-pulse text-[10px] text-emerald-500 uppercase">Sincronizando...</div> : 
              matches.length > 0 ? matches.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMatch(m)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMatch?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="font-black text-[10px] text-white uppercase">{m.home_team} vs {m.away_team}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{new Date(m.commence_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </button>
              )) : selectedLeague && <p className="text-center text-[10px] text-gray-600 py-10 uppercase">No hay eventos para hoy</p>
            }
          </div>
        </div>

        {/* COLUMNA 2: EL CEREBRO (INPUTS) */}
        <div className="glass-card p-6 border-t-4 border-emerald-600">
          <div className="flex items-center gap-2 mb-6 text-emerald-500 font-bold uppercase text-[10px] tracking-widest">
            <Target size={16} /> Inteligencia de Datos
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="ELO Local" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-emerald-500" onChange={e => setEloH(e.target.value)} />
              <input type="number" placeholder="ELO Visita" className="bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-emerald-500" onChange={e => setEloA(e.target.value)} />
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest italic">Líneas de Hándicap + Cuota</span>
                <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-emerald-500 hover:scale-110 transition-all"><Plus size={16}/></button>
              </div>
              
              {handicaps.map((h, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 mb-3 space-y-2">
                  <select 
                    value={h.team} 
                    onChange={(e) => { const n = [...handicaps]; n[i].team = e.target.value; setHandicaps(n); }}
                    className="w-full bg-transparent text-[10px] text-emerald-500 font-bold uppercase outline-none"
                  >
                    <option value="home">Hándicap Local</option>
                    <option value="away">Hándicap Visitante</option>
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Línea" value={h.line} className="flex-1 bg-black border border-white/10 p-2 rounded text-[11px] text-white" onChange={(e) => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} />
                    <input placeholder="Cuota" value={h.odds} className="w-20 bg-black border border-white/10 p-2 rounded text-[11px] text-white" onChange={(e) => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} />
                    <button onClick={() => setHandicaps(handicaps.filter((_, idx) => idx !== i))} className="text-red-900 hover:text-red-500"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={runFullAnalysis} className="w-full bg-emerald-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20">
              {loading ? 'Calculando...' : 'Analizar Probabilidades'}
            </button>
          </div>
        </div>

        {/* COLUMNA 3: EL RESULTADO (REPORTE) */}
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="animate-in zoom-in-95 duration-500 space-y-4">
              <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
                <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Matriz de Valoración</h3>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 transition-all hover:border-white/20">
                      <div>
                        <div className={`text-[10px] font-bold uppercase ${r.team === 'home' ? 'text-emerald-500' : 'text-blue-500'}`}>
                          {r.team === 'home' ? 'LOCAL' : 'VISITANTE'} [{r.line}]
                        </div>
                        <div className="text-[9px] text-gray-500 mt-1">CUOTA: {r.odds}</div>
                      </div>
                      <div className={`text-3xl font-black ${r.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{r.edge}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 border-dashed border-blue-500/30 bg-blue-500/5">
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <LayoutGrid size={16} />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Generador de Estrategia</h4>
                </div>
                <button 
                  onClick={copyPromptMaestro}
                  className="w-full bg-blue-600/20 border border-blue-500/40 p-4 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600/40 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Copy size={14} /> Copiar Prompt Maestro
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-30">
              <Trophy size={48} className="mb-4 text-gray-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Configure liga y fecha<br/>para comenzar el análisis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoccerModule;
