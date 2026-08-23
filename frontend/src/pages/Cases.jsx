import React, { useState } from 'react';
import { Briefcase, Plus, Search, Calendar, FolderGit2, X } from 'lucide-react';

export default function Cases({ cases, setCases, currentCaseId, setCurrentCaseId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseType, setNewCaseType] = useState('Financial Fraud');
  const [newCasePriority, setNewCasePriority] = useState('High');
  const [newCaseDesc, setNewCaseDesc] = useState('');

  // Handle Case creation
  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!newCaseName.trim()) return;

    const newCase = {
      id: `CASE-2026-0${cases.length + 1}`,
      name: newCaseName,
      type: newCaseType,
      status: "Active",
      priority: newCasePriority,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: newCaseDesc || "No description provided."
    };

    setCases([newCase, ...cases]);
    setCurrentCaseId(newCase.id); // set newly created case as active
    setIsModalOpen(false);

    // Reset form
    setNewCaseName('');
    setNewCaseType('Financial Fraud');
    setNewCasePriority('High');
    setNewCaseDesc('');
  };

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wider">
            Criminal Case Records
          </h2>
          <p className="text-xs text-slate-400">
            Create, manage, and audit investigative folders.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyber-blue hover:bg-cyber-blue-dark text-slate-100 rounded-lg text-xs font-bold transition-all"
        >
          <Plus size={16} /> Create Case
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-cyber-darker p-4 rounded-xl border border-cyber-border">
        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search cases by name, type, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-blue transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['All', 'Active', 'Under Review', 'Solved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                statusFilter === status
                  ? 'bg-cyber-blue/10 border-cyber-blue text-cyber-blue'
                  : 'border-cyber-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-cyber-darker rounded-xl border border-cyber-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyber-border bg-cyber-dark/50 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                <th className="p-4">Case ID</th>
                <th className="p-4">Case Name</th>
                <th className="p-4">Crime Type</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40 text-xs">
              {filteredCases.length > 0 ? (
                filteredCases.map((c) => {
                  const isActiveFile = c.id === currentCaseId;
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-cyber-light/20 transition-all ${
                        isActiveFile ? 'bg-cyber-blue/5 border-l-2 border-l-cyber-blue' : ''
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-cyber-blue">{c.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{c.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</div>
                      </td>
                      <td className="p-4 text-slate-300 font-semibold">{c.type}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.priority === 'Critical' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/30' :
                          (c.priority === 'High' ? 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/30' : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30')
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{c.lastUpdated}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.status === 'Active' ? 'bg-cyber-blue/5 text-cyber-blue border-cyber-blue/20' :
                          (c.status === 'Solved' ? 'bg-cyber-success/5 text-cyber-success border-cyber-success/20' : 'bg-cyber-warning/5 text-cyber-warning border-cyber-warning/20')
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'Active' ? 'bg-cyber-blue' : 
                            (c.status === 'Solved' ? 'bg-cyber-success' : 'bg-cyber-warning')
                          }`}></span>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          disabled={isActiveFile}
                          onClick={() => setCurrentCaseId(c.id)}
                          className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                            isActiveFile
                              ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 cursor-default'
                              : 'bg-cyber-light hover:bg-cyber-blue hover:text-white border border-cyber-border text-slate-300'
                          }`}
                        >
                          {isActiveFile ? 'Active File' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">
                    No cases match the query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-cyber-darker border border-cyber-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-cyber-border flex justify-between items-center bg-cyber-dark/50">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 size={16} className="text-cyber-blue" />
                Initialize Criminal Case File
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Case Name / Operation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Hawala Syndicate"
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-200 text-xs focus:outline-none focus:border-cyber-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Crime Category</label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value)}
                    className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-200 text-xs focus:outline-none focus:border-cyber-blue"
                  >
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Drug Trafficking">Drug Trafficking</option>
                    <option value="Cyber Crime & Ransomware">Cyber Crime & Ransomware</option>
                    <option value="Smuggling & Syndicate">Smuggling & Syndicate</option>
                    <option value="Anti-Terror Operation">Anti-Terror Operation</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Threat Priority</label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value)}
                    className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-200 text-xs focus:outline-none focus:border-cyber-blue"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Case Brief / Intelligence Abstract</label>
                <textarea
                  rows="4"
                  placeholder="Describe initial reports, intelligence sources, suspects..."
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-200 text-xs focus:outline-none focus:border-cyber-blue resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-bold bg-cyber-light text-slate-400 hover:text-white border border-cyber-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-bold bg-cyber-blue hover:bg-cyber-blue-dark text-slate-100"
                >
                  Generate Case file
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
