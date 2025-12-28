import { useState } from 'react';
import { Shield, Trophy, Activity, Zap, LayoutDashboard, Menu, X } from 'lucide-react';
import SoccerModule from './modules/Soccer';
import NbaModule from './modules/Nba';
import MlbModule from './modules/Mlb';

function App() {
  const [activeTab, setActiveTab] = useState('soccer');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'soccer', name: 'Fútbol', icon: Trophy, color: 'text-emerald-500' },
    { id: 'nba', name: 'NBA', icon: Activity, color: 'text-orange-500' },
    { id: 'mlb', name: 'MLB', icon: Zap, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      <nav className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-white/10 flex flex-col`}>
        <div className="p-6 flex items-center gap-2">
          <Shield className="text-emerald-500" />
          {isSidebarOpen && <span className="font-bold">CAPITAL SHIELD</span>}
        </div>
        <div className="flex-1 px-4 mt-4">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg">
              <item.icon className={item.color} size={20} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </div>
      </nav>
      <main className="flex-1 p-8">
        {activeTab === 'soccer' && <SoccerModule />}
        {activeTab === 'nba' && <NbaModule />}
        {activeTab === 'mlb' && <MlbModule />}
      </main>
    </div>
  );
}
export default App;
