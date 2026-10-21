import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Code, Palette, BarChart3, User, Building2, KeyRound } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const routeByRole = (role) => {
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'COMPANY') navigate('/company/dashboard');
    else navigate('/student/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const loggedInUser = await login(email, password);
      routeByRole(loggedInUser.role);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAccount = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setSubmitting(true);
    setError(null);
    try {
      const loggedInUser = await login(demoEmail, 'Password123!');
      routeByRole(loggedInUser.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-[#060910] text-[#f8fafc]">
        
        {/* Left Panel: Primary Sign In Form */}
        <div className="md:col-span-7 redsun-box p-8 space-y-6 rounded-2xl">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#f66f14] uppercase tracking-wider">
              Secure Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Sign In to Ethio<span className="text-[#f66f14]">Intern</span>
            </h1>
            <p className="text-xs text-slate-400">
              Access your university student workspace, employer recruitment hub, or administrative command center.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/40 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@astu.edu.et or recruiter@chapa.co"
                className="w-full px-4 py-2.5 text-xs text-white bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14] placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 text-xs text-white bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14] placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="button-glow w-full py-3 px-4 text-xs font-bold disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace →'}
            </button>
          </form>

          <div className="text-xs text-slate-400 border-t border-[#f77218]/15 pt-4">
            Don’t have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#ffad75] hover:text-[#f66f14] transition-colors">
              Create a Student or Company Account
            </Link>
          </div>
        </div>

        {/* Right Panel: One-Click Quick Sign-In (Kept strictly on Sign In page as instructed) */}
        <div className="md:col-span-5 redsun-box p-6 sm:p-7 space-y-5 rounded-2xl">
          <div className="space-y-1 border-b border-[#f77218]/20 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#f66f14] font-bold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Instant Test Accounts</span>
            </div>
            <h2 className="text-base font-bold text-white font-display">
              One-Click Evaluation Sign-In
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Explore the entire platform immediately with pre-configured student, employer, or administrator roles. (Password: <code className="font-mono text-[#ffad75]">Password123!</code>)
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Student 1: Web Dev & Cybersecurity */}
            <button
              type="button"
              onClick={() => handleDemoAccount('eyob.aragie@astu.edu.et')}
              className="w-full text-left p-3 rounded-xl border border-slate-800 bg-[#060910] hover:border-[#f66f14] hover:bg-[#12182b] transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-[#ffad75] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#f66f14]" />
                  <span>Student: Eyob Aragie</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-[#ffad75] border border-[#f66f14]/30">
                  Web & Cyber
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                BSc Computer Science · ASTU (Adama)
              </div>
            </button>

            {/* Student 2: UI/UX & Data Analysis */}
            <button
              type="button"
              onClick={() => handleDemoAccount('selamawit.tadesse@aau.edu.et')}
              className="w-full text-left p-3 rounded-xl border border-slate-800 bg-[#060910] hover:border-[#f66f14] hover:bg-[#12182b] transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-[#ffad75] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span>Student: Selamawit Tadesse</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                  UI/UX & Data
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                BSc Software Engineering · AAU (Addis Ababa)
              </div>
            </button>

            {/* Company: Chapa FinTech */}
            <button
              type="button"
              onClick={() => handleDemoAccount('careers@chapa.co')}
              className="w-full text-left p-3 rounded-xl border border-slate-800 bg-[#060910] hover:border-[#f66f14] hover:bg-[#12182b] transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-[#ffad75] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Employer: Chapa Financial</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  TIN Verified
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                careers@chapa.co · Web & Cyber Recruitment
              </div>
            </button>

            {/* Company: CyberGuard SOC */}
            <button
              type="button"
              onClick={() => handleDemoAccount('soc@cyberguard.et')}
              className="w-full text-left p-3 rounded-xl border border-slate-800 bg-[#060910] hover:border-[#f66f14] hover:bg-[#12182b] transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-[#ffad75] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Employer: CyberGuard SOC</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  INSA Accredited
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                soc@cyberguard.et · Cybersecurity Operations
              </div>
            </button>

            {/* Admin Console */}
            <button
              type="button"
              onClick={() => handleDemoAccount('admin@ethiointern.et')}
              className="w-full text-left p-3 rounded-xl border border-slate-800 bg-[#060910] hover:border-[#f66f14] hover:bg-[#12182b] transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-[#ffad75] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>National Platform Admin</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  Full Authority
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                admin@ethiointern.et · Verification & Analytics
              </div>
            </button>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
