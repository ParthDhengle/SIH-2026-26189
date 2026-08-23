import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Phone, 
  MapPin, 
  Car, 
  FileCheck, 
  ShieldCheck, 
  Search, 
  Download,
  Eye,
  X
} from 'lucide-react';
import { evidenceItems } from '../data/mockData';

export default function Evidence() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Selected file for inspection modal
  const [activeEvidenceFile, setActiveEvidenceFile] = useState(null);

  // Filter evidence items
  const filteredEvidence = evidenceItems.filter((ev) => {
    const matchesSearch = ev.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ev.relatedEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'All' || ev.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || ev.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Icon selector helper
  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'FIR': return <FileText size={18} className="text-cyber-red" />;
      case 'Call Record': return <Phone size={18} className="text-cyber-blue" />;
      case 'Location Record': return <MapPin size={18} className="text-emerald-400" />;
      case 'Vehicle Record': return <Car size={18} className="text-amber-400" />;
      default: return <FileSpreadsheet size={18} className="text-purple-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wider">
            Evidence Vault & Case Files
          </h2>
          <p className="text-xs text-slate-400">
            Audit cataloged intelligence file attachments and verification records.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-cyber-darker p-4 rounded-xl border border-cyber-border">
        {/* Search */}
        <div className="w-full lg:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search by file ID, source, suspect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-blue transition-all"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap gap-3">
          {/* Type filter dropdown */}
          <div className="flex items-center gap-1.5 bg-cyber-dark px-3 py-1.5 rounded-lg border border-cyber-border text-xs">
            <span className="text-slate-500 font-semibold uppercase text-[9px]">File Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-300 font-bold cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="FIR">FIR Details</option>
              <option value="Call Record">Call Intercepts</option>
              <option value="Location Record">Location Intercepts</option>
              <option value="Vehicle Record">ANPR Records</option>
              <option value="Document">FIU Documents</option>
            </select>
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-1.5 bg-cyber-dark px-3 py-1.5 rounded-lg border border-cyber-border text-xs">
            <span className="text-slate-500 font-semibold uppercase text-[9px]">Audit Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-300 font-bold cursor-pointer"
            >
              <option value="All">All Audits</option>
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
            className="bg-cyber-darker p-5 rounded-xl border border-cyber-border flex flex-col justify-between hover:border-cyber-blue/45 transition-colors shadow-lg relative group"
          >
            {/* Stamp Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border uppercase font-mono ${
                ev.status === 'Verified' ? 'bg-cyber-success/10 text-cyber-success border-cyber-success/20' :
                (ev.status === 'Pending' ? 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20' : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20')
              }`}>
                {ev.status}
              </span>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-cyber-dark p-2 rounded-lg border border-cyber-border text-slate-300">
                  {getEvidenceIcon(ev.type)}
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">{ev.type} File</span>
                  <h4 className="text-xs font-bold text-slate-200 font-mono">{ev.id}</h4>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-b border-cyber-border/40 py-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="text-slate-300 font-medium">{ev.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-400 font-mono">{ev.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Suspect:</span>
                  <span className="text-cyber-blue font-bold truncate max-w-[130px]">{ev.relatedEntity}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {ev.summary}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 pt-4 border-t border-cyber-border flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">{ev.fileSize}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveEvidenceFile(ev)}
                  className="px-2.5 py-1.5 bg-cyber-light hover:bg-cyber-blue/10 border border-cyber-border hover:border-cyber-blue/40 text-slate-300 hover:text-cyber-blue rounded text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <Eye size={12} /> Inspect
                </button>
                <button className="p-1.5 bg-cyber-light border border-cyber-border hover:bg-cyber-light text-slate-400 hover:text-white rounded transition-all">
                  <Download size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvidence.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium font-mono text-xs">
            No physical or digital evidence records match query parameters.
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      {activeEvidenceFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-cyber-darker border border-cyber-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-cyber-border flex justify-between items-center bg-cyber-dark/50">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyber-blue" />
                Case File Inspection Panel
              </h3>
              <button 
                onClick={() => setActiveEvidenceFile(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 bg-cyber-dark/40 p-3 rounded-lg border border-cyber-border">
                <div className="bg-cyber-dark p-2.5 rounded-lg border border-cyber-border">
                  {getEvidenceIcon(activeEvidenceFile.type)}
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Record Identifier</span>
                  <h4 className="text-sm font-mono font-black text-cyber-blue">{activeEvidenceFile.id}</h4>
                </div>
                <div className="ml-auto">
                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded border uppercase font-mono ${
                    activeEvidenceFile.status === 'Verified' ? 'bg-cyber-success/15 text-cyber-success border-cyber-success/30' :
                    (activeEvidenceFile.status === 'Pending' ? 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/30' : 'bg-cyber-warning/15 text-cyber-warning border-cyber-warning/30')
                  }`}>
                    {activeEvidenceFile.status}
                  </span>
                </div>
              </div>

              {/* dossier table details */}
              <div className="bg-cyber-dark/20 border border-cyber-border/80 rounded-lg p-4 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-cyber-border/40 pb-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Evidence Class:</span>
                  <span className="text-slate-300 font-semibold">{activeEvidenceFile.type}</span>
                </div>
                <div className="flex justify-between border-b border-cyber-border/40 pb-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Audit Source:</span>
                  <span className="text-slate-300 font-semibold">{activeEvidenceFile.source}</span>
                </div>
                <div className="flex justify-between border-b border-cyber-border/40 pb-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Registry Date:</span>
                  <span className="text-slate-300 font-mono">{activeEvidenceFile.date}</span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Target Linkage:</span>
                  <span className="text-cyber-blue font-bold">{activeEvidenceFile.relatedEntity}</span>
                </div>
              </div>

              {/* abstract summary content */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Record Summary Brief</span>
                <div className="p-3 bg-cyber-darkest/60 border border-cyber-border rounded text-xs text-slate-300 leading-relaxed font-mono">
                  {activeEvidenceFile.summary}
                </div>
              </div>

              {/* Footer info in Modal */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
                <span>File Size: {activeEvidenceFile.fileSize}</span>
                <span>SHA-256 Verified Ledger</span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-cyber-border">
                <button
                  onClick={() => setActiveEvidenceFile(null)}
                  className="px-4 py-2 rounded text-xs font-bold bg-cyber-light text-slate-400 hover:text-white border border-cyber-border"
                >
                  Close Dossier File
                </button>
                <button
                  onClick={() => {
                    alert(`Initiating download for encrypted file: ${activeEvidenceFile.id}`);
                    setActiveEvidenceFile(null);
                  }}
                  className="px-4 py-2 rounded text-xs font-bold bg-cyber-blue hover:bg-cyber-blue-dark text-slate-100 flex items-center gap-1.5"
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
