import React, { useState, useEffect } from 'react';
import { Activity, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, ClipboardCheck, Clock } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Estado de líneas corregido: Tipo (Over/Under), Valor numérico y Cuota
  const [ouLines, setOuLines] = useState<any[]>([
    { type: 'over', value: '225.5', odds: '1.90' }
  ]);
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
    if (!projTotal || !selectedMatch) return alert("Ingresa la proyección de Dunkel y selecciona un partido.");
    setIsAnalyzing(true);
    try {
      const analysisResults = await Promise.all(ouLines.map(async (l) => {
        const lineNum = parseFloat(l.value);
        // Si el usuario elige UNDER, el EDGE se calcula al revés (Línea - Proyección)
        // Si elige OVER, es (Proyección - Línea)
        const resp = await axios.post(CONFIG.API_BACKEND, { 
          h_rating: projTotal, 
          line: lineNum, 
          sport: 'nba_ou' 
        });

        const rawEdge = l.type === 'over' ? resp.data.edge : (lineNum - parseFloat(projTotal));
        
        return { ...l, edge: Math.round(rawEdge * 100) / 100, expected: resp.data.expected_total };
      }));
      setResults(analysisResults);
    } catch (e) { alert("Error en el cálculo matemático. Asegúrate de usar solo números."); }
    finally { setIsAnalyzing(false); }
  };

  const copySuperPrompt = () => {
    const prompt = `
# 🛡️ AUDITORÍA NBA TOTALES (O/U): CAPITAL SHIELD
**EVENTO:** ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**PROYECCIÓN DUNKEL:** ${projTotal} puntos.

## 📊 ANÁLISIS DE MERCADO (MATRIZ DE VALOR):
${results.map(r => `  * APUESTA: ${r.type.toUpperCase()} [${r.value}] | CUOTA: ${r.odds} -> EDGE: ${r.edge} puntos`).join('\n')}

## 🧠 MISIÓN DE INVESTIGACIÓN IA:
Actúa como experto en NBA. Investiga para Colombia Time (GMT-5):
1. **LESIONES:** ¿Hay reportes de última hora para ${selectedMatch.home_team} o ${selectedMatch.away_team}?
2. **CANSANCIO:** ¿Alguno viene de jugar ayer (Back-to-Back)?
3. **RITMO:** ¿El enfrentamiento histórico sugiere un juego rápido o lento?
4. **NOTAS:** "${analystNotes}"

**VERDICTO:** Compara las líneas. ¿Cuál tiene mejor valor? ¿El OVER o el UNDER? Justifica.
    `;
    navigator.clipboard.writeText(prompt);
    alert("¡Prompt Maestro Copiado!");
  };

  // Función para convertir hora a Colombia
  const getColombiaTime = (utcDate: string) => {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* PANEL 1: JORNADA */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-[10px] font-bold text-orange-500 uppercase mb-4 tracking-widest flex items-center gap-2"><Search size={14}/> 1. NBA Radar</h3>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white mb-6 scheme-dark" />
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? <p className="text-center py-10 text-[10px] animate-pulse uppercase">Sincronizando...</p> : 
            matches.map(m => (
              <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <div className="font-black text-[10px] text-white uppercase">{m.home_team} @ {m.away_team}</div>
                <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-2 font-mono">
                   <Clock size={10} /> {getColombiaTime(m.commence_time)} (COL)
                </div>
              </button>
            ))
          }
        </div>
      </div>

      {/* PANEL 2: CONFIGURACIÓN */}
      <div className="glass-card p-6 border-t-4 border-orange-600 bg-gradient-to-b from-orange-600/5 to-transparent">
        <h3 className="text-[10px] font-bold text-orange-500 uppercase mb-4 tracking-widest text-center">2. Proyección y Mercado</h3>
        <input type="number" placeholder="Total Dunkel (Ej: 232.5)" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm text-white mb-4 outline-none focus:border-orange-500" onChange={e => setProjTotal(e.target.value)} />
        <textarea placeholder="Observaciones (Lesiones, ritmo...)" className="w-full bg-white/5 p-4 rounded-xl text-[11px] mb-4 border border-white/5 h-20 outline-none focus:border-orange-500/50 text-white" onChange={e => setAnalystNotes(e.target.value)} />
        
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] uppercase font-bold text-gray-400">Matriz de Líneas</span>
            <button onClick={() => setOuLines([...ouLines, { type: 'over', value: '', odds: '' }])} className="text-orange-500 hover:scale-110 transition-all"><Plus size={18}/></button>
          </div>
          
          {ouLines.map((l, i) => (
            <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 mb-3 space-y-2 animate-in slide-in-from-right-2">
              <select 
                value={l.type} 
                onChange={(e) => { const n = [...ouLines]; n[i].type = e.target.value; setOuLines(n); }}
                className="w-full bg-transparent text-[10px] text-orange-500 font-bold uppercase outline-none"
              >
                <option value="over">OVER (Altas)</option>
                <option value="under">UNDER (Bajas)</option>
              </select>
              <div className="flex gap-2">
                <input placeholder="Línea" value={l.value} className="flex-1 bg-black border border-white/10 p-2 rounded text-xs text-white font-mono" onChange={(e) => { const n = [...ouLines]; n[i].value = e.target.value; setOuLines(n); }} />
                <input placeholder="Cuota" value={l.odds} className="w-16 bg-black border border-white/10 p-2 rounded text-xs text-white font-mono" onChange={(e) => { const n = [...ouLines]; n[i].odds = e.target.value; setOuLines(n); }} />
                <button onClick={() => setOuLines(ouLines.filter((_, idx) => idx !== i))} className="text-red-900"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          <button onClick={runTotalsAnalysis} disabled={isAnalyzing} className="w-full bg-orange-600 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-4 shadow-xl hover:bg-orange-500 transition-all">
            {isAnalyzing ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
          </button>
        </div>
      </div>

      {/* PANEL 3: RESULTADOS */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="animate-in zoom-in-95 space-y-4">
            <div className="glass-card p-6 border-l-4 border-orange-500 bg-orange-500/5">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Diferencial de Valor</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 mb-2 transition-all hover:border-white/20">
                  <div>
                    <div className={`text-[10px] font-bold uppercase ${Math.abs(r.edge) > 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {r.type} [{r.value}]
                    </div>
                    <div className="text-[9px] text-gray-600 mt-1 uppercase">Cuota: {r.odds}</div>
                  </div>
                  <div className={`text-3xl font-black ${Math.abs(r.edge) > 3 ? 'text-orange-400' : 'text-white'}`}>{r.edge}</div>
                </div>
              ))}
            </div>
            <button onClick={copySuperPrompt} className="w-full bg-blue-600 border border-blue-500/40 p-5 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              <ClipboardCheck size={18} /> Copiar Reporte Estratégico
            </button>
          </div>
        ) : (
          <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 opacity-20">
            <Activity size={48} className="mb-4 text-gray-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Ingrese parámetros para<br/>evaluar el mercado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NbaModule;
