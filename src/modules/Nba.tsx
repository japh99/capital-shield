import React, { useState, useEffect } from 'react';
import { Dribbble, Zap, Copy, RefreshCw, Plus, Trash2, Search, Target, MessageSquare, ClipboardCheck, Calendar, Activity, BarChart3, Clock, Hash, BrainCircuit, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../config';

const NbaModule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}));
  const [ratingH, setRatingH] = useState('');
  const [ratingA, setRatingA] = useState('');
  const [projTotal, setProjTotal] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [radarResults, setRadarResults] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [handicaps, setHandicaps] = useState<any[]>([{ team: 'home', line: '', odds: '' }]);
  const [ouLines, setOuLines] = useState<any[]>([{ type: 'over', value: '', odds: '' }]);
  const [resultsH, setResultsH] = useState<any[]>([]);
  const [resultsOU, setResultsOU] = useState<any[]>([]);

  const getColombiaTime = (utcDate: string) => new Date(utcDate).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true });

  const fetchNbaMatches = async () => {
    setLoading(true); setMatches([]); setRadarResults([]);
    try {
      const resp = await axios.get(`${CONFIG.ODDS_BASE_URL}/basketball_nba/odds`, { params: { apiKey: CONFIG.ODDS_API_KEY, regions: 'us', markets: 'h2h', dateFormat: 'iso' } });
      setMatches(resp.data);
    } catch (e) { alert("Error API NBA"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNbaMatches(); }, []);

  const filteredMatches = matches.filter((m: any) => new Date(m.commence_time).toLocaleDateString('en-CA', {timeZone: 'America/Bogota'}) === selectedDate);

  const runSmartRadar = async () => {
    if (filteredMatches.length === 0) return;
    setIsScanning(true);
    try {
      const resp = await axios.post('/api', { task: 'radar', matches: filteredMatches });
      setRadarResults(resp.data.priorities || []);
    } catch (e: any) { alert("Radar Error: " + (e.response?.data?.error || e.message)); } finally { setIsScanning(false); }
  };

  const runFullAnalysis = async () => {
    if (!selectedMatch) return;
    setIsAnalyzing(true);
    try {
      if (ratingH && ratingA) {
        const resH = await Promise.all(handicaps.filter(h => h.line).map(async (h) => {
          const resp = await axios.post('/api', { task: 'math', sport: 'nba', h_rating: ratingH, a_rating: ratingA, line: h.line });
          const edge = h.team === 'home' ? (resp.data.expected_value + parseFloat(h.line)) : (parseFloat(h.line) - resp.data.expected_value);
          return { ...h, edge: Math.round(edge * 100) / 100, expected: resp.data.expected_value };
        }));
        setResultsH(resH);
      }
      if (projTotal) {
        const resOU = await Promise.all(ouLines.filter(l => l.value).map(async (l) => {
          const resp = await axios.post('/api', { task: 'math', sport: 'nba_ou', h_rating: projTotal, line: l.value });
          const edge = l.type === 'over' ? (resp.data.expected_value - parseFloat(l.value)) : (parseFloat(l.value) - resp.data.expected_value);
          return { ...l, edge: Math.round(edge * 100) / 100 };
        }));
        setResultsOU(resOU);
      }
    } catch (e) { alert("Error matemático"); } finally { setIsAnalyzing(false); }
  };

  const requestAiAnalysis = async () => {
    setAiLoading(true);
    const prompt = `NBA Audit: ${selectedMatch.home_team} vs ${selectedMatch.away_team}. Proyección Dunkel: ${projTotal}. Spreads: ${resultsH.length}. Notas: ${analystNotes}. Investiga: Lesiones, B2B y Pace. ¿Veredicto?`;
    try {
      const resp = await axios.post('/api', { task: 'audit', prompt });
      setAiResponse(resp.data.analysis);
    } catch (e) { setAiResponse("Error IA"); } finally { setAiLoading(false); }
  };

  return (
    <div className="animate-reveal space-y-8">
      <h2 className="text-4xl font-black text-white uppercase italic">NBA <span className="text-orange-500 not-italic">Radar</span></h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-white/5">
          <div className="flex justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em]">1. Mercado</h3>
            <button onClick={runSmartRadar} disabled={isScanning} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] uppercase font-bold border border-emerald-500/20">{isScanning ? '...' : 'Smart Scan IA'}</button>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs mb-6 scheme-dark" />
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredMatches.map(m => {
              const p = radarResults.find(r => r.teams.toLowerCase().includes(m.home_team.toLowerCase()));
              return (
                <button key={m.id} onClick={() => setSelectedMatch(m)} className={`w-full text-left p-5 rounded-2xl border transition-all ${selectedMatch?.id === m.id ? 'bg-orange-500/10 border-orange-500/40' : 'bg-white/5 border-transparent'}`}>
                  {p && <div className="text-[7px] text-emerald-500 font-bold mb-1">🔥 VALUE: {p.score}%</div>}
                  <div className="font-bold text-[11px] uppercase">{m.home_team} @ {m.away_team}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{getColombiaTime(m.commence_time)}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-4 glass-titanium rounded-[2rem] p-6 border-t-orange-500/50 border-t-2">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-6 text-center">2. Inteligencia</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input type="number" placeholder="Home RTG" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs" onChange={e => setRatingH(e.target.value)} />
            <input type="number" placeholder="Away RTG" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs" onChange={e => setRatingA(e.target.value)} />
          </div>
          <input type="number" placeholder="Total Dunkel" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs mb-4" onChange={e => setProjTotal(e.target.value)} />
          <div className="space-y-2">
            <button onClick={() => setHandicaps([...handicaps, { team: 'home', line: '', odds: '' }])} className="text-[9px] text-orange-500 uppercase">+ Spread</button>
            {handicaps.map((h, i) => (
              <div key={i} className="flex gap-2"><input placeholder="Línea" className="flex-1 bg-black/40 p-2 rounded text-xs border border-white/10" onChange={e => { const n = [...handicaps]; n[i].line = e.target.value; setHandicaps(n); }} /><input placeholder="Cuota" className="w-14 bg-black/40 p-2 rounded text-xs border border-white/10" onChange={e => { const n = [...handicaps]; n[i].odds = e.target.value; setHandicaps(n); }} /></div>
            ))}
            <button onClick={runFullAnalysis} className="w-full bg-orange-600 p-5 rounded-2xl font-bold uppercase text-[11px] mt-4">Analizar</button>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-4">
          {resultsH.length > 0 && (
            <div className="glass-titanium p-6 rounded-[2rem] border-l-4 border-orange-500">
               {resultsH.map((r, i) => <div key={i} className="flex justify-between py-2 border-b border-white/5"><div><div className="text-[10px] font-bold uppercase">{r.team} [{r.line}]</div></div><div className="text-3xl font-black">{r.edge}</div></div>)}
               <button onClick={requestAiAnalysis} className="w-full bg-emerald-600 p-4 rounded-xl font-bold text-[10px] mt-6 uppercase flex items-center justify-center gap-2">
                 {aiLoading ? '...' : <BrainCircuit size={16}/>} Auditoría IA
               </button>
               {aiResponse && <div className="mt-4 text-[10px] text-gray-400 bg-black/40 p-4 rounded-xl">{aiResponse}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NbaModule;
