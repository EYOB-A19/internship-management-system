import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, MapPin, CheckCircle2 } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { VerificationBadge } from '../../components/StatusIndicator.jsx';
import { apiFetch } from '../../services/apiClient.js';

export function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (verifiedOnly) params.set('verified_only', 'true');
        const res = await apiFetch(`/companies?${params.toString()}`);
        if (active) setCompanies(res.data || []);
      } catch {
        // Ignore error
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [search, verifiedOnly]);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 bg-[#060910] text-[#f8fafc]">
        
        {/* Header */}
        <div className="border-b border-[#f77218]/25 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#f66f14] uppercase tracking-wider">
              Employer Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Ethiopian Tech Employers
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Browse legitimate companies offering internships in Cybersecurity, Web Development, UI/UX Design, and Data Analysis.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-[#111728] px-3 py-1.5 rounded-xl border border-emerald-500/30 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-slate-700 text-[#f66f14] focus:ring-[#f66f14] accent-[#f66f14]"
            />
            <span>✓ Verified Employers Only</span>
          </label>
        </div>

        {/* Search Bar */}
        <div className="redsun-box p-3 flex items-center gap-3 rounded-xl">
          <Search className="w-4 h-4 text-[#f66f14] ml-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name, industry, or city (Chapa, CyberGuard, Bole, Addis Ababa)..."
            className="w-full text-xs sm:text-sm text-white bg-transparent focus:outline-none placeholder:text-slate-500"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-slate-500">
            Loading verified Ethiopian companies...
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((c) => (
              <div
                key={c.id}
                className="redsun-box p-6 rounded-2xl flex flex-col justify-between space-y-4 group hover:border-[#f66f14] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#182035] to-[#121727] border border-[#f77218]/30 flex items-center justify-center font-bold text-lg text-white font-display shadow-md">
                      {c.company_name.slice(0, 2).toUpperCase()}
                    </div>
                    <VerificationBadge status={c.verification_status} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white font-display group-hover:text-[#ffad75] transition-colors">
                      {c.company_name}
                    </h2>
                    <div className="text-xs text-[#f66f14] font-mono mt-0.5">
                      {c.industry}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.location}</span>
                    </span>
                    <span className="text-[#ffad75]">
                      {c.active_internships_count || 2} Open Roles
                    </span>
                  </div>

                  <Link
                    to={`/companies/${c.id}`}
                    className="button-simple w-full py-2 text-xs font-semibold text-center block text-slate-200 hover:text-white"
                  >
                    View Company Profile & Openings →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl redsun-box text-xs text-slate-400 font-mono">
            No employers found matching your search.
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
