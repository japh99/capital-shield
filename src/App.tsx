import { useState } from 'react';
import { Shield, ArrowLeft, BarChart3, Cpu, Dribbble } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';
import MlbModule from './modules/Mlb';

// --- ICONOS DE ALTA FIDELIDAD (CUSTOM SVG) ---

const SoccerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 22a10 10 0 0 0 10-10H12V2a10 10 0 0 0-10 10h10v10Z" opacity="0.2" />
    <path d="M12 12 7.5 7.5M12 12l4.5 4.5M12 12l4.5-4.5M12 12l-4.5 4.5" />
    <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
    <path d="m5 5 3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19" />
  </svg>
);

const BaseballIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 2.5a11 11 0 0 1 8 19" />
    <path d="M16 2.5a11 11 0 0 0-8 19" />
    <path d="m10 5-1.5 1M13 8l-2 1M15 11l-2 1M15 13l-2-1M13 16l-2-1M10 19l-1.5-1" />
  </svg>
);

function App() {
  const [view, setView] = useState('selection');

  const SportCard = ({ id, name, icon: Icon, color, desc, stats }: any) => (
    <button 
      onClick={() => setView(id)}
      className="glass-titanium group relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 transition-all duration-500 hover:scale-[1.03] active:scale-95 flex flex-col items-start text-left w-full border border-white/5 hover:border-white/20 shadow-2xl"
    >
      {/* Icono de fondo gigante (marca de agua) */}
      <div className={`absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12 ${color}`}>
        <Icon size={220} />
      </div>
      
      {/* Icono de la tarjeta */}
      <div className={`p-4 rounded-2xl mb-6 ${color} bg-white/5 border border-white/10 group-hover:bg-white/15 transition-all shadow-inner`}>
        <Icon size={32} />
      </div>
      
      <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase italic group-hover:translate-x-1 transition-transform">
        {name}
      </h3>
      <p className="text-gray-500 text-xs sm:text-sm mb-8 leading-relaxed font-medium max-w-[200px]">
        {desc}
      </p>
      
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-auto bg-black/40 px-4 py-2 rounded-full border border-white/5">
        <BarChart3 size={10} className={color} />
        <span>{stats}</span>
      </div>
    </button>
  );

  if (view !== 'selection') {
    return (
      <div className="min-h-screen bg-[#050505]">
        <nav className="h-20 glass-titanium sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between border-x-0 border-t-0 shadow-2xl">
          <button onClick={() => setView('selection')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all group">
            <div className="p-2 rounded-full group-hover:bg-white/5"><ArrowLeft size={20} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Hub Central</span>
          </button>
          
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Shield className="text-emerald-500" size={14} />
            <span className="text-[10px] font-black uppercase tracking-tighter text-white uppercase italic">Capital <span className="text-emerald-500">Shield</span></span>
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[#050505]">
      {/* Luces ambientales pro */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full" />

      <header className="text-center mb-12 sm:mb-20 animate-reveal w-full max-w-5xl px-4">
        <div className="inline-flex items-center gap-2 mb-8 bg-white/5 px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
          <Cpu size={14} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em]">AI-Powered Strategic Terminal</span>
        </div>
        
        {/* Título responsivo corregido */}
        <h1 className="responsive-title font-black tracking-tighter mb-4 italic text-white uppercase break-words">
          CAPITAL<span className="text-emerald-500 not-italic font-extralight">SHIELD</span>
        </h1>
        
        <p className="text-gray-600 tracking-[0.4em] uppercase text-[10px] sm:text-xs font-bold leading-loose">
          Intelligence for Professional Sports Investments
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl animate-reveal [animation-delay:200ms]">
        <SportCard 
          id="soccer" 
          name="Soccer" 
          icon={SoccerIcon} 
          color="text-emerald-500" 
          desc="Análisis predictivo basado en algoritmos ELO y Power Ratings europeos."
          stats="International Leagues"
        />
        <SportCard 
          id="nba" 
          name="NBA" 
          icon={Dribbble} 
          color="text-orange-500" 
          desc="Modelado de totales Over/Under sincronizado con Dunkel Index."
          stats="Market Totals"
        />
        <SportCard 
          id="mlb" 
          name="MLB" 
          icon={BaseballIcon} 
          color="text-blue-500" 
          desc="Sabermetría avanzada y análisis de rotación de Pitchers y Ballparks."
          stats="Run Line Engine"
        />
      </div>

      <footer className="mt-24 text-[8px] text-gray-700 uppercase tracking-[0.8em] font-black opacity-50">
        © 2025 Capital Shield Financial Systems
      </footer>
    </div>
  );
}

export default App;
