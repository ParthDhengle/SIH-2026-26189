import React, { useState } from 'react';
import { Search, User, ShieldCheck } from 'lucide-react';

export default function Topbar() {
  const [showProfilePopover, setShowProfilePopover] = useState(false);

  return (
    <header className="h-16 border-b border-cyber-border bg-cyber-darker flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Title / Status Branding */}
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-cyber-blue" />
        <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
          National Intelligence Portal
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="w-96 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Search global intelligence files..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-cyber-dark border border-cyber-border rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
        />
      </div>

      {/* Investigator Profile */}
      <div 
        onClick={() => setShowProfilePopover(!showProfilePopover)}
        className="flex items-center gap-3 pl-4 border-l border-cyber-border cursor-pointer select-none relative"
      >
        <div className="text-right">
          <h4 className="text-xs font-bold text-slate-800">Agent Mayuri</h4>
          <p className="text-[9px] text-cyber-blue font-bold uppercase tracking-wider">
            Senior Investigator
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue hover:bg-cyber-blue/20 transition-all">
          <User size={18} />
        </div>

        {/* Profile Popover Details */}
        {showProfilePopover && (
          <div className="absolute right-0 top-11 w-56 bg-white border border-cyber-border rounded-xl shadow-xl p-4 space-y-3 z-50 text-slate-800 text-xs text-left animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-8 h-8 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue font-black">
                M
              </div>
              <div>
                <h5 className="font-extrabold text-slate-800">Agent Mayuri</h5>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Senior Analyst</span>
              </div>
            </div>
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Badge ID:</span>
                <span className="text-slate-700 font-mono font-bold">AGENT-9942</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Clearance:</span>
                <span className="text-cyber-blue font-bold">Level 4 (TS)</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Status:</span>
                <span className="text-cyber-success font-bold">Active Duty</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
