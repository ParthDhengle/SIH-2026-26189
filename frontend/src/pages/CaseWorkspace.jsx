import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  FolderLock, 
  Users, 
  Phone, 
  Car, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

// Import sub-pages
import Investigation from './Investigation';
import NetworkGraph from './NetworkGraph';
import PatternAnalysis from './PatternAnalysis';
import Timeline from './Timeline';
import Evidence from './Evidence';

export default function CaseWorkspace({ caseData, setCurrentPage, onMarkAsSolved }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'investigation', label: 'Investigation Chat' },
    { id: 'network', label: 'Network Graph' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'evidence', label: 'Evidence' }
  ];

  // Overview Tab Sub-component
  const OverviewTab = () => {
    // Locate primary POI node details if available
    const primaryPOI = caseData.nodes.find(n => n.data.label === caseData.primaryPOI);
    const isCritical = caseData.risk === 'High' || caseData.riskScore > 80;

    return (
      <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-10rem)] bg-cyber-darkest text-slate-800 animate-in fade-in duration-200">
        
        {/* Top metrics grids */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-xl border-l-4 border-l-cyber-blue border border-cyber-border shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Suspect POIs</span>
              <span className="text-2xl font-mono font-black text-slate-800">{caseData.stats.persons}</span>
              <span className="text-[9px] text-cyber-blue font-bold block flex items-center gap-1">
                Active targets
              </span>
            </div>
            <div className="bg-cyber-blue/10 text-cyber-blue p-3 rounded-lg border border-cyber-blue/20">
              <Users size={20} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-xl border-l-4 border-l-cyan-500 border border-cyber-border shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Phone Lines</span>
              <span className="text-2xl font-mono font-black text-slate-800">{caseData.stats.phones}</span>
              <span className="text-[9px] text-cyan-600 font-bold block">
                Burner SIM intercepts
              </span>
            </div>
            <div className="bg-cyan-50 text-cyan-600 p-3 rounded-lg border border-cyan-100">
              <Phone size={20} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-xl border-l-4 border-l-amber-500 border border-cyber-border shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Vehicles</span>
              <span className="text-2xl font-mono font-black text-slate-800">{caseData.stats.vehicles}</span>
              <span className="text-[9px] text-amber-600 font-bold block">
                ANPR surveillance logs
              </span>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-lg border border-amber-100">
              <Car size={20} />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-xl border-l-4 border-l-emerald-500 border border-cyber-border shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Locations</span>
              <span className="text-2xl font-mono font-black text-slate-800">{caseData.stats.locations}</span>
              <span className="text-[9px] text-emerald-600 font-bold block">
                Coordinates monitored
              </span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg border border-emerald-100">
              <MapPin size={20} />
            </div>
          </div>
        </div>

        {/* Mid section: Case Abstract & POI Profile dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case Abstract Summary */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-cyber-border shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-cyber-blue" />
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Investigation Summary</h4>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">LEDGER VERIFIED</span>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                  {caseData.summary}
                </p>
                
                {/* Core operational directives list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Operational Directives Checklist</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue"></span>
                      Map suspect connection degrees
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                      Audit burner SIM records
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Correlate ANPR vehicle scans
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verify location site GPS stamps
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
              <span>CASE METADATA FILE ATTACHMENTS SECURED</span>
              <span>L.UP: {caseData.lastUpdated}</span>
            </div>
          </div>

          {/* Primary POI Profile */}
          <div className="bg-white p-6 rounded-xl border border-cyber-border shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Primary POI Dossier</h4>
                <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase ${
                  isCritical ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/20' : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20'
                }`}>
                  Risk: {primaryPOI?.data.riskScore || caseData.riskScore}%
                </span>
              </div>

              {primaryPOI ? (
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {/* Gradient Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyber-blue to-blue-400 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {primaryPOI.data.label.substring(0, 1)}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-800 leading-tight">{primaryPOI.data.label}</h5>
                      <span className="text-[9px] font-extrabold uppercase bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 mt-1 block">
                        {primaryPOI.data.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Occupation:</span>
                      <span className="text-slate-700 font-bold">{primaryPOI.data.details?.occupation || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Active Cases:</span>
                      <span className="text-cyber-red font-black font-mono">3 Case Files</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Active FIRs:</span>
                      <span className="text-cyber-red font-black font-mono">{primaryPOI.data.details?.firCount || 0} Reports</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Intelligence Remarks:</span>
                    <p className="p-3 rounded-lg bg-slate-50 border border-cyber-border text-[11px] leading-relaxed text-slate-600 font-medium italic">
                      "{primaryPOI.data.details?.remarks}"
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No primary POI dossier mapped for this case.</p>
              )}
            </div>
            <button 
              onClick={() => setActiveTab('investigation')}
              className="w-full mt-6 py-2.5 bg-cyber-blue hover:bg-cyber-blue-dark text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Analyze POI Connection Chain
            </button>
          </div>
        </div>

        {/* Bottom section: Recent Timeline Log */}
        <div className="bg-white p-6 rounded-xl border border-cyber-border shadow-sm">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-cyber-blue" />
              Recent Operations Log
            </h4>
            <button 
              onClick={() => setActiveTab('timeline')}
              className="text-[11px] font-extrabold text-cyber-blue hover:underline"
            >
              View Full Timeline
            </button>
          </div>
          
          <div className="space-y-3">
            {caseData.timeline.slice(0, 2).map((evt) => (
              <div 
                key={evt.id} 
                className="flex gap-4 items-start p-4 rounded-xl border border-cyber-border bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                  evt.severity === 'Critical' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/20' : 
                  (evt.severity === 'High' ? 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20' : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20')
                }`}>
                  {evt.severity}
                </span>
                
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <h5 className="font-extrabold text-slate-800">{evt.type} • {evt.entity}</h5>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{evt.timestamp}</span>
                  </div>
                  <p className="text-slate-500 leading-normal font-medium">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'investigation':
        return <Investigation caseData={caseData} />;
      case 'network':
        return <NetworkGraph caseData={caseData} />;
      case 'patterns':
        return <PatternAnalysis caseData={caseData} />;
      case 'timeline':
        return <Timeline caseData={caseData} />;
      case 'evidence':
        return <Evidence caseData={caseData} />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-cyber-darkest text-slate-800">
      {/* Workspace Header */}
      <div className="bg-white border-b border-cyber-border px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('cases')}
            className="p-1.5 hover:bg-slate-100 border border-cyber-border rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FolderLock size={16} className="text-cyber-blue" />
              <span className="text-xs font-mono font-bold text-cyber-blue">{caseData.id}</span>
            </div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide leading-tight">
              {caseData.name}
            </h2>
          </div>
        </div>

        {/* Badges & Mark as Solved Action */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          {caseData.status !== 'Solved' ? (
            <button
              onClick={() => onMarkAsSolved(caseData.id)}
              className="px-3.5 py-1.5 bg-cyber-success hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={13} /> Mark as Solved
            </button>
          ) : (
            <div className="px-3.5 py-1.5 bg-cyber-success/15 border border-cyber-success/30 text-cyber-success rounded-lg text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Case Solved
            </div>
          )}

          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
            caseData.status === 'Solved' 
              ? 'bg-cyber-success/10 text-cyber-success border-cyber-success/20' 
              : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              caseData.status === 'Solved' ? 'bg-cyber-success' : 'bg-cyber-blue'
            }`}></span>
            Status: {caseData.status}
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
            caseData.risk === 'High' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/20' : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20'
          }`}>
            <ShieldAlert size={12} />
            Risk: {caseData.risk}
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white border-b border-cyber-border px-6 flex gap-4 z-10 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-1 border-b-2 text-xs font-extrabold transition-all relative ${
                isActive 
                  ? 'border-cyber-blue text-cyber-blue font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.id === 'investigation' && (
                <span className="absolute top-2 -right-3 px-1.5 py-0.5 text-[8px] font-black rounded-full bg-cyber-blue text-white scale-75 animate-bounce">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Active View Container */}
      <div className="flex-1 overflow-hidden relative">
        {renderTabContent()}
      </div>
    </div>
  );
}
