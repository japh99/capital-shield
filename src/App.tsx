import { useState } from 'react';
import { Shield, Trophy, Dribbble, Zap, ArrowLeft, BarChart3, Cpu, Globe2 } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';
import MlbModule from './modules/Mlb';

function App() {
  const [view, setView] = useState('selection');

  const SportCard = ({ id, name, icon: Icon, color, desc, stats }: any) => (
    <button 
      onClick={() => setView(id)}
      className="glass-titanium group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.02] active:scale-95 flex flex-col items-start text-left w-full"
    >
      <div className={`absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon size={180} />
      </div>
      
      <div className={`p-4 rounded-2xl mb-6 ${color} bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors`}>
        <Icon size={28} />
      </div>
      
      <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase italic group-hover:translate-x-1 transition-transform">{name}</h3>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">{desc}</p>
      
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-auto bg-white/5 px-3 py-1 rounded-full border border-white/5">
        <BarChart3 size={10} />
        <span>{stats}</span>
      </div>
    </button>
  );

  if (view !== 'selection') {
    return (
      <div className="min-h-screen bg-[#050505]">
        <nav className="h-20 glass-titanium sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between border-x-0 border-t-0">
          <button onClick={() => setView('selection')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all group">
            <div className="p-2 rounded-full group-hover:bg-white/5"><ArrowLeft size={20} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Hub Central</span>
          </button>
          
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <Shield className="text-emerald-500" size={14} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Capital Shield <span className="opacity-40">v3.0</span></span>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-reveal">
          {view === 'soccer' && <SoccerModule />}
          {view === 'nba' && <NbaModule />}
          {view === 'mlb' && <MlbModule />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Luz de fondo dinámica */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <header className="text-center mb-12 sm:mb-20 animate-reveal w-full max-w-4xl">
        <div className="inline-flex items-center gap-2 mb-6 bg-white/5 px-5 py-2 rounded-full border border-white/10 shadow-xl">
          <Cpu size={12} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Quantitative Intelligence Terminal</span>
        </div>
        
        <h1 className="responsive-title font-black tracking-tighter mb-4 italic text-white uppercase">
          CAPITAL<span className="text-emerald-500 not-italic font-light">SHIELD</span>
        </h1>
        
        <p className="text-gray-500 tracking-[0.3em] uppercase text-[10px] sm:text-xs font-bold px-4">
          Financial Analytics for Strategic Sports Investments
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl animate-reveal [animation-delay:200ms]">
        <SportCard 
          id="soccer" 
          name="Soccer" 
          icon={Trophy} 
          color="text-emerald-500" 
          desc="Análisis predictivo basado en algoritmos ELO y Power Ratings."
          stats="International Leagues"
        />
        <SportCard 
          id="nba" 
          name="NBA" 
          icon={Dribbble} 
          color="text-orange-500" 
          desc="Modelado de totales y spreads sincronizado con Dunkel Index."
          stats="Market Totals"
        />
        <SportCard 
          id="mlb" 
          name="MLB" 
          icon={Zap} 
          color="text-blue-500" 
          desc="Sabermetría avanzada y rotación de Pitchers Abridores."
          stats="Run Line Engine"
        />
      </div>

      <footer className="mt-20 text-[8px] text-gray-700 uppercase tracking-[0.6em] font-black">
        © 2025 Capital Shield Financial Systems
      </footer>
    </div>
  );
}

export default App;
