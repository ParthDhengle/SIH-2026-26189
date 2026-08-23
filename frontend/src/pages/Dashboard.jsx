import React from 'react';
import { 
  ShieldAlert, 
  Users, 
  GitCommit, 
  Activity, 
  FileText, 
  ArrowRight,
  TrendingUp,
  FolderLock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { casesData } from '../data/mockData';

export default function Dashboard({ cases, setCurrentPage, setCurrentCaseId }) {
  const casesList = cases.map(c => ({
    id: c.id,
    name: c.name,
    summary: c.description,
    risk: c.priority,
    riskScore: c.priority === 'High' ? 82 : 58
  }));
  const activeCasesCount = casesList.length;

  // Aggregate stats across all cases (mock counts)
  const totalPOIs = 10;
  const totalConnections = 26;
  const totalPatterns = 4;

  // Recharts Chart Mock Data: Connections found over the week
  const connectionsTrendData = [
    { day: "Mon", count: 4 },
    { day: "Tue", count: 9 },
    { day: "Wed", count: 14 },
    { day: "Thu", count: 18 },
    { day: "Fri", count: 21 },
    { day: "Sat", count: 23 },
    { day: "Sun", count: totalConnections }
  ];

  // Threat score mapping
  const avgRisk = Math.round(casesList.reduce((sum, c) => sum + c.riskScore, 0) / activeCasesCount);
  const gaugeData = [
    { name: 'Risk', value: avgRisk },
    { name: 'Safe', value: 100 - avgRisk }
  ];
  const GAUGE_COLORS = ['#dc2626', '#f1f5f9']; // Red vs slate-light

  const handleOpenCase = (caseId) => {
    setCurrentCaseId(caseId);
    setCurrentPage(`case-workspace`);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1 bg-cyber-darkest text-slate-800">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wider">
            National Surveillance Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Real-time multi-case connection graphs, suspicious patterns, and intelligence feeds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-cyber-blue/10 px-3 py-1.5 border border-cyber-blue/20 rounded text-cyber-blue font-mono font-bold">
          <Activity size={14} className="animate-spin" />
          SYSTEM ONLINE • REAL-TIME MOCK DATA
        </div>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Files</p>
            <h3 className="text-2xl font-black text-slate-800 font-mono">{activeCasesCount}</h3>
            <p className="text-[10px] text-cyber-blue flex items-center gap-1 font-bold">
              <TrendingUp size={10} /> +1 Net change
            </p>
          </div>
          <div className="bg-cyber-blue/10 text-cyber-blue p-3 rounded-lg border border-cyber-blue/20">
            <FileText size={20} />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total POIs</p>
            <h3 className="text-2xl font-black text-slate-800 font-mono">{totalPOIs}</h3>
            <p className="text-[10px] text-cyber-warning font-bold">
              Surveillance Active
            </p>
          </div>
          <div className="bg-cyber-warning/10 text-cyber-warning p-3 rounded-lg border border-cyber-warning/20">
            <Users size={20} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Connections</p>
            <h3 className="text-2xl font-black text-slate-800 font-mono">{totalConnections}</h3>
            <p className="text-[10px] text-cyber-blue font-bold">
              Across Cases
            </p>
          </div>
          <div className="bg-cyber-blue/10 text-cyber-blue p-3 rounded-lg border border-cyber-blue/20">
            <GitCommit size={20} />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged Patterns</p>
            <h3 className="text-2xl font-black text-cyber-red font-mono">{totalPatterns}</h3>
            <p className="text-[10px] text-cyber-red flex items-center gap-1 font-bold animate-pulse">
              <ShieldAlert size={10} /> Review Required
            </p>
          </div>
          <div className="bg-cyber-red/10 text-cyber-red p-3 rounded-lg border border-cyber-red/20">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* Row 2: Active Case Files Directory (Quick Access) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List panel */}
        <div className="lg:col-span-2 bg-cyber-darker p-5 rounded-xl border border-cyber-border shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Case Directory Quick Access</h4>
              <button 
                onClick={() => setCurrentPage('cases')}
                className="text-[11px] font-bold text-cyber-blue hover:underline"
              >
                View Full Directory
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {casesList.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => handleOpenCase(c.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-cyber-border rounded-lg bg-slate-50/50 hover:bg-slate-50 cursor-pointer hover:border-cyber-blue/35 transition-all group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FolderLock size={14} className="text-slate-400 group-hover:text-cyber-blue transition-colors" />
                      <span className="text-xs font-bold text-cyber-blue font-mono">{c.id}</span>
                      <span className="text-xs font-bold text-slate-800">{c.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate max-w-[400px]">{c.summary}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      c.risk === 'High' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/20' : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20'
                    }`}>
                      {c.risk} Risk
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 group-hover:text-cyber-blue transition-colors">
                      Open <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threat Gauge */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border shadow-sm flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between border-b border-cyber-border pb-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Average Threat Risk</h4>
            <span className="text-[9px] text-slate-400 font-mono">Ledger Level</span>
          </div>

          <div className="relative w-full h-40 flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index % GAUGE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-3xl font-black text-cyber-red font-mono">{avgRisk}%</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Threat Index</span>
            </div>
          </div>

          <div className="w-full bg-slate-50 border border-cyber-border rounded p-2.5 mt-2">
            <p className="text-[10px] text-slate-500 text-center font-bold">
              Cognitive monitoring maps {totalPOIs} POIs and {totalConnections} connections.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Connection Discovery Trend */}
      <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
          <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Aggregated Network Growth Rate</h4>
          <span className="text-[10px] text-cyber-blue font-mono font-bold">+26 Total Links Cataloged</span>
        </div>

        <div className="h-44 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={connectionsTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCountLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
                labelStyle={{ color: '#475569' }}
              />
              <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCountLight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
