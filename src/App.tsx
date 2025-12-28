import { useState } from 'react';
import { Shield, Trophy, Basketball, Baseball, LayoutDashboard, Menu, X } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';
import MlbModule from './modules/Mlb';

function App() {
  const [activeTab, setActiveTab] = useState('soccer');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'soccer', name: 'Fútbol (ELO)', icon: Trophy, color: 'text-emerald-500' },
    { id: 'nba', name: 'NBA (Rating)', icon: Basketball, color: 'text-orange-500' },
    { id: 'mlb', name: 'MLB (Run Line)', icon: Baseball, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen flex bg-titanium-900 text-gray-100">
      {/* Sidebar Navigation */}
      <nav className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-white/5 bg-black/20 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <Shield className="text-emerald-500" size={32} />
          {isSidebarOpen && <h1 className="font-black tracking-tighter text-xl">CAPITAL<span className="text-emerald-500">SHIELD</span></h1>}
        </div>

        <div className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all ${
                activeTab === item.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'
              }`}
            >
              <item.icon className={activeTab === item.id ? item.color : ''} size={20} />
              {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex justify-center p-2 hover:bg-white/5 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/10">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <LayoutDashboard size={14} />
            <span>TERMINAL / {activeTab.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">Sistema Activo</span>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {activeTab === 'soccer' && <SoccerModule />}
          {activeTab === 'nba' && <NbaModule />}
          {activeTab === 'mlb' && <MlbModule />}
        </div>
      </main>
    </div>
  );
}

export default App;
