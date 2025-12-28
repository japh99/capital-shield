import { useState } from 'react';
import { Shield, Trophy, Activity, LayoutDashboard, Menu, X } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';

function App() {
  const [activeTab, setActiveTab] = useState('soccer');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'soccer', name: 'Fútbol', icon: Trophy, color: 'text-emerald-500' },
    { id: 'nba', name: 'NBA', icon: Activity, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      <nav className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-white/10 bg-black flex flex-col transition-all`}>
        <div className="p-6 flex items-center gap-2">
          <Shield className="text-emerald-500" />
          {isSidebarOpen && <span className="font-bold">CAPITAL SHIELD</span>}
        </div>
        <div className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-3 rounded-lg ${activeTab === item.id ? 'bg-white/10' : ''}`}>
              <item.icon className={item.color} size={20} />
              {isSidebarOpen && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-white/10 flex items-center px-8 text-[10px] text-gray-500 uppercase tracking-widest">
          Terminal / {activeTab}
        </header>
        <div className="p-8">
          {activeTab === 'soccer' ? <SoccerModule /> : <NbaModule />}
        </div>
      </main>
    </div>
  );
}
export default App;
