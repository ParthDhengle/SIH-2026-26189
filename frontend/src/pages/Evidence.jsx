import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Phone, 
  MapPin, 
  Car, 
  Download,
  Eye,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function Evidence({ caseData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeEvidenceFile, setActiveEvidenceFile] = useState(null);

  // Sync state when caseData changes
  useEffect(() => {
    setActiveEvidenceFile(null);
    setSearchTerm('');
    setTypeFilter('All');
    setStatusFilter('All');
  }, [caseData]);

  const evidenceList = caseData.evidence || [];

  // Filter logic
  const filteredEvidence = evidenceList.filter((ev) => {
    const matchesSearch = ev.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ev.relatedEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || ev.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || ev.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'FIR': return <FileText size={18} className="text-cyber-red" />;
      case 'Call Record': return <Phone size={18} className="text-cyber-blue" />;
      case 'SMS Record': return <Phone size={18} className="text-cyber-blue" />;
      case 'Location Record': return <MapPin size={18} className="text-emerald-500" />;
      case 'Vehicle Record': return <Car size={18} className="text-amber-500" />;
      default: return <FileSpreadsheet size={18} className="text-purple-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-10rem)] bg-cyber-darkest text-slate-800 animate-in fade-in duration-200">
      
      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-cyber-border shadow-sm">
        {/* Search */}
        <div className="w-full lg:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, source, target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-cyber-border rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyber-blue transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-cyber-border">
            <span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-600 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="FIR">FIR Logs</option>
              <option value="Call Record">Call logs</option>
              <option value="Location Record">Geolocations</option>
              <option value="Vehicle Record">ANPR logs</option>
              <option value="Document">FIU Audits</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-cyber-border">
            <span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-600 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvidence.map((ev) => (
          <div 
            key={ev.id} 
            className="bg-white p-5 rounded-xl border border-cyber-border shadow-sm flex flex-col justify-between hover:border-cyber-blue/45 transition-colors relative group"
          >
            {/* Status Stamp */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                ev.status === 'Verified' ? 'bg-cyber-success/10 text-cyber-success border-cyber-success/20' :
                (ev.status === 'Pending' ? 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20' : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20')
              }`}>
                {ev.status}
              </span>
            </div>

            {/* Folder Body details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 p-2 rounded-lg border border-cyber-border">
                  {getEvidenceIcon(ev.type)}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">{ev.type} File</span>
                  <h4 className="text-xs font-mono font-bold text-slate-800">{ev.id}</h4>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-b border-slate-100 py-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Source:</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[130px]">{ev.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Date:</span>
                  <span className="text-slate-500 font-mono font-semibold">{ev.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">POI Link:</span>
                  <span className="text-cyber-blue font-bold truncate max-w-[130px]">{ev.relatedEntity}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {ev.summary}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">{ev.fileSize || "1.2 MB"}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveEvidenceFile(ev)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-cyber-blue/10 border border-cyber-border hover:border-cyber-blue/30 text-slate-600 hover:text-cyber-blue rounded text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <Eye size={12} /> Inspect File
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvidence.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium font-mono text-xs">
            No evidence files match current filters.
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      {activeEvidenceFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-cyber-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-slate-800">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-cyber-border flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyber-blue" />
                Case File Inspection Panel
              </h3>
              <button 
                onClick={() => setActiveEvidenceFile(null)}
                className="text-slate-400 hover:text-slate-800 transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-cyber-border">
                <div className="bg-white p-2 rounded-lg border border-cyber-border">
                  {getEvidenceIcon(activeEvidenceFile.type)}
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Record Identifier</span>
                  <h4 className="text-sm font-mono font-black text-cyber-blue">{activeEvidenceFile.id}</h4>
                </div>
                <div className="ml-auto">
                  <span className={`text-[8px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
                    activeEvidenceFile.status === 'Verified' ? 'bg-cyber-success/15 text-cyber-success border-cyber-success/30' :
                    (activeEvidenceFile.status === 'Pending' ? 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/30' : 'bg-cyber-warning/15 text-cyber-warning border-cyber-warning/30')
                  }`}>
                    {activeEvidenceFile.status}
                  </span>
                </div>
              </div>

              {/* dossier table details */}
              <div className="bg-slate-50 border border-cyber-border rounded-lg p-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Evidence Class:</span>
                  <span className="text-slate-700 font-semibold">{activeEvidenceFile.type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Audit Source:</span>
                  <span className="text-slate-700 font-semibold">{activeEvidenceFile.source}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registry Date:</span>
                  <span className="text-slate-700 font-mono font-semibold">{activeEvidenceFile.date}</span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target Linkage:</span>
                  <span className="text-cyber-blue font-bold">{activeEvidenceFile.relatedEntity}</span>
                </div>
              </div>

              {/* record abstract summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Record Summary Brief</span>
                <div className="p-3 bg-slate-50 border border-cyber-border rounded text-xs text-slate-700 leading-relaxed font-mono">
                  {activeEvidenceFile.summary}
                </div>
              </div>

              {/* Footer info in Modal */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 font-mono">
                <span>File Size: {activeEvidenceFile.fileSize || "1.2 MB"}</span>
                <span>SHA-256 Verified Ledger</span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-cyber-border">
                <button
                  onClick={() => setActiveEvidenceFile(null)}
                  className="px-4 py-2 rounded text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-cyber-border"
                >
                  Close Dossier File
                </button>
                <button
                  onClick={() => {
                    alert(`Initiating download for decrypted file: ${activeEvidenceFile.id}`);
                    setActiveEvidenceFile(null);
                  }}
                  className="px-4 py-2 rounded text-xs font-bold bg-cyber-blue hover:bg-cyber-blue-dark text-white shadow flex items-center gap-1.5"
                >
                  <Download size={12} /> Decrypt & Download
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
