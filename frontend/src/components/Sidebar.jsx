import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  SearchCode, 
  Network, 
  AlertTriangle, 
  Clock, 
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'investigation', label: 'Investigation', icon: SearchCode },
    { id: 'network', label: 'Network Graph', icon: Network },
    { id: 'patterns', label: 'Patterns', icon: AlertTriangle },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'evidence', label: 'Evidence', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-cyber-darker border-r border-cyber-border flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-cyber-border flex items-center gap-3">
          <div className="bg-cyber-blue/10 p-2 rounded-lg border border-cyber-blue/30 text-cyber-blue animate-pulse">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
              CrimeGraph AI
            </h1>
            <p className="text-[10px] text-cyber-blue font-semibold tracking-widest uppercase">
              Connection Analysis
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-cyber-blue/10 border-l-2 border-cyber-blue text-cyber-blue shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-light/50 border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-cyber-blue' : 'text-slate-400'} />
                <span>{item.label}</span>
                {item.id === 'patterns' && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyber-red/20 text-cyber-red animate-pulse border border-cyber-red/30">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-cyber-border bg-cyber-darkest/45">
        <div className="flex items-center gap-2 p-2 rounded bg-cyber-dark/40 border border-cyber-border">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-success animate-ping"></div>
          <span className="text-[10px] text-slate-400 font-mono">
            Node Service: CONNECTED
          </span>
        </div>
        <p className="text-[9px] text-slate-500 text-center mt-3 font-mono">
          SIH 2026 • v1.0.0-mocked
        </p>
      </div>
    </aside>
  );
}
