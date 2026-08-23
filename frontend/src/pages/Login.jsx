import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, User, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Mock validation checks
    if (email === 'investigator@demo.com' && password === 'invest123') {
      onLoginSuccess();
    } else {
      setErrorMsg('Invalid investigator credentials.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 animate-in fade-in duration-300">
      
      {/* Left side: Branding & Network Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Abstract connection nodes background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Node 1 */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
          <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-blue-400"></div>
          
          {/* Node 2 */}
          <div className="absolute top-1/2 left-2/3 w-2.5 h-2.5 rounded-full bg-red-500"></div>
          
          {/* Node 3 */}
          <div className="absolute top-2/3 left-1/3 w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          
          {/* Connecting line overlays */}
          <svg className="w-full h-full">
            <line x1="25%" y1="25%" x2="66%" y2="50%" stroke="#475569" strokeWidth="1.5" strokeDasharray="5,5" />
            <line x1="25%" y1="25%" x2="33%" y2="66%" stroke="#2563eb" strokeWidth="2" />
            <line x1="66%" y1="50%" x2="33%" y2="66%" stroke="#475569" strokeWidth="1" />
          </svg>
        </div>

        {/* Top Header Logo */}
        <div className="flex items-center gap-2 z-10">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-widest uppercase">Investigate AI</h1>
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">National Security Systems</span>
          </div>
        </div>

        {/* Brand narrative block */}
        <div className="space-y-4 max-w-md z-10 my-auto">
          <h2 className="text-3xl font-black leading-tight text-white uppercase tracking-wide">
            Deciphering Criminal Network Associations
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Harnessing cognitive node maps and call detail records correlation to map syndicate threat matrices instantly. Authorized investigative personnel portal.
          </p>
          <div className="flex gap-4 pt-2 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              91% Trace Precision
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Analytics
            </div>
          </div>
        </div>

        {/* Footer legal disclaimer */}
        <div className="z-10 text-[10px] text-slate-400 font-mono">
          © 2026 Ministry of Security • SIH Portal
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header titles */}
          <div className="space-y-1">
            {/* Small screen mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded text-white shadow">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">Investigate AI</span>
            </div>

            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Authorized Portal Access</span>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Investigator Login</h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access the Connection Analysis engine.
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold flex items-center gap-2 animate-in shake duration-200">
              <ShieldCheck size={14} className="shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* ID Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Official ID / Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={14} className="text-slate-400" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="investigator@demo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-cyber-border rounded-lg text-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo password is: invest123')}
                  className="text-[9px] font-bold text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={14} className="text-slate-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-cyber-border rounded-lg text-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 border border-cyber-border rounded text-blue-600 bg-slate-50 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                Remember my investigator token
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-cyber-blue hover:bg-cyber-blue-dark text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} /> Sign In
            </button>
          </form>

          {/* Footers Disclaimers */}
          <div className="pt-6 border-t border-slate-100 text-center space-y-2">
            <span className="text-[9px] uppercase font-mono font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded">
              AUTHORIZED PERSONNEL ONLY
            </span>
            <p className="text-[10px] text-slate-400 max-w-[260px] mx-auto leading-normal">
              Your network access is protected, logged, and monitored under Federal Intelligence Directive logs.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
