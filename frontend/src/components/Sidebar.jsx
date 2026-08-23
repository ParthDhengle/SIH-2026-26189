import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases Directory', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-cyber-darker border-r border-cyber-border flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-cyber-border flex items-center gap-3">
          <div className="bg-cyber-blue/10 p-2 rounded-lg border border-cyber-blue/30 text-cyber-blue">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-800 uppercase">
              CrimeGraph AI
            </h1>
            <p className="text-[9px] text-cyber-blue font-bold tracking-wider uppercase">
              Connection Analysis
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'cases' && currentPage.startsWith('case-workspace'));
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-cyber-blue/10 border-l-2 border-cyber-blue text-cyber-blue shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-cyber-dark border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-cyber-blue' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-cyber-border bg-slate-50/50">
        <div className="flex items-center gap-2 p-2 rounded bg-slate-100 border border-cyber-border">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-success animate-ping"></div>
          <span className="text-[10px] text-slate-600 font-mono font-bold">
            Audit Engine: SECURE
          </span>
        </div>
        <p className="text-[9px] text-slate-400 text-center mt-3 font-mono">
          SIH 2026 • v2.0.0-light
        </p>
      </div>
    </aside>
  );
}
