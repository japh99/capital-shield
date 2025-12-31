import { useState } from 'react';
import { Shield, ArrowLeft, BarChart3, Cpu, Dribbble } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';
import MlbModule from './modules/Mlb';

// --- ICONOS PERSONALIZADOS PREMIUM ---

const SoccerBallIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m12 12-4-3 1-5" />
    <path d="m12 12 4-3-1-5" />
    <path d="m12 12v5h-5" />
    <path d="m12 12v5h5" />
    <path d="m8 9 4 3 4-3" />
    <path d="m7 17 5-5 5 5" />
  </svg>
);

const BaseballIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8.5 2.5a10 10 0 0 1 7 19" />
    <path d="M15.5 2.5a10 10 0 0 0-7 19" />
    <path d="m10 5 1.5 1.5" /><path d="m12.5 8 1.5 1.5" /><path d="m14 11 1.5 1.5" />
    <path d="m8.5 13 1.5 1.5" /><path d="m10 16 1.5 1.5" /><path d="m12 19 1.5 1.5" />
  </svg>
);

function App() {
  const [view, setView] = useState('selection');

  const SportCard = ({ id, name, icon: Icon, color, desc, stats }: any) => (
    <button 
      onClick={() => setView(id)}
      className="glass-titanium group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 active:scale-95 flex flex-col items-start text-left w-full shadow-2xl"
    >
      {/* Icono de fondo gigante con baja opacidad */}
      <div className={`absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12 ${color}`}>
        <Icon size={200} />
      </div>
      
      {/* Icono del contenedor */}
      <div className={`p-4 rounded-2xl mb-6 ${color} bg-white/5 border border-white/10 group-hover:bg-white/15 transition-all shadow-inner`}>
        <Icon size={32} />
      </div>
      
      <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase italic group-hover:translate-x-2 transition-transform duration-500">
        {name}
      </h3>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium max-w-[220px]">
        {desc}
      </p>
      
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-auto bg-black/40 px-4 py-2 rounded-full border border-white/5 group-hover:border-emerald-500/20 transition-colors">
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
            <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors"><ArrowLeft size={20} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Panel Principal</span>
          </button>
          
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Shield className="text-emerald-500" size={14} />
            <span className="text-[10px] font-black uppercase tracking-tighter text-white">Capital Shield <span className="text-emerald-500">v3.0</span></span>
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
      {/* Efectos de Iluminación Ambiental */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />

      <header className="text-center mb-12 sm:mb-20 animate-reveal w-full max-w-5xl">
        <div className="inline-flex items-center gap-2 mb-8 bg-white/5 px-6 py-2.5 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
          <Cpu size={14} className="text-emerald-500 animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Terminal de Inteligencia Cuántica</span>
        </div>
        
        <h1 className="responsive-title font-black tracking-tighter mb-6 italic text-white uppercase drop-shadow-2xl">
          CAPITAL<span className="text-emerald-500 not-italic font-extralight">SHIELD</span>
        </h1>
        
        <p className="text-gray-500 tracking-[0.4em] uppercase text-[9px] sm:text-xs font-bold px-6 max-w-2xl mx-auto leading-loose">
          Advanced Analytics for Professional Sports Investments
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl animate-reveal [animation-delay:200ms]">
        <SportCard 
          id="soccer" 
          name="Soccer" 
          icon={SoccerBallIcon} 
          color="text-emerald-500" 
          desc="Algoritmos de precisión basados en Power Ratings y ELO dinámico."
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
          desc="Análisis sabermétrico enfocado en rotación de Pitchers y Ballparks."
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
