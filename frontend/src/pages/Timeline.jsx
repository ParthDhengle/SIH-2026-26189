import React, { useState } from 'react';
import { 
  Clock, 
  Phone, 
  Car, 
  MapPin, 
  Link, 
  FileText, 
  AlertCircle, 
  Filter 
} from 'lucide-react';

export default function Timeline({ caseData }) {
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const eventsList = caseData.timeline || [];

  // Filter logic
  const filteredEvents = eventsList.filter((evt) => {
    return selectedSeverity === 'All' || evt.severity === selectedSeverity;
  });

  // Icon switcher helper
  const getEventIcon = (type) => {
    switch (type) {
      case 'Call Record': return <Phone size={14} className="text-cyber-blue" />;
      case 'Vehicle Record': return <Car size={14} className="text-amber-500" />;
      case 'ANPR Tracking': return <Car size={14} className="text-amber-500" />;
      case 'Location Record': return <MapPin size={14} className="text-emerald-500" />;
      case 'IP Login': return <MapPin size={14} className="text-emerald-500" />;
      case 'New Connection Discovered': return <Link size={14} className="text-purple-500" />;
      case 'Mule Bank Transfer': return <FileText size={14} className="text-pink-500" />;
      case 'Bank Alert': return <FileText size={14} className="text-pink-500" />;
      case 'Bank Ledger': return <FileText size={14} className="text-pink-500" />;
      default: return <AlertCircle size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-10rem)] bg-cyber-darkest text-slate-800 animate-in fade-in duration-200">
      
      {/* Timeline Controls */}
      <div className="bg-white p-4 rounded-xl border border-cyber-border flex gap-4 items-center shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-cyber-blue" />
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Filter Severity:</span>
          {['All', 'Critical', 'High', 'Medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                selectedSeverity === sev
                  ? 'bg-cyber-blue/15 border-cyber-blue text-cyber-blue'
                  : 'border-cyber-border text-slate-500 hover:text-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline visual list container */}
      <div className="bg-white rounded-xl border border-cyber-border p-6 relative max-w-4xl mx-auto shadow-sm">
        
        {/* Vertical divider line */}
        <div className="absolute left-[31px] sm:left-[35px] top-8 bottom-8 w-[1.5px] bg-slate-100"></div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-8 relative">
            {filteredEvents.map((evt) => {
              const isCritical = evt.severity === 'Critical';
              return (
                <div key={evt.id} className="relative flex gap-4 sm:gap-6 items-start">
                  
                  {/* Circle point with type icon */}
                  <div className="z-10 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border bg-white flex items-center justify-center shadow-sm transition-transform hover:scale-110 ${
                      isCritical ? 'border-cyber-red/50 text-cyber-red' : 'border-cyber-border text-slate-500'
                    }`}>
                      {getEventIcon(evt.type)}
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className={`flex-1 p-4 rounded-xl border bg-slate-50/50 transition-all ${
                    isCritical 
                      ? 'border-cyber-red/35 hover:border-cyber-red/50 shadow-red-50/10' 
                      : 'border-cyber-border/80 hover:border-cyber-blue/30'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyber-border pb-2 mb-2 gap-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{evt.id}</span>
                        <h4 className="font-bold text-slate-800">{evt.type}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${
                          evt.severity === 'Critical' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/25 animate-pulse' :
                          (evt.severity === 'High' ? 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/25' : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/25')
                        }`}>
                          {evt.severity}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-bold">
                          <Clock size={10} />
                          {evt.timestamp}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-cyber-blue font-bold mb-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Target Node:</span>
                      {evt.entity}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans bg-white p-2.5 rounded border border-cyber-border/70">
                      {evt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium font-mono text-xs">
            No events match the selected priority criteria.
          </div>
        )}
      </div>

    </div>
  );
}
