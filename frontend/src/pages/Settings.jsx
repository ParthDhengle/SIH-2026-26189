import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, UserCheck, Key, Database } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1 bg-cyber-darkest text-slate-800">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wider">
            System Settings
          </h2>
          <p className="text-xs text-slate-500">
            Configure investigator credentials, database keys, and synchronization.
          </p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Card 1: Investigator Identity */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-cyber-border pb-2">
            <UserCheck size={16} className="text-cyber-blue" />
            Investigator Identity
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Agent Name</label>
              <input 
                type="text" 
                disabled 
                value="Agent Mayuri" 
                className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-700 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Department Profile</label>
              <input 
                type="text" 
                disabled 
                value="Senior Crime Analyst" 
                className="w-full p-2 bg-cyber-dark border border-cyber-border rounded text-slate-700 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Security & Encryption */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-cyber-border pb-2">
            <Key size={16} className="text-cyber-blue" />
            Security & Encryption keys
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-cyber-border">
              <div>
                <span className="font-bold text-slate-700 block">SHA-256 Ledger Verification</span>
                <span className="text-[10px] text-slate-500">Auto-verify hashes on evidence files downloads.</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyber-success/15 text-cyber-success border border-cyber-success/30">
                ACTIVE
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-cyber-border">
              <div>
                <span className="font-bold text-slate-700 block">Decryption Vault Token</span>
                <span className="text-[10px] text-slate-500">Decrypt FIR and call intercept records on-the-fly.</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30">
                CONNECTED
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Database Node status */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-cyber-border pb-2">
            <Database size={16} className="text-cyber-blue" />
            Database Synchronization
          </h3>
          <div className="flex items-center gap-3 bg-cyber-dark p-3 rounded border border-cyber-border">
            <div className="w-2.5 h-2.5 rounded-full bg-cyber-success animate-ping"></div>
            <div className="text-xs">
              <span className="font-bold text-slate-700 block">Express Database Service Connection</span>
              <span className="text-[10px] text-slate-400">Mocking offline database nodes. System is ready to bind with real APIs.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
