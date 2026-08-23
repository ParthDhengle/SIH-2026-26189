import React from 'react';
import { Search, Shield, User, ChevronDown } from 'lucide-react';

export default function Topbar({ cases, currentCaseId, setCurrentCaseId }) {
  const currentCase = cases.find(c => c.id === currentCaseId) || cases[0];

  return (
    <header className="h-16 border-b border-cyber-border bg-cyber-darker flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Active Case Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-cyber-dark px-3 py-1.5 rounded-lg border border-cyber-border hover:border-cyber-blue/50 transition-colors cursor-pointer relative group">
          <Shield size={16} className="text-cyber-blue" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase leading-none">
              Active Case File
            </span>
            <select
              value={currentCaseId}
              onChange={(e) => setCurrentCaseId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 border-none outline-none pr-6 cursor-pointer appearance-none"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-cyber-dark text-slate-200">
                  {c.id} • {c.name.length > 25 ? `${c.name.substring(0, 25)}...` : c.name}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown size={14} className="text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="w-96 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-500" />
        </span>
        <input
          type="text"
          placeholder="Search entities, phone numbers, vehicle logs..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
        />
      </div>

      {/* Investigator Profile */}
      <div className="flex items-center gap-3 pl-4 border-l border-cyber-border">
        <div className="text-right">
          <h4 className="text-xs font-bold text-slate-200">Agent Mayur</h4>
          <p className="text-[10px] text-cyber-blue font-semibold uppercase tracking-wider">
            Senior Investigator
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-cyber-blue/10 border border-cyber-blue/40 flex items-center justify-center text-cyber-blue">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
