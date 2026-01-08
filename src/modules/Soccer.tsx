import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Copy, RefreshCw, Plus, Trash2, 
  Search, Target, MessageSquare, ClipboardCheck, 
  Calendar, Clock, Globe2, BarChart3, Hash, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const SoccerModule = () => {
  // --- ESTADOS ---
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}));
  const [eloH, setEloH] = useState('');
  const [eloA, setEloA] = useState('');
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '-0.5', odds: '' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '2.5', odds: '' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  // --- LÓGICA DE APOYO ---
  
  const parseLine = (input: string): number => {
    if (!input) return 0;
    let clean = input.toString().replace(/\s+/g, '').replace('+', '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    return parseFloat(clean) || 0;
  };

  const getColombiaTime = (utcDate: string) => {
    try {
      return new Date(utcDate).toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch (e) { return "N/A"; }
  };

  const extractOdds = (match: any) => {
    if (!match?.bookmakers?.[0]?.markets?.[0]) return "Cuotas no disponibles";
    try {
      return match.bookmakers[0].markets[0].outcomes
        .map((o: any) => `${o.name}: ${o.price}`)
        .join(' | ');
    } catch (e) { return "N/A"; }
  };

  // --- ACCIONES API ---

  const fetchMatches = async () => {
    if (!selectedLeague) return;
    setLoading(true);
    setMatches([]);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/${selectedLeague}/odds`, {
        params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'eu', markets: 'h2h', dateFormat: 'iso' }
      });
      setMatches(resp.data || []);
    } catch (e) { 
      console.error("Error API", e);
      alert("Error conectando con The Odds API. Verifica tu API Key.");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(); }, [selectedLeague]);

  const filteredMatches = matches.filter((m: any) => 
    new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}) === selectedDate
  );

  const runFullAnalysis = async () => {
    if (!selectedMatch || !eloH || !eloA) return alert("Selecciona partido e ingresa ELOs.");
    setIsAnalyzing(true);
    try {
      // Obtener el league_code de la liga seleccionada
      let leagueCode = 'generic';
      CONFIG.LEAGUES.SOCCER.forEach((category: any) => {
        const found = category.leagues.find((l: any) => l.id === selectedLeague);
        if (found) leagueCode = found.league_code;
      });

      const respH = await axios.post(CONFIG.API_BACKEND, { 
        task: 'math', 
        sport: 'soccer', 
        h_rating: eloH, 
        a_rating: eloA, 
        line: 0,
        league: leagueCode  // Enviar código de liga al backend
      });
      const expH = respH.data.expected_value;
      
      setResultsH(handicaps.filter(h => h.line).map(h => ({ 
        ...h, 
        edge: h.team === 'home' ? (expH + parseLine(h.line)) : (parseLine(h.line) - expH), 
        expected: expH 
      })));
      
      if (projTotal) {
        setResultsOU(ouLines.filter(l => l.value).map(l => ({ 
          ...l, 
          edge: l.type === 'over' ? (parseFloat(projTotal) - parseFloat(l.value)) : (parseFloat(l.value) - parseFloat(projTotal)) 
        })));
      }
    } catch (e) { 
      console.error("Error en análisis:", e);
      alert("Error en el cálculo. Verifica que el backend esté funcionando."); 
    }
    finally { setIsAnalyzing(false); }
  };

  // --- GENERADORES DE PROMPTS ---

  // PROMPT 1: RADAR DE SELECCIÓN
  const copyRadarPrompt = () => {
    if (filteredMatches.length === 0) return alert("No hay partidos en esta fecha para escanear.");
    const list = filteredMatches.map(m => `- ${m.home_team} vs ${m.away_team} (Cuotas: ${extractOdds(m)})`).join('\n');
    const prompt = `Eres un Quant Trader Forense de Fútbol. PROHIBIDO inventar datos.

**EVENTOS DISPONIBLES HOY:**
${list}

**PROTOCOLO DE SELECCIÓN:**
1. Busca en web REAL: Últimos 5 H2H, lesiones confirmadas HOY, clima actual del estadio.
2. Identifica 3 partidos donde las cuotas NO reflejen:
   - Bajas recientes confirmadas (estrella lesionada hace <24h)
   - Motivación extrema (descenso, clasificación europea)
   - Condiciones climáticas adversas (lluvia intensa, viento >40km/h)
   - Rotaciones por competiciones intercontinentales

**FORMATO OBLIGATORIO:**
Para cada partido:
- FUENTE VERIFICABLE (link o medio confiable)
- INEFICIENCIA DETECTADA (cuota debería ser X pero es Y)
- EDGE ESTIMADO (%)

Si no encuentras datos REALES verificables, responde "INFORMACIÓN INSUFICIENTE".`;
    navigator.clipboard.writeText(prompt);
    alert("✅ Lista para Radar copiada. Pégala en tu IA para filtrar los mejores partidos.");
  };

  // PROMPT 2: VEREDICTO MAESTRO
  const copyMasterPrompt = () => {
    if (!selectedMatch) return alert("Selecciona un partido primero.");
    
    // Obtener nombre de la competición
    let competitionName = 'Competición Desconocida';
    CONFIG.LEAGUES.SOCCER.forEach((category: any) => {
      const found = category.leagues.find((l: any) => l.id === selectedLeague);
      if (found) competitionName = found.name;
    });

    const prompt = `# 🛡️ AUDITORÍA DE INVERSIÓN CAPITAL SHIELD
## ${selectedMatch.home_team} vs ${selectedMatch.away_team}
**Competición:** ${competitionName}
**Hora (Colombia):** ${getColombiaTime(selectedMatch.commence_time)}

---

### 📊 DATOS DE MERCADO
**Cuotas API:** ${extractOdds(selectedMatch)}

### 🔢 ANÁLISIS CUANTITATIVO
**Matemática ELO:** Margen proyectado ${resultsH[0]?.expected || 'N/A'} goles.
**Total Proyectado:** ${projTotal || 'No especificado'} goles.

**Matriz Hándicaps:**
${resultsH.map(r => `- ${r.team.toUpperCase()} ${r.line} @ ${r.odds || 'N/A'} → Edge: ${r.edge > 0 ? '+' : ''}${r.edge.toFixed(2)} goles`).join('\n') || 'Sin datos'}

**Matriz Totales:**
${resultsOU.map(r => `- ${r.type.toUpperCase()} ${r.value} @ ${r.odds || 'N/A'} → Edge: ${r.edge > 0 ? '+' : ''}${r.edge.toFixed(2)} goles`).join('\n') || 'Sin datos'}

### 📝 NOTAS DEL ANALISTA
${analystNotes || 'Ninguna observación adicional'}

---

### 🎯 MISIÓN PARA IA (INVESTIGACIÓN PROFUNDA)
Investiga en fuentes REALES y verificables:

**CHECKLIST DE VALIDACIÓN (Responde CADA punto con fuente):**
□ ¿Hay lesiones/suspensiones de última hora no reflejadas en cuotas?
□ ¿Algún equipo jugó hace <72h un partido de alta intensidad?
□ ¿Rotaciones confirmadas por competiciones internacionales esta semana?
□ ¿El clima actual difiere del pronóstico original? (lluvia, viento, calor extremo)
□ ¿Hay motivación extra? (Derby, venganza, descenso, clasificación)
□ ¿Las cuotas se movieron >5% en las últimas 4 horas? ¿Por qué?
□ ¿Historial H2H reciente favorece claramente a uno? (últimos 5 partidos)

### 🔍 ANÁLISIS TÁCTICO REQUERIDO
- **Starting XI confirmado** (ambos equipos)
- **Sistema táctico probable** (4-3-3, 5-4-1, etc.)
- **Tiros a puerta promedio** últimos 5 partidos
- **Estado del césped** del estadio

---

### ⚖️ VEREDICTO FINAL
**¿Cuál es la mejor línea para invertir HOY?**
- Opción recomendada: [HÁNDICAP / TOTAL / NINGUNA]
- Confianza: X/10
- Justificación: ¿El valor matemático es real o hay factores ocultos?

**Si detectas RED FLAGS (información contradictoria, falta de datos), responde: "VETO - INFORMACIÓN INSUFICIENTE"**`;

    navigator.clipboard.writeText(prompt);
    alert("✅ Prompt Maestro copiado. Pégalo en tu IA para el veredicto final.");
  };

  return (
    <div className="animate-reveal space-y-8 pb-20 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL 1: MERCADO Y SMART RADAR */}
        <div className="lg:col-span-4 glass-titanium rounded-[2.5rem] p-8 border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">1. Mercado</h3>
            <button onClick={copyRadarPrompt} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/40">
              <Zap size={12} fill="currentColor"/> Radar IA
            </button>
          </div>
          
          <div className="space-y-4 mb-8">
            <select 
              value={selectedLeague} 
              onChange={(e) => setSelectedLeague(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-xs outline-none focus:ring-2 ring-emerald-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-neutral-900">Seleccionar Competición...</option>
              
              {CONFIG.LEAGUES.SOCCER.map((category: any) => (
                <optgroup 
                  key={category.category} 
                  label={category.category}
                  className="bg-neutral-800 font-black text-emerald-500"
                >
                  {category.leagues.map((league: any) => (
                    <option 
                      key={league.id} 
                      value={league.id}
                      className="bg-neutral-900 text-white py-2"
                    >
                      {league.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            
            <div className="flex items-center bg-white/5 border border-white/10 rounded-[1.5rem] px-4 focus-within:ring-2 ring-emerald-500/20">
              <Calendar size={18} className="text-gray-500" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full bg-transparent p-5 text-xs scheme-dark outline-none font-bold text-center" 
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-center py-20 text-[10px] animate-pulse uppercase tracking-widest text-emerald-500">
                Sincronizando...
              </p>
            ) : filteredMatches.length === 0 ? (
              <p className="text-center py-20 text-[10px] uppercase tracking-widest text-gray-500">
                Sin partidos en esta fecha
              </p>
            ) : (
              filteredMatches.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMatch(m)} 
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-500 ${
                    selectedMatch?.id === m.id 
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)]' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="font-black text-[11px] uppercase mb-2 tracking-tight">
                    {m.home_team} vs {m.away_team}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase">
                    <Clock size={10} /> {getColombiaTime(m.commence_time)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* PANEL 2: INTELIGENCIA */}
        <div className="lg:col-span-4 glass-titanium rounded-[2.5rem] p-8 border-t-emerald-500 border-t-4">
          <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] text-center mb-8">
            <Target size={16} className="inline mr-2"/> 2. Análisis
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input 
              type="number" 
              placeholder="Home ELO" 
              value={eloH}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-sm text-center outline-none focus:border-emerald-500" 
              onChange={e => setEloH(e.target.value)} 
            />
            <input 
              type="number" 
              placeholder="Away ELO" 
              value={eloA}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-sm text-center outline-none focus:border-emerald-500" 
              onChange={e => setEloA(e.target.value)} 
            />
          </div>

          <div className="relative mb-6">
            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
            <input 
              type="number" 
              placeholder="Total Proyectado" 
              value={projTotal}
              className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-[1.5rem] text-xs outline-none focus:border-emerald-500" 
              onChange={e => setProjTotal(e.target.value)} 
            />
          </div>

          <textarea 
            placeholder="Notas (lesiones, H2H, clima...)" 
            value={analystNotes}
            className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] text-xs h-20 mb-6 resize-none focus:border-emerald-500 outline-none text-white" 
            onChange={e => setAnalystNotes(e.target.value)} 
          />
          
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center px-2">
               <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest italic">Añadir Líneas</span>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setHandicaps([...handicaps, {team:'home', line:'', odds:''}])} 
                   className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                 >
                   <Plus size={14}/>
                 </button>
                 <button 
                   onClick={() => setOuLines([...ouLines, {type:'over', value:'', odds:''}])} 
                   className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                 >
                   <Plus size={14}/>
                 </button>
               </div>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {handicaps.map((h, i) => (
                <div key={`h-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2 animate-reveal">
                  <select 
                    value={h.team}
                    onChange={e => {const n=[...handicaps]; n[i].team=e.target.value; setHandicaps(n);}} 
                    className="bg-transparent text-[9px] font-bold text-emerald-500 outline-none w-16"
                  >
                    <option value="home">LOC</option>
                    <option value="away">VIS</option>
                  </select>
                  <input 
                    placeholder="Hnd" 
                    value={h.line}
                    className="flex-1 bg-black/40 border border-white/10 p-1 rounded text-[10px] text-white text-center" 
                    onChange={e => {const n=[...handicaps]; n[i].line=e.target.value; setHandicaps(n);}} 
                  />
                  <input 
                    placeholder="Odds" 
                    value={h.odds}
                    className="w-12 bg-black/40 border border-white/10 p-1 rounded text-[10px] text-white text-center" 
                    onChange={e => {const n=[...handicaps]; n[i].odds=e.target.value; setHandicaps(n);}} 
                  />
                  <button 
                    onClick={() => setHandicaps(handicaps.filter((_,idx)=>idx!==i))} 
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
              {ouLines.map((l, i) => (
                <div key={`ou-${i}`} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2 animate-reveal">
                  <select 
                    value={l.type}
                    onChange={e => {const n=[...ouLines]; n[i].type=e.target.value; setOuLines(n);}} 
                    className="bg-transparent text-[9px] font-bold text-blue-500 outline-none w-16"
                  >
                    <option value="over">OVR</option>
                    <option value="under">UND</option>
                  </select>
                  <input 
                    placeholder="Tot" 
                    value={l.value}
                    className="flex-1 bg-black/40 border border-white/10 p-1 rounded text-[10px] text-white text-center" 
                    onChange={e => {const n=[...ouLines]; n[i].value=e.target.value; setOuLines(n);}} 
                  />
                  <input 
                    placeholder="Odds" 
                    value={l.odds}
                    className="w-12 bg-black/40 border border-white/10 p-1 rounded text-[10px] text-white text-center" 
                    onChange={e => {const n=[...ouLines]; n[i].odds=e.target.value; setOuLines(n);}} 
                  />
                  <button 
                    onClick={() => setOuLines(ouLines.filter((_,idx)=>idx!==i))} 
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={runFullAnalysis} 
              disabled={isAnalyzing} 
              className="w-full bg-emerald-600 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <RefreshCw className="animate-spin mx-auto" size={20}/>
              ) : (
                'Procesar Matemática'
              )}
            </button>
          </div>
        </div>

        {/* PANEL 3: REPORTE */}
        <div className="lg:col-span-4 space-y-6">
          {resultsH.length > 0 || resultsOU.length > 0 ? (
            <div className="animate-reveal space-y-6">
              <div className="glass-titanium p-8 rounded-[2.5rem] border-l-4 border-emerald-500 relative overflow-hidden shadow-2xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 text-center">
                  Veredicto Matemático
                </h3>
                <div className="space-y-6">
                  {resultsH.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0 text-white">
                      <div>
                        <div className={`text-[10px] font-black uppercase ${r.edge > 0.3 ? 'text-emerald-500' : 'text-gray-500'}`}>
                          H: {r.team} [{r.line}]
                        </div>
                        <div className="text-[9px] text-gray-600">Odds: {r.odds || 'N/A'}</div>
                      </div>
                      <div className={`text-3xl font-black italic tracking-tighter ${r.edge > 0.3 ? 'text-white' : 'text-gray-800'}`}>
                        {r.edge.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {resultsOU.map((r, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0 text-white">
                      <div>
                        <div className={`text-[10px] font-black uppercase ${Math.abs(r.edge) > 0.5 ? 'text-blue-500' : 'text-gray-500'}`}>
                          OU: {r.type} [{r.value}]
                        </div>
                        <div className="text-[9px] text-gray-600">Odds: {r.odds || 'N/A'}</div>
                      </div>
                      <div className={`text-3xl font-black italic tracking-tighter ${Math.abs(r.edge) > 0.5 ? 'text-white' : 'text-gray-800'}`}>
                        {r.edge.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={copyMasterPrompt} 
                className="w-full glass-titanium border-blue-500/40 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-blue-500/80 transition-all group active:scale-95 shadow-2xl"
              >
                 <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                   <ClipboardCheck size={32} />
                 </div>
                 <span className="text-white text-lg font-bold">Generar Veredicto Maestro</span>
              </button>
            </div>
          ) : (
            <div className="glass-titanium rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center opacity-20 border-dashed border-white/10 min-h-[500px]">
               <Trophy size={64} className="mb-6 text-gray-600" />
               <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose text-white text-center">
                 Filtre por fecha y elija un partido<br/>para auditar táctica
               </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SoccerModule;
