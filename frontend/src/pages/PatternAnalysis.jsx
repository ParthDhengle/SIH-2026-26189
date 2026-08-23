import React from 'react';
import { AlertTriangle, BadgeCheck, Users, Activity } from 'lucide-react';

export default function PatternAnalysis({ caseData }) {
  const patternsList = caseData.patterns || [];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-10rem)] bg-cyber-darkest text-slate-800 animate-in fade-in duration-200">
      {/* Grid of Threat Patterns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {patternsList.map((pat) => {
          const isCritical = pat.riskScore >= 90;
          return (
            <div 
              key={pat.id} 
              className={`bg-white p-5 rounded-xl border flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group shadow-sm ${
                isCritical 
                  ? 'border-cyber-red/30 shadow-red-50/30 hover:border-cyber-red/50' 
                  : 'border-cyber-border hover:border-cyber-blue/50'
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
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Threat Vector ID: {pat.id}</span>
                      <h3 className="text-sm font-bold text-slate-800">{pat.title}</h3>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isCritical 
                      ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/20' 
                      : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20'
                  }`}>
                    {isCritical ? 'CRITICAL RISK' : 'HIGH RISK'}
                  </span>
                </div>

                {/* Description Narrative */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-cyber-border/40 font-sans">
                  {pat.description}
                </p>

                {/* Related Entities Involved */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Users size={12} />
                    Involved Target Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pat.relatedEntities.map((ent, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-0.5 font-bold bg-slate-100 border border-cyber-border text-slate-600 rounded"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Metrics & Evidence Summary */}
              <div className="mt-6 pt-4 border-t border-cyber-border space-y-4 text-xs">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-2.5 rounded border border-cyber-border text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Threat Index</span>
                    <span className={`text-lg font-black font-mono ${isCritical ? 'text-cyber-red' : 'text-cyber-warning'}`}>
                      {pat.riskScore}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-cyber-border text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">AI Confidence</span>
                    <span className="text-lg font-black font-mono text-cyber-blue">
                      91%
                    </span>
                  </div>
                </div>

                {/* Supporting Audit Files */}
                <div className="bg-slate-50/50 border border-cyber-border rounded p-2.5 flex items-start gap-2 text-left">
                  <BadgeCheck size={14} className="text-cyber-success shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Verified Supporting Files</span>
                    <p className="text-[11px] font-mono text-slate-500">
                      {pat.evidence}
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

        {patternsList.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium font-mono text-xs">
            No patterns mapped to this case file.
          </div>
        )}

        {/* Informative Security Advisory Card */}
        {patternsList.length > 0 && (
          <div className="bg-white p-5 rounded-xl border border-cyber-border border-dashed flex flex-col items-center justify-center text-center space-y-3 shadow-sm min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pattern engine online</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Continuous cognitive scanning correlates phone lines, geolocation BTS reports, and bank transfers hourly to flag matching threat vectors.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
