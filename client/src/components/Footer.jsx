import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-[#f77218]/20 bg-[#060910] text-slate-400 mt-24 relative overflow-hidden">
      {/* Subtle bottom lighting flare */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-t from-[#f66f14]/10 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm relative z-10">
        <div className="md:col-span-2 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f66f14] shadow-[0_0_10px_#f66f14]" />
            <span className="text-xl font-bold text-white font-display">
              Ethio<span className="text-[#f66f14]">Intern</span>
            </span>
          </div>
          <p className="max-w-md text-xs text-slate-400 leading-relaxed">
            Ethiopia's premier university-to-industry internship platform.
            Connecting top student engineers and designers with verified tech
            companies strictly focused on Cybersecurity, Website Development,
            UI/UX Design, and Data Analysis.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "Cybersecurity",
              "Website Development",
              "UI/UX Design",
              "Data Analysis",
            ].map((track) => (
              <span
                key={track}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#0c101d] text-slate-300 border border-[#f77218]/30 shadow-[0_0_8px_rgba(246,111,20,0.15)]"
              >
                {track}
              </span>
            ))}
          </div>
          <p className="text-[11px] font-mono text-slate-500 pt-1">
            Universities: ASTU · AAU · AASTU · Bahir Dar · Hawassa · Jimma ·
            Mekelle · Gondar · Arba Minch
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-white">
            4 Specialized Tracks
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                to="/internships?category=Cybersecurity"
                className="hover:text-[#f66f14] transition-colors flex items-center gap-1.5"
              >
                <span className="text-[#f66f14]">🛡️</span> Cybersecurity & SOC
              </Link>
            </li>
            <li>
              <Link
                to="/internships?category=Website+Development"
                className="hover:text-[#f66f14] transition-colors flex items-center gap-1.5"
              >
                <span className="text-[#f66f14]">💻</span> Website Development
              </Link>
            </li>
            <li>
              <Link
                to="/internships?category=UI%2FUX+Design"
                className="hover:text-[#f66f14] transition-colors flex items-center gap-1.5"
              >
                <span className="text-[#f66f14]">🎨</span> UI/UX Design Systems
              </Link>
            </li>
            <li>
              <Link
                to="/internships?category=Data+Analysis"
                className="hover:text-[#f66f14] transition-colors flex items-center gap-1.5"
              >
                <span className="text-[#f66f14]">📊</span> Data Analysis & BI
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-white">
            Platform Access
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                to="/internships"
                className="hover:text-white transition-colors"
              >
                Browse All Postings
              </Link>
            </li>
            <li>
              <Link
                to="/companies"
                className="hover:text-white transition-colors"
              >
                TIN-Verified Employers
              </Link>
            </li>
            <li>
              <Link
                to="/students/stu-eyob-001"
                className="hover:text-white transition-colors"
              >
                Public Student Portfolios
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-[#f66f14] transition-colors font-semibold"
              >
                Sign In to Portal →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#f77218]/15 py-5 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <span>
            © {new Date().getFullYear()} EthioIntern Platform. Ministry of
            Innovation & Technology (MInT) & Trade TIN compliance.
          </span>
          <span className="text-slate-400">
            All stipends verified in Ethiopian Birr (ETB)
          </span>
        </div>
      </div>
    </footer>
  );
}
