import { useState } from 'react';
import { Shield, Trophy, Activity, Zap, ArrowLeft } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';
import MlbModule from './modules/Mlb';

function App() {
  const [view, setView] = useState('selection');

  const SportCard = ({ id, name, icon: Icon, color, desc }: any) => (
    <button 
      onClick={() => setView(id)}
      className="glass-card p-8 flex flex-col items-center gap-4 hover:scale-105 transition-all border-white/5 hover:border-white/20 group"
    >
      <div className={`p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors ${color}`}>
        <Icon size={48} />
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black tracking-tighter">{name}</h3>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">{desc}</p>
      </div>
    </button>
  );

  if (view !== 'selection') {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <button onClick={() => setView('selection')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Volver al Hub</span>
          </button>
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-500" size={20} />
            <span className="font-black tracking-tighter uppercase">Capital Shield</span>
          </div>
        </nav>
        <div className="p-8 max-w-7xl mx-auto">
          {view === 'soccer' && <SoccerModule />}
          {view === 'nba' && <NbaModule />}
          {view === 'mlb' && <MlbModule />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent">
      <div className="text-center mb-16">
        <Shield className="text-emerald-500 mx-auto mb-4" size={64} />
        <h1 className="text-5xl font-black tracking-tighter mb-2">CAPITAL<span className="text-emerald-500">SHIELD</span></h1>
        <p className="text-gray-500 tracking-[0.3em] uppercase text-sm">Terminal de Inteligencia Financiera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <SportCard id="soccer" name="SOCCER" icon={Trophy} color="text-emerald-500" desc="ELO & Goals Advantage" />
        <SportCard id="nba" name="NBA" icon={Activity} color="text-orange-500" desc="Power Ratings & Spreads" />
        <SportCard id="mlb" name="MLB" icon={Zap} color="text-blue-500" desc="Sabermetrics & Run Line" />
      </div>
    </div>
  );
}

export default App;
