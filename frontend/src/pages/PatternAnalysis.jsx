import React from 'react';
import { AlertTriangle, ShieldAlert, BadgeCheck, Users, HelpCircle, Activity } from 'lucide-react';
import { suspiciousPatterns } from '../data/mockData';

export default function PatternAnalysis() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wider">
            Neural Pattern Intelligence
          </h2>
          <p className="text-xs text-slate-400">
            Detected syndical behaviors and high-risk operational anomalies.
          </p>
        </div>
      </div>

      {/* Grid of Threat Patterns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {suspiciousPatterns.map((pat) => {
          const isCritical = pat.riskScore >= 90;
          return (
            <div 
              key={pat.id} 
              className={`bg-cyber-darker p-5 rounded-xl border flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group ${
                isCritical 
                  ? 'border-cyber-red/30 hover:border-cyber-red/60 shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                  : 'border-cyber-border hover:border-cyber-blue/60 shadow-lg'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${
                      isCritical ? 'bg-cyber-red/10 text-cyber-red' : 'bg-cyber-warning/10 text-cyber-warning'
                    }`}>
                      <AlertTriangle size={18} className={isCritical ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Threat Vector ID: {pat.id}</span>
                      <h3 className="text-sm font-bold text-slate-200">{pat.title}</h3>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isCritical 
                      ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/30' 
                      : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/30'
                  }`}>
                    {isCritical ? 'CRITICAL RISK' : 'HIGH RISK'}
                  </span>
                </div>

                {/* Description Narrative */}
                <p className="text-xs text-slate-300 leading-relaxed bg-cyber-dark/40 p-3 rounded border border-cyber-border/40 font-sans">
                  {pat.description}
                </p>

                {/* Related Entities Involved */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Users size={12} />
                    Involved Suspects / Targets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pat.relatedEntities.map((ent, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 text-[10px] font-semibold bg-cyber-dark border border-cyber-border text-slate-300 rounded hover:border-cyber-blue/30 transition-colors"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Metrics & Evidence Summary */}
              <div className="mt-6 pt-4 border-t border-cyber-border space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyber-dark/60 p-2.5 rounded border border-cyber-border text-center">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Threat Index</span>
                    <span className={`text-lg font-black font-mono ${isCritical ? 'text-cyber-red' : 'text-cyber-warning'}`}>
                      {pat.riskScore}%
                    </span>
                  </div>
                  <div className="bg-cyber-dark/60 p-2.5 rounded border border-cyber-border text-center">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">AI Confidence</span>
                    <span className="text-lg font-black font-mono text-cyber-blue">
                      {pat.confidence}%
                    </span>
                  </div>
                </div>

                {/* Supporting Audit Files */}
                <div className="bg-cyber-dark/30 border border-cyber-border/60 rounded p-2.5 flex items-start gap-2 text-left">
                  <BadgeCheck size={14} className="text-cyber-success shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Verified Supporting Files</span>
                    <p className="text-[11px] font-mono text-slate-400">
                      {pat.supportingEvidence}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative scanline accent */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                isCritical ? 'from-cyber-red to-cyber-red-dark' : 'from-cyber-warning to-amber-600'
              }`}></div>
            </div>
          );
        })}

        {/* Informative Security Advisory Card */}
        <div className="bg-cyber-darker/40 p-5 rounded-xl border border-cyber-border border-dashed flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
          <div className="w-12 h-12 rounded-full bg-cyber-blue/5 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Algorithmic Auditing active</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Our automated cognitive model processes cell logs, wire routing coordinates, and vehicle detections hourly to flag matching crime vector networks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
