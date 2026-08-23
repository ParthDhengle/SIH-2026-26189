import React, { useState } from 'react';
import { Plus, Search, FolderOpen, AlertCircle } from 'lucide-react';
import { initialCasesList } from '../data/mockData';

export default function Cases({ cases, setCases, setCurrentCaseId, setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new case creation
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseType, setNewCaseType] = useState('Financial Fraud');
  const [newCasePriority, setNewCasePriority] = useState('High');
  const [newCaseDesc, setNewCaseDesc] = useState('');

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!newCaseName.trim()) return;

    const caseId = `CASE-2026-0${cases.length + 1}`;
    const newCase = {
      id: caseId,
      name: newCaseName,
      type: newCaseType,
      status: "Active",
      priority: newCasePriority,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: newCaseDesc || "No description provided."
    };

    setCases([newCase, ...cases]);
    setCurrentCaseId(caseId);
    setCurrentPage('case-workspace');
    setIsModalOpen(false);

    // Reset Form
    setNewCaseName('');
    setNewCaseType('Financial Fraud');
    setNewCasePriority('High');
    setNewCaseDesc('');
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectCase = (caseId) => {
    setCurrentCaseId(caseId);
    setCurrentPage('case-workspace');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1 bg-cyber-darkest text-slate-800">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wider">
            Case Files Directory
          </h2>
          <p className="text-xs text-slate-500">
            Audit cataloged folders or select an active file to enter the Investigation Workspace.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyber-blue hover:bg-cyber-blue-dark text-white rounded-lg text-xs font-bold transition-all shadow"
        >
          <Plus size={16} /> Create Case
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-cyber-darker p-4 rounded-xl border border-cyber-border shadow-sm">
        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, operation name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-cyber-dark border border-cyber-border rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyber-blue transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['All', 'Active', 'Under Review', 'Solved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                statusFilter === status
                  ? 'bg-cyber-blue/15 border-cyber-blue text-cyber-blue'
                  : 'border-cyber-border text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-cyber-darker rounded-xl border border-cyber-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyber-border bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                <th className="p-4">Case ID</th>
                <th className="p-4">Operation Title</th>
                <th className="p-4">Crime Category</th>
                <th className="p-4">Risk Rating</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/80 text-xs">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-all">
                  <td className="p-4 font-mono font-bold text-cyber-blue">{c.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</div>
                  </td>
                  <td className="p-4 text-slate-600 font-semibold">{c.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      c.priority === 'Critical' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/20' :
                      (c.priority === 'High' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/20' : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20')
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono">{c.lastUpdated}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === 'Active' ? 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20' :
                      (c.status === 'Solved' ? 'bg-cyber-success/10 text-cyber-success border-cyber-success/20' : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20')
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
                      onClick={() => handleSelectCase(c.id)}
                      className="px-3 py-1.5 bg-cyber-blue hover:bg-cyber-blue-dark text-white rounded text-[10px] font-bold transition-all flex items-center gap-1.5 mx-auto"
                    >
                      <FolderOpen size={12} /> Investigate
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium font-mono text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-cyber-darker border border-cyber-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-cyber-border flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={16} className="text-cyber-blue" />
                Initialize Criminal Case File
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Case Name / Operation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Gold Smuggle"
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-700 text-xs focus:outline-none focus:border-cyber-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Crime Category</label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value)}
                    className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-700 text-xs focus:outline-none focus:border-cyber-blue"
                  >
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Drug Trafficking">Drug Trafficking</option>
                    <option value="Cyber Crime & Ransomware">Cyber Crime & Ransomware</option>
                    <option value="Smuggling & Syndicate">Smuggling & Syndicate</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Threat Priority</label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value)}
                    className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-700 text-xs focus:outline-none focus:border-cyber-blue"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Case Brief / Intelligence Abstract</label>
                <textarea
                  rows="4"
                  placeholder="Describe initial reports, targets, and intelligence source files..."
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-700 text-xs focus:outline-none focus:border-cyber-blue resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-cyber-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-bold bg-cyber-blue hover:bg-cyber-blue-dark text-white shadow"
                >
                  Generate Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
