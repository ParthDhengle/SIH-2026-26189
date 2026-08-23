import React, { useState } from 'react';
import { 
  Clock, 
  Phone, 
  Car, 
  MapPin, 
  Link, 
  FileText, 
  AlertCircle, 
  Filter, 
  ShieldAlert 
} from 'lucide-react';
import { timelineEvents } from '../data/mockData';

export default function Timeline() {
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Filter logic
  const filteredEvents = timelineEvents.filter((evt) => {
    const matchesSeverity = selectedSeverity === 'All' || evt.severity === selectedSeverity;
    const matchesType = selectedType === 'All' || evt.type === selectedType;
    return matchesSeverity && matchesType;
  });

  // Icon switcher helper
  const getEventIcon = (type) => {
    switch (type) {
      case 'Call Record': return <Phone size={14} className="text-cyber-blue" />;
      case 'Vehicle Detection': return <Car size={14} className="text-amber-400" />;
      case 'Location Overlap': return <MapPin size={14} className="text-emerald-400" />;
      case 'New Connection Discovered': return <Link size={14} className="text-purple-400" />;
      case 'FIR Logged': return <FileText size={14} className="text-slate-300" />;
      default: return <AlertCircle size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wider">
            Chronological Activity Log
          </h2>
          <p className="text-xs text-slate-400">
            Audit trailing surveillance telemetry and forensic data intercepts in real-time.
          </p>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-cyber-blue" />
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Filter Severity:</span>
          {['All', 'Critical', 'High', 'Medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                selectedSeverity === sev
                  ? 'bg-cyber-blue/10 border-cyber-blue text-cyber-blue'
                  : 'border-cyber-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Filter Type:</span>
          {['All', 'Call Record', 'Location Overlap', 'Vehicle Detection', 'New Connection Discovered'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                selectedType === t
                  ? 'bg-cyber-blue/10 border-cyber-blue text-cyber-blue'
                  : 'border-cyber-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.split(' ')[0]} {/* shortened display name */}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Timeline visual container */}
      <div className="bg-cyber-darker rounded-xl border border-cyber-border p-6 relative max-w-4xl mx-auto">
        
        {/* The center line */}
        <div className="absolute left-[31px] sm:left-[35px] top-8 bottom-8 w-[1.5px] bg-cyber-border/80"></div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-8 relative">
            {filteredEvents.map((evt) => {
              const isCritical = evt.severity === 'Critical';
              return (
                <div key={evt.id} className="relative flex gap-4 sm:gap-6 items-start">
                  
                  {/* Timeline circle with category icon */}
                  <div className="z-10 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border bg-cyber-dark flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                      isCritical ? 'border-cyber-red/50 text-cyber-red' : 'border-cyber-border text-slate-300'
                    }`}>
                      {getEventIcon(evt.type)}
                    </div>
                  </div>

                  {/* Right hand side details card */}
                  <div className={`flex-1 p-4 rounded-xl border bg-cyber-dark/40 transition-all ${
                    isCritical 
                      ? 'border-cyber-red/25 hover:border-cyber-red/50 shadow-[0_0_15px_rgba(239,68,68,0.02)]' 
                      : 'border-cyber-border/80 hover:border-cyber-blue/40'
                  }`}>
                    {/* Timestamp & Type header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyber-border/40 pb-2 mb-2 gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{evt.id}</span>
                        <h4 className="text-xs font-bold text-slate-200">{evt.type}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${
                          evt.severity === 'Critical' ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/35 animate-pulse' :
                          (evt.severity === 'High' ? 'bg-cyber-warning/15 text-cyber-warning border-cyber-warning/35' : 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/35')
                        }`}>
                          {evt.severity} Priority
                        </span>
                        
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <Clock size={10} />
                          {evt.timestamp}
                        </div>
                      </div>
                    </div>

                    {/* Entities involved indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-cyber-blue font-bold mb-2">
                      <span className="text-slate-400 font-medium">Involved Target:</span>
                      {evt.entity}
                    </div>

                    {/* Detailed abstract narrative */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans bg-cyber-darkest/40 p-2.5 rounded border border-cyber-border/30">
                      {evt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-medium font-mono text-xs">
            No chronological records found matching filter constraints.
          </div>
        )}
      </div>
    </div>
  );
}
