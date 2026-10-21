import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Globe, MapPin, CheckCircle2, Calendar } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { VerificationBadge } from '../../components/StatusIndicator.jsx';
import { InternshipCard } from '../../components/InternshipCard.jsx';
import { apiFetch } from '../../services/apiClient.js';
import { formatDate } from '../../utils/formatters.js';

export function CompanyDetailsPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch(`/companies/${id}`);
        if (active) setCompany(res.data);
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
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-6 py-16 animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/2" />
          <div className="h-40 bg-[#0c101d] border border-slate-800 rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (!company) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-3">
          <h1 className="text-xl font-bold text-white font-display">Company Not Found</h1>
          <Link to="/companies" className="button-glow px-4 py-2 text-xs font-bold inline-block">
            ← Return to Companies
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 bg-[#060910] text-[#f8fafc]">
        
        {/* Header Breadcrumb */}
        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <Link to="/companies" className="hover:text-[#f66f14] transition-colors">
            Companies
          </Link>
          <span>/</span>
          <span className="text-[#ffad75]">{company.company_name}</span>
        </div>

        {/* Company Profile Box */}
        <div className="redsun-box p-6 sm:p-8 space-y-5 rounded-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                {company.company_name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-slate-400 font-mono">
                <span className="text-[#f66f14] font-semibold">{company.industry}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>📍 {company.location}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>👥 {company.company_size}</span>
                {company.founded_year && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>Founded {company.founded_year}</span>
                  </>
                )}
              </div>
            </div>
            <VerificationBadge status={company.verification_status} />
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {company.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#f77218]/15 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-mono">Headquarters Address</span>
              <span className="text-slate-200 font-medium">{company.address || company.location}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-mono">Official Website & Contact</span>
              <span className="text-[#ffad75] font-mono">
                {company.website || company.email}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-mono">Ministry of Trade TIN Audit</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {company.verification_status === 'APPROVED'
                  ? `Verified ${formatDate(company.verified_at)}`
                  : 'Pending Admin Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Company Openings */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Published Internships at {company.company_name}
              </h2>
              <p className="text-xs text-slate-400">
                Verified opportunities currently open for student applications.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {company.internships?.length || 0} Roles Open
            </span>
          </div>

          {company.internships?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {company.internships.map((item) => (
                <InternshipCard key={item.id} internship={item} showMatch={false} />
              ))}
            </div>
          ) : (
            <div className="redsun-box p-10 text-center text-xs text-slate-400 font-mono rounded-2xl">
              No active internships currently published by this organization.
            </div>
          )}
        </div>

      </div>
    </PublicLayout>
  );
}
