import React from 'react';
import { 
  ShieldAlert, 
  Users, 
  GitCommit, 
  Activity, 
  FileText, 
  ArrowRight,
  TrendingUp
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
import { timelineEvents, suspiciousPatterns } from '../data/mockData';

export default function Dashboard({ currentCase, cases, setCurrentPage }) {
  // Stats
  const activeCasesCount = cases.filter(c => c.status === 'Active').length;
  
  // Chart Mock Data: Connections found over the week
  const connectionsTrendData = [
    { day: "Mon", count: 3 },
    { day: "Tue", count: 5 },
    { day: "Wed", count: 4 },
    { day: "Thu", count: 8 },
    { day: "Fri", count: 9 },
    { day: "Sat", count: 11 },
    { day: "Sun", count: 12 }
  ];

  // Risk Gauge Data
  const riskScore = currentCase?.priority === 'Critical' ? 95 : (currentCase?.priority === 'High' ? 82 : 54);
  const gaugeData = [
    { name: 'Risk', value: riskScore },
    { name: 'Safe', value: 100 - riskScore }
  ];
  const GAUGE_COLORS = ['#ef4444', '#1f2937']; // red vs gray

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] flex-1">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wider">
            Surveillance & Connections Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Real-time analytics and neural relationship indicators for case file.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-cyber-blue/10 px-3 py-1.5 border border-cyber-blue/30 rounded text-cyber-blue font-mono">
          <Activity size={14} className="animate-spin" />
          SYSTEM LIVE • SYNC COMPLETED
        </div>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden group hover:border-cyber-blue/50 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Cases</p>
            <h3 className="text-2xl font-black text-slate-200 font-mono">{activeCasesCount}</h3>
            <p className="text-[10px] text-cyber-blue flex items-center gap-1 font-semibold">
              <TrendingUp size={10} /> +1 New this week
            </p>
          </div>
          <div className="bg-cyber-blue/15 text-cyber-blue p-3 rounded-lg border border-cyber-blue/20">
            <FileText size={20} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-blue/5 rounded-full blur-2xl group-hover:bg-cyber-blue/10 transition-colors"></div>
        </div>

        {/* Stat 2 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden group hover:border-cyber-blue/50 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suspects (POI)</p>
            <h3 className="text-2xl font-black text-slate-200 font-mono">4</h3>
            <p className="text-[10px] text-cyber-warning flex items-center gap-1 font-semibold">
              Under Surveillance
            </p>
          </div>
          <div className="bg-cyber-warning/15 text-cyber-warning p-3 rounded-lg border border-cyber-warning/20">
            <Users size={20} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-warning/5 rounded-full blur-2xl transition-colors"></div>
        </div>

        {/* Stat 3 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden group hover:border-cyber-blue/50 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Connections</p>
            <h3 className="text-2xl font-black text-slate-200 font-mono">12</h3>
            <p className="text-[10px] text-cyber-blue flex items-center gap-1 font-semibold">
              Graph Relations
            </p>
          </div>
          <div className="bg-cyber-blue/15 text-cyber-blue p-3 rounded-lg border border-cyber-blue/20">
            <GitCommit size={20} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-blue/5 rounded-full blur-2xl transition-colors"></div>
        </div>

        {/* Stat 4 */}
        <div className="bg-cyber-darker p-4 rounded-xl border border-cyber-border flex items-center justify-between relative overflow-hidden group hover:border-cyber-red/50 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suspicious Patterns</p>
            <h3 className="text-2xl font-black text-cyber-red font-mono">3</h3>
            <p className="text-[10px] text-cyber-red flex items-center gap-1 font-semibold animate-pulse">
              <ShieldAlert size={10} /> Needs Immediate Review
            </p>
          </div>
          <div className="bg-cyber-red/15 text-cyber-red p-3 rounded-lg border border-cyber-red/20">
            <ShieldAlert size={20} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-red/5 rounded-full blur-2xl transition-colors"></div>
        </div>
      </div>

      {/* Row 2: Case Summary and Connection Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Case Summary Card */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border flex flex-col justify-between relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono">
                Active File Details
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                currentCase?.priority === 'Critical' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30' : 'bg-cyber-warning/20 text-cyber-warning border border-cyber-warning/30'
              }`}>
                {currentCase?.priority} Priority
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-200">{currentCase?.name}</h4>
              <p className="text-xs text-slate-400 font-mono">{currentCase?.id} • {currentCase?.type}</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-cyber-dark/50 p-3 rounded border border-cyber-border/40 font-sans">
              {currentCase?.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-cyber-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Last Updated</span>
              <span className="text-xs text-slate-300 font-semibold font-mono">{currentCase?.lastUpdated}</span>
            </div>
            <button 
              onClick={() => setCurrentPage('cases')}
              className="text-xs font-bold text-cyber-blue hover:text-white flex items-center gap-1 group transition-all"
            >
              Manage Case File <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Case Threat & Risk Score Radial Gauge */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between border-b border-cyber-border/50 pb-2">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Case Threat Index</h4>
            <span className="text-[10px] text-slate-500 font-mono">Radial Level</span>
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
              <span className="text-3xl font-black text-cyber-red font-mono">{riskScore}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Risk Score</span>
            </div>
          </div>

          <div className="w-full bg-cyber-red/5 border border-cyber-red/20 rounded p-2.5 mt-2">
            <p className="text-[11px] text-cyber-red text-center font-semibold">
              Warning: Threat indicators exceed safety parameters. Active monitoring required.
            </p>
          </div>
        </div>

        {/* Connections Found Over Time Chart */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-cyber-border/50 pb-2">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Neural Link Discovery Rate</h4>
            <span className="text-[10px] text-cyber-blue font-mono font-bold">+28% Velocity</span>
          </div>

          <div className="h-36 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={connectionsTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <p className="text-[10px] text-slate-500 font-mono text-center">
            New associations cataloged chronologically.
          </p>
        </div>
      </div>

      {/* Row 3: Recent activity (Timeline) & Connection Path Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Investigation Activity */}
        <div className="lg:col-span-2 bg-cyber-darker p-5 rounded-xl border border-cyber-border flex flex-col">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-cyber-blue" />
              Recent System Activity logs
            </h4>
            <button 
              onClick={() => setCurrentPage('timeline')}
              className="text-xs text-cyber-blue font-bold hover:underline"
            >
              View Full Timeline
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-1">
            {timelineEvents.slice(0, 3).map((evt) => (
              <div key={evt.id} className="flex gap-3 items-start p-2.5 rounded bg-cyber-dark/45 border border-cyber-border/40 hover:border-cyber-border transition-colors">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold border ${
                  evt.severity === 'Critical' ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/30' : 
                  (evt.severity === 'High' ? 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/30' : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30')
                }`}>
                  {evt.severity}
                </span>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-200">{evt.type} • {evt.entity}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Small Network Overview / Relationship Preview */}
        <div className="bg-cyber-darker p-5 rounded-xl border border-cyber-border flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              High-Risk Association Path
            </h4>
            <span className="text-[10px] text-cyber-red font-mono font-bold">91% Conf</span>
          </div>

          {/* Graphical link illustration */}
          <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-4">
            {/* Source Node */}
            <div className="w-full flex items-center justify-between bg-cyber-dark/50 border border-cyber-border p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyber-blue"></div>
                <span className="text-xs font-extrabold text-slate-300">Rahul Sharma</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Person</span>
            </div>

            {/* Link line with label */}
            <div className="flex flex-col items-center text-center -my-2 relative w-full h-8">
              <div className="h-full w-[1.5px] bg-cyber-red-dark animate-pulse"></div>
              <div className="absolute top-1/2 -translate-y-1/2 bg-cyber-dark border border-cyber-red/25 px-2 py-0.5 rounded text-[8px] text-cyber-red font-bold font-mono">
                COMMUNICATION OVERLAP (14 CALLS)
              </div>
            </div>

            {/* Target Node */}
            <div className="w-full flex items-center justify-between bg-cyber-dark/50 border border-cyber-red/30 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyber-red"></div>
                <span className="text-xs font-extrabold text-slate-300">Amit Verma</span>
              </div>
              <span className="text-[10px] text-cyber-red font-mono font-bold">Suspect</span>
            </div>
          </div>

          <button 
            onClick={() => setCurrentPage('network')}
            className="w-full py-2 bg-cyber-blue hover:bg-cyber-blue-dark transition-colors rounded-lg text-xs font-bold text-slate-100 text-center"
          >
            Launch Interactive Network Graph
          </button>
        </div>
      </div>
    </div>
  );
}
