import { useState } from 'react';
import { Shield, Trophy, Activity, Zap, ArrowLeft, BarChart3, Globe2, Cpu } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';
import MlbModule from './modules/Mlb';

function App() {
  const [view, setView] = useState('selection');

  const SportCard = ({ id, name, icon: Icon, color, desc, stats }: any) => (
    <button 
      onClick={() => setView(id)}
      className="glass-titanium group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 active:scale-95 flex flex-col items-start text-left"
    >
      <div className={`absolute top-0 right-0 p-12 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={120} />
      </div>
      
      <div className={`p-4 rounded-2xl mb-6 ${color} bg-white/5 group-hover:bg-white/10 transition-colors`}>
        <Icon size={32} />
      </div>
      
      <h3 className="text-3xl font-black tracking-tighter mb-2 group-hover:translate-x-1 transition-transform">{name}</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-[200px]">{desc}</p>
      
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <BarChart3 size={12} />
        <span>{stats}</span>
      </div>
    </button>
  );

  if (view !== 'selection') {
    return (
      <div className="min-h-screen pb-12">
        <nav className="h-20 glass-titanium sticky top-0 z-50 px-6 flex items-center justify-between border-x-0 border-t-0">
          <button onClick={() => setView('selection')} className="flex items-center gap-3 text-gray-400 hover:text-white transition-all group">
            <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors">
               <ArrowLeft size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hub Central</span>
          </button>
          
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <Shield className="text-emerald-500" size={16} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Capital Shield <span className="text-emerald-500/50">v3.0</span></span>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 mt-8 animate-reveal">
          {view === 'soccer' && <SoccerModule />}
          {view === 'nba' && <NbaModule />}
          {view === 'mlb' && <MlbModule />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />

      <header className="text-center mb-16 animate-reveal">
        <div className="inline-flex items-center gap-3 mb-6 bg-white/5 px-6 py-2 rounded-full border border-white/10 shadow-2xl">
          <Cpu size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">AI Driven Terminal</span>
        </div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-4 italic">
          CAPITAL<span className="text-emerald-500 font-normal not-italic">SHIELD</span>
        </h1>
        <p className="text-gray-500 tracking-[0.5em] uppercase text-xs sm:text-sm font-light">Intelligence for Strategic Investments</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl animate-reveal [animation-delay:200ms]">
        <SportCard 
          id="soccer" 
          name="SOCCER" 
          icon={Trophy} 
          color="text-emerald-500" 
          desc="Análisis predictivo basado en algoritmos ELO y Power Ratings europeos."
          stats="42 Ligas Activas"
        />
        <SportCard 
          id="nba" 
          name="NBA" 
          icon={Activity} 
          color="text-orange-500" 
          desc="Modelado de totales Over/Under sincronizado con Dunkel Index."
          stats="Mercado Totales"
        />
        <SportCard 
          id="mlb" 
          name="MLB" 
          icon={Zap} 
          color="text-blue-500" 
          desc="Sabermetría avanzada y análisis de rotación de Pitchers Abridores."
          stats="Run Line Engine"
        />
      </div>

      <footer className="mt-20 text-[9px] text-gray-600 uppercase tracking-[0.5em] animate-reveal [animation-delay:400ms]">
        © 2025 Capital Shield Financial Systems
      </footer>
    </div>
  );
}

export default App;
