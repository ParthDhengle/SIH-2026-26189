import React, { useState } from 'react';
import { 
  SearchCode, 
  HelpCircle, 
  User, 
  Phone, 
  Car, 
  MapPin, 
  FileText, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Link2,
  CheckCircle2
} from 'lucide-react';
import { connectionPaths, searchEntitiesList } from '../data/mockData';

export default function Investigation() {
  const [queryText, setQueryText] = useState('');
  const [activePath, setActivePath] = useState(null);
  const [showIncomplete, setShowIncomplete] = useState(false);

  // Quick Query Helper
  const runPresetQuery = (sourceId, targetId) => {
    const path = connectionPaths.find(p => p.source === sourceId && p.target === targetId);
    if (path) {
      setActivePath(path);
      setQueryText(`How is ${path.sourceName} connected to ${path.targetName}?`);
      setShowIncomplete(false);
    }
  };

  // Handle Search Submit
  const handleSearch = (e) => {
    e.preventDefault();
    const cleanQuery = queryText.toLowerCase();
    
    // Find if the query references two entities we have paths for
    let foundPath = null;
    for (const path of connectionPaths) {
      const srcName = path.sourceName.toLowerCase();
      const tgtName = path.targetName.toLowerCase();
      const srcFirst = srcName.split(' ')[0];
      const tgtFirst = tgtName.split(' ')[0];

      // Check if both names are mentioned in the search text
      if (
        (cleanQuery.includes(srcFirst) && cleanQuery.includes(tgtFirst)) ||
        (cleanQuery.includes(path.source) && cleanQuery.includes(path.target))
      ) {
        foundPath = path;
        break;
      }
    }

    if (foundPath) {
      setActivePath(foundPath);
      setShowIncomplete(false);
    } else {
      setActivePath(null);
      setShowIncomplete(true);
    }
  };

  // Helper to map icons dynamically
  const getStepIcon = (iconName) => {
    switch (iconName) {
      case 'User': return <User size={16} className="text-cyber-blue" />;
      case 'Phone': return <Phone size={16} className="text-cyber-blue" />;
      case 'Car': return <Car size={16} className="text-cyber-blue" />;
      case 'MapPin': return <MapPin size={16} className="text-cyber-blue" />;
      case 'ShieldAlert': return <ShieldAlert size={16} className="text-cyber-red" />;
      default: return <FileText size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wider">
            AI Connection Investigator
          </h2>
          <p className="text-xs text-slate-400">
            Query the cognitive relationship engine to reveal connection chains and evidence links.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchCode size={18} className="text-cyber-blue animate-pulse" />
            </span>
            <input
              type="text"
              placeholder="e.g. How is Rahul connected to Amit?"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue font-semibold transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-cyber-blue hover:bg-cyber-blue-dark text-slate-100 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Analyze Link
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Preset Analysis:</span>
          <button 
            onClick={() => runPresetQuery('rahul', 'amit')}
            className="px-3 py-1 bg-cyber-dark hover:border-cyber-blue/50 text-slate-300 rounded border border-cyber-border text-[11px] font-medium"
          >
            Rahul Sharma ➔ Amit Verma
          </button>
          <button 
            onClick={() => runPresetQuery('rahul', 'vikram')}
            className="px-3 py-1 bg-cyber-dark hover:border-cyber-blue/50 text-slate-300 rounded border border-cyber-border text-[11px] font-medium"
          >
            Rahul Sharma ➔ Vikram Malhotra
          </button>
          <button 
            onClick={() => runPresetQuery('priya', 'vikram')}
            className="px-3 py-1 bg-cyber-dark hover:border-cyber-blue/50 text-slate-300 rounded border border-cyber-border text-[11px] font-medium"
          >
            Priya Nair ➔ Vikram Malhotra
          </button>
        </div>
      </div>

      {/* Main Results Board */}
      {activePath ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Path Visualizer */}
          <div className="lg:col-span-2 bg-cyber-darker p-5 rounded-xl border border-cyber-border space-y-6">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Link2 size={16} className="text-cyber-blue" />
                Connection Chain Graph
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Cognitive Path Trace</span>
            </div>

            {/* Vertical Flow Steps */}
            <div className="space-y-0.5 relative pl-4 sm:pl-8">
              {/* Vertical line connector */}
              <div className="absolute left-[31px] sm:left-[47px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyber-blue to-cyber-red-dark"></div>

              {activePath.pathSteps.map((step, idx) => {
                const isEntity = step.type === 'entity';
                return (
                  <div key={idx} className="relative flex gap-4 items-center">
                    {/* Circle Icon or Line Connector Point */}
                    <div className="z-10 flex items-center justify-center">
                      {isEntity ? (
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-cyber-dark border-2 border-cyber-blue flex items-center justify-center shadow-lg">
                          {getStepIcon(step.icon)}
                        </div>
                      ) : (
                        <div className="w-9 h-6 sm:w-11 sm:h-8 flex items-center justify-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-cyber-red border-2 border-cyber-dark flex items-center justify-center animate-pulse">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Card Content */}
                    <div className={`flex-1 p-3 rounded-lg border ${
                      isEntity 
                        ? 'bg-cyber-dark/50 border-cyber-border hover:border-cyber-blue/40' 
                        : 'bg-cyber-red/5 border-cyber-red/20 border-dashed text-cyber-red'
                    } transition-colors my-1.5`}>
                      {isEntity ? (
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">{step.name}</h4>
                            <p className="text-[10px] text-slate-400">{step.subtitle}</p>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-cyber-light border border-cyber-border text-slate-500 font-mono">
                            {step.category}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold uppercase tracking-wider text-[10px] block">Relationship: {step.relation}</span>
                            <span className="text-[10px] text-slate-300 font-semibold">{step.detail}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-cyber-red/10 border border-cyber-red/20 px-2 py-0.5 rounded">
                            {step.source}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connection Summary & Evidence Details */}
          <div className="space-y-6">
            {/* Quick Metrics Panel */}
            <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border space-y-4 text-center">
              <div className="border-b border-cyber-border/60 pb-3 text-left">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Analysis Summary</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyber-dark/50 border border-cyber-border p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Confidence</span>
                  <span className="text-2xl font-black text-cyber-blue font-mono">{activePath.confidence}</span>
                </div>
                <div className="bg-cyber-dark/50 border border-cyber-border p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Risk Score</span>
                  <span className="text-2xl font-black text-cyber-red font-mono">{activePath.riskScore}/100</span>
                </div>
              </div>
              <div className="bg-cyber-success/5 border border-cyber-success/20 rounded p-2.5 flex items-center gap-2 text-left">
                <CheckCircle2 size={16} className="text-cyber-success shrink-0" />
                <p className="text-[10px] text-cyber-success font-semibold leading-normal">
                  All connection edges in this chain are backed by verified records.
                </p>
              </div>
            </div>

            {/* Supporting Evidence Items */}
            <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border space-y-4">
              <div className="border-b border-cyber-border/60 pb-3 flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Supporting Evidence</h4>
                <span className="text-[10px] text-slate-500 font-mono">{activePath.evidence.length} Files</span>
              </div>

              <div className="space-y-3">
                {activePath.evidence.map((ev, idx) => (
                  <div key={idx} className="bg-cyber-dark/50 border border-cyber-border p-3 rounded-lg space-y-2 hover:border-cyber-blue/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-cyber-blue">{ev.id}</span>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-cyber-light text-slate-400 border border-cyber-border">
                        {ev.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {ev.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : showIncomplete ? (
        /* Need More Information */
        <div className="bg-cyber-darker border border-cyber-red/20 rounded-xl p-8 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyber-red/10 border border-cyber-red/20 flex items-center justify-center text-cyber-red mx-auto animate-bounce">
            <HelpCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider">Need More Information</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              We could not resolve the relationship path for this query. The neural engine requires at least two valid entities (e.g. Person, Phone, Vehicle) to trace links.
            </p>
          </div>
          <div className="pt-4 border-t border-cyber-border/60 text-left space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Guidelines:</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>Mention two suspects by name, e.g., <code className="bg-cyber-dark px-1.5 py-0.5 rounded text-[11px] text-cyber-blue font-mono font-bold">Rahul</code> and <code className="bg-cyber-dark px-1.5 py-0.5 rounded text-[11px] text-cyber-blue font-mono font-bold">Amit</code>.</li>
              <li>Alternatively, run one of the preset links using the chips above.</li>
              <li>Verify that names match database spelling: <span className="text-slate-200 font-semibold">Rahul Sharma, Amit Verma, Vikram Malhotra, Priya Nair</span>.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Initial Screen */
        <div className="bg-cyber-darker border border-cyber-border rounded-xl p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue mx-auto animate-pulse">
            <SearchCode size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-200 uppercase tracking-wider">Cognitive Search Engine</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Enter suspect names or ID numbers in the query box above to discover cross-entity relationship links and supporting documentation logs.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyber-blue"></span>
              91% Max Precision
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyber-warning animate-pulse"></span>
              Real-time Intelligence
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
