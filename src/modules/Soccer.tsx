import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Copy, RefreshCw, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [handicaps, setHandicaps] = useState<string[]>(['']);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addHandicap = () => setHandicaps([...handicaps, '']);
  const removeHandicap = (index: number) => setHandicaps(handicaps.filter((_, i) => i !== index));
  const updateHandicap = (index: number, val: string) => {
    const newH = [...handicaps];
    newH[index] = val;
    setHandicaps(newH);
  };

  const fetchMatches = async (league: string) => {
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${league}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h' }
      });
      setMatches(resp.data.slice(0, 15));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const runFullAnalysis = async () => {
    const analysisResults = await Promise.all(handicaps.map(async (line) => {
      const resp = await axios.post(CONFIG.API_BACKEND, {
        sport: 'soccer', h_rating: eloH, a_rating: eloA, line: line
      });
      return { line, ...resp.data };
    }));
    setResults(analysisResults);
  };

  const copyDetailedPrompt = () => {
    const prompt = `
### SOLICITUD DE ANÁLISIS ESTRATÉGICO - CAPITAL SHIELD ###
**Evento:** ${selectedMatch?.home_team} vs ${selectedMatch?.away_team}
**Data ELO:** Local ${eloH} | Visitante ${eloA}
**Proyección Matemática:** ${results[0]?.expected_margin} goles de ventaja.

**Líneas de Mercado Analizadas:**
${results.map(r => `- Línea ${r.line}: Edge de ${r.edge}`).join('\n')}

**INSTRUCCIONES PARA LA IA:**
Actúa como un experto en Betting especializado en ligas de fútbol profesional. Tu tarea es realizar un análisis cualitativo profundo que valide o refute mi ventaja matemática.

1. **H2H Histórico:** Analiza los últimos 5 enfrentamientos. ¿Hay algún patrón táctico donde el equipo inferior complique al superior?
2. **Reporte de Lesiones (Squad Report):** Busca noticias de las últimas 24h. ¿Juegan los goleadores clave? ¿Hay bajas en la defensa central?
3. **Fuerza de Localía/Visitante:** Analiza el rendimiento reciente en casa de ${selectedMatch?.home_team} y fuera de ${selectedMatch?.away_team}.
4. **Factores Externos:** Clima (viento/lluvia), estado del césped, arbitraje asignado y carga de partidos (¿vienen de jugar Copa?).
5. **Alineaciones Probables:** Proyecta el sistema táctico (ej. 4-3-3 vs 5-4-1).

**CONCLUSIÓN FINAL:** Basado en estos factores cualitativos, ¿recomiendas tomar la línea de hándicap con mayor EDGE o existen riesgos ocultos? Justifica tu respuesta.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Profesional Copiado!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* LIGAS */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-bold text-emerald-500 uppercase mb-4 tracking-widest">1. Selección de Liga</h3>
            <select onChange={(e) => fetchMatches(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm">
              <option>Seleccionar...</option>
              {CONFIG.LEAGUES.SOCCER.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
              {matches.map(m => (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-2 rounded text-[10px] ${selectedMatch?.id === m.id ? 'bg-emerald-500/20' : 'hover:bg-white/5'}`}>
                  {m.home_team} vs {m.away_team}
                </button>
              ))}
            </div>
          </div>

          {/* ELO INPUT */}
          <div className="glass-card p-6 border-t-2 border-emerald-500">
            <h3 className="text-xs font-bold text-emerald-500 uppercase mb-4 tracking-widest">2. Ratings ELO</h3>
            <input placeholder={`ELO ${selectedMatch?.home_team || 'Local'}`} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg mb-4 text-sm" onChange={e => setEloH(e.target.value)} />
            <input placeholder={`ELO ${selectedMatch?.away_team || 'Visita'}`} className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" onChange={e => setEloA(e.target.value)} />
          </div>

          {/* HANDICAPS MULTIPLES */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">3. Líneas de Hándicap</h3>
              <button onClick={addHandicap} className="text-emerald-500 p-1 hover:bg-emerald-500/10 rounded"><Plus size={16} /></button>
            </div>
            {handicaps.map((h, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={h} onChange={(e) => updateHandicap(i, e.target.value)} placeholder="Línea ej: -0.75" className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-xs" />
                <button onClick={() => removeHandicap(i)} className="text-red-500 opacity-50 hover:opacity-100"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={runFullAnalysis} className="w-full bg-emerald-600 p-3 rounded-lg font-bold mt-4 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
              <Zap size={16} fill="currentColor" /> ANALIZAR TODO
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE RESULTADOS */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
          <div className="glass-card p-8 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-6">Matriz de Ventaja (Edge)</h3>
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-gray-400 font-mono">Línea: {res.line}</span>
                  <span className={`text-2xl font-black ${res.edge > 0.5 ? 'text-emerald-400' : 'text-white'}`}>{res.edge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 border-dashed border-white/10">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Inteligencia Artificial</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              He generado un reporte técnico con los datos matemáticos. Cópialo y pégalo en una IA externa para investigar factores de última hora.
            </p>
            <button onClick={copyDetailedPrompt} className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/50 p-4 rounded-xl font-bold hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em]">
              <Copy size={18} /> Copiar Prompt Estratégico
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoccerModule;
