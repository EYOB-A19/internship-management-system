import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Code, Palette, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';

export function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-12 bg-[#060910] text-[#f8fafc]">
        
        {/* Header */}
        <div className="space-y-3 border-b border-[#f77218]/25 pb-8 text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold text-[#f66f14] uppercase tracking-wider">
            National Technology Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display">
            About Ethio<span className="text-[#f66f14]">Intern</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Bridging the gap between Ethiopian university engineering programs and high-growth industry employers through verifiable credentials and algorithmic skill matching.
          </p>
        </div>

        {/* 2 Column Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="redsun-box p-6 sm:p-8 space-y-3 rounded-2xl">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <span className="text-[#f66f14]">01.</span>
              <span>The Problem We Solve</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              University students across Ethiopia struggle to discover legitimate, paid internships without personal connections, while tech employers cannot reliably verify student competencies. EthioIntern provides a national, verified talent marketplace.
            </p>
          </div>

          <div className="redsun-box p-6 sm:p-8 space-y-3 rounded-2xl">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <span className="text-[#f66f14]">02.</span>
              <span>Mandatory Ministry of Trade TIN Audit</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every employer must verify their commercial registration certificate and Ethiopian TIN before publishing internship postings. Students are protected from illegitimate listings and fee-seeking fraudulent agents.
            </p>
          </div>
        </div>

        {/* 4 Specialized Domains */}
        <div className="redsun-box p-6 sm:p-8 space-y-5 rounded-2xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-display">
              03. Exclusive Focus on 4 In-Demand Tech Disciplines
            </h2>
            <p className="text-xs text-slate-400">
              By concentrating specifically on Cybersecurity, Website Development, UI/UX Design, and Data Analysis, our matching engine maintains superior precision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Cybersecurity</h3>
              <p className="text-[11px] text-slate-400">
                SOC defense, OWASP penetration testing, cryptographic tokens, threat telemetry.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-orange-950/60 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Code className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Website Development</h3>
              <p className="text-[11px] text-slate-400">
                React full-stack applications, Express REST APIs, PostgreSQL optimization, Tailwind CSS.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">UI/UX Design</h3>
              <p className="text-[11px] text-slate-400">
                Figma design systems, auto-layout tokens, user testing with Ethiopian payment flows.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Data Analysis</h3>
              <p className="text-[11px] text-slate-400">
                Python Pandas pipelines, SQL cohort modeling, agricultural and credit risk analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Matching Algorithm Explainer */}
        <div className="redsun-box p-6 sm:p-8 space-y-4 rounded-2xl">
          <h2 className="text-lg font-bold text-white font-display">
            04. Deterministic Rule-Based Skill Compatibility Formula
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            EthioIntern calculates a transparent compatibility score based on verified student skills, academic level, field of study, and geographical location:
          </p>
          <div className="bg-[#060910] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 text-slate-300">
            <div className="text-slate-400">// Example Matching Logic:</div>
            <div>Student Skills: React · Node.js · PostgreSQL · OWASP · Git</div>
            <div>Posting Requirements: React [REQ] ✓ · Node.js [REQ] ✓ · PostgreSQL [REQ] ✓ · Docker [PREF] ✗</div>
            <div className="text-[#ffad75] font-bold pt-1">
              Score: (3 / 3 Required) * 80 + (0 / 1 Preferred) * 20 = 80% Core Skill Match
            </div>
          </div>
          <div className="pt-2">
            <Link
              to="/internships"
              className="button-glow px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
            >
              <span>Explore Verified Internships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
