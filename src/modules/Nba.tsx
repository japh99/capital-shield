import React, { useState, useEffect } from 'react';
import { Activity, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, ClipboardCheck } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [projTotal, setProjTotal] = useState(''); // Proyección de Dunkel
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Líneas de Over/Under
  const [ouLines, setOuLines] = useState<any[]>([{ line: '225.5', odds: '1.90' }]);
  const [results, setResults] = useState<any[]>([]);

  const fetchNbaMatches = async (dateStr: string) => {
    setLoading(true);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'totals', dateFormat: 'iso' }
      });
      setMatches(resp.data.filter((m: any) => m.commence_time.startsWith(dateStr)));
    } catch (e) { alert("Error de API. Revisa tus llaves."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(selectedDate); }, [selectedDate]);

  const runTotalsAnalysis = async () => {
    if (!projTotal || !selectedMatch) return alert("Ingresa la proyección total y selecciona un partido.");
    setIsAnalyzing(true);
    try {
      const analysisResults = await Promise.all(ouLines.map(async (l) => {
        const resp = await axios.post(CONFIG.API_BACKEND, { 
          h_rating: projTotal, 
          line: l.line, 
          sport: 'nba_ou' 
        });
        return { ...l, ...resp.data };
      }));
      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo."); }
    finally { setIsAnalyzing(false); }
  };

  const copySuperPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA NBA TOTALES (OVER/UNDER): CAPITAL SHIELD
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**PROYECCIÓN MATEMÁTICA:** ${projTotal} puntos totales.

## 📊 ANÁLISIS DE MERCADO (EDGE):
${results.map(r => `  * LÍNEA O/U: [${r.line}] @ ${r.odds} -> EDGE: ${r.edge} puntos (${r.edge > 0 ? 'Tendencia OVER' : 'Tendencia UNDER'})`).join('\n')}

## 🧠 MISIÓN DE INVESTIGACIÓN IA:
Actúa como un experto en análisis de ritmo (Pace) y eficiencia de la NBA:
1. **RITMO DE JUEGO (Pace):** ¿Cómo ha sido el promedio de posesiones de ambos en los últimos 3 juegos? ¿Hay lesionados que afecten la velocidad del juego?
2. **EFICIENCIA DE TIRO:** ¿Faltan tiradores de 3 puntos clave o defensores perimetrales élite?
3. **CANSANCIO:** ¿Es un partido de alta anotación histórica o vienen de jugar anoche (piernas cansadas = menos puntos)?
4. **NOTAS:** "${analystNotes || 'Sin notas'}"

**VERDICTO:** Basado en el EDGE de ${results[0]?.edge}, ¿recomiendas el OVER o el UNDER? Justifica con noticias de última hora.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt de Totales Copiado!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* PANEL 1 */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-[10px] font-bold text-orange-500 uppercase mb-4 tracking-widest flex items-center gap-2"><Search size={14}/> 1. Jornada NBA</h3>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-6 scheme-dark" />
        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? <p className="text-center py-10 text-[10px] animate-pulse">Sincronizando...</p> : 
            matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <div className="font-black text-[10px] text-white uppercase">{m.home_team} @ {m.away_team}</div>
              </button>
            ))
          }
        </div>
      </div>

      {/* PANEL 2 */}
      <div className="glass-card p-6 border-t-4 border-orange-600 bg-gradient-to-b from-orange-600/5 to-transparent">
        <h3 className="text-[10px] font-bold text-orange-500 uppercase mb-4 tracking-widest text-center">2. Proyección de Puntos</h3>
        <input 
          type="number" 
          placeholder="Total Proyectado (Ej: 232.5)" 
          className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm text-white mb-4 outline-none focus:border-orange-500" 
          onChange={e => setProjTotal(e.target.value)} 
        />
        <textarea placeholder="Notas (Ritmo, Lesiones, B2B...)" className="w-full bg-white/5 p-4 rounded-xl text-[11px] mb-4 border border-white/5 h-24 outline-none focus:border-orange-500/50" onChange={e => setAnalystNotes(e.target.value)} />
        
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] uppercase font-bold text-gray-400">Líneas O/U Vegas</span>
            <button onClick={() => setOuLines([...ouLines, { line: '', odds: '' }])} className="text-orange-500"><Plus size={18}/></button>
          </div>
          {ouLines.map((l, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Línea 220.5" className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...ouLines]; n[i].line = e.target.value; setOuLines(n); }} />
              <input placeholder="Cuota" className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
              <button onClick={() => setOuLines(ouLines.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={16}/></button>
            </div>
          ))}
          <button onClick={runTotalsAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-4 shadow-lg hover:bg-orange-500 transition-all">
            {isAnalyzing ? 'PROCESANDO...' : 'ANALIZAR OVER/UNDER'}
          </button>
        </div>
      </div>

      {/* PANEL 3 */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="animate-in zoom-in-95 space-y-4">
            <div className="glass-card p-6 border-l-4 border-orange-500 bg-orange-500/5">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase mb-4 tracking-widest text-center">Matriz de Totales</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2">
                  <div>
                    <div className={`text-[10px] font-bold uppercase ${Math.abs(r.edge) > 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {r.edge > 0 ? 'OVER' : 'UNDER'} [{r.line}]
                    </div>
                    <div className="text-[9px] text-gray-600">Cuota: {r.odds}</div>
                  </div>
                  <div className={`text-3xl font-black ${Math.abs(r.edge) > 3 ? 'text-orange-400' : 'text-white'}`}>{r.edge}</div>
                </div>
              ))}
            </div>
            <button onClick={copySuperPrompt} className="w-full bg-blue-600 border border-blue-500/40 p-5 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              <ClipboardCheck size={18} /> Copiar Prompt Totales
            </button>
          </div>
        ) : (
          <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center opacity-20 border-dashed border-white/10">
            <Activity size={48} className="mb-4 text-gray-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Ingrese Proyección Total</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NbaModule;
