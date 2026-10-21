import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Shield, Code, Palette, BarChart3 } from 'lucide-react';
import { VerificationBadge } from './StatusIndicator.jsx';
import { SkillMatchBreakdown } from './SkillMatchBreakdown.jsx';
import { formatETB, formatDate } from '../utils/formatters.js';

const CATEGORY_CONFIG = {
  Cybersecurity: {
    icon: Shield,
    color: 'text-amber-400 bg-amber-950/40 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    label: 'Cybersecurity',
  },
  'Website Development': {
    icon: Code,
    color: 'text-orange-400 bg-orange-950/40 border-orange-500/40 shadow-[0_0_10px_rgba(246,111,20,0.25)]',
    label: 'Website Development',
  },
  'UI/UX Design': {
    icon: Palette,
    color: 'text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    label: 'UI/UX Design',
  },
  'Data Analysis': {
    icon: BarChart3,
    color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    label: 'Data Analysis',
  },
};

export function InternshipCard({ internship, onToggleSave, showMatch = true }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const category = internship.category || 'Website Development';
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Website Development'];
  const CategoryIcon = categoryConfig.icon;

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="redsun-box spotlight-card p-6 flex flex-col justify-between gap-5 relative group overflow-hidden"
    >
      {/* Category Accent Indicator Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f66f14] via-[#ffad75] to-[#ea384c] opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-3 relative z-10">
        {/* Top Header: Category Tag & Save Action */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${categoryConfig.color}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{categoryConfig.label}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#161d31] border border-slate-700/60">
              {internship.work_mode}
            </span>
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(internship.id)}
              title={internship.is_saved ? 'Remove from saved' : 'Save internship'}
              className={`p-2 rounded-lg border transition-all shrink-0 ${
                internship.is_saved
                  ? 'border-[#f66f14] text-[#f66f14] bg-[#f66f14]/20 shadow-[0_0_12px_rgba(246,111,20,0.3)]'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-[#f66f14]/60 bg-[#101524]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title & Company */}
        <div className="space-y-1">
          <Link
            to={`/internships/${internship.id}`}
            className="text-lg font-bold text-white group-hover:text-[#ffad75] transition-colors block leading-snug font-display"
          >
            {internship.title}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <Link
              to={`/companies/${internship.company_id}`}
              className="font-medium text-slate-300 hover:text-[#f66f14] transition-colors"
            >
              {internship.company_name}
            </Link>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <VerificationBadge status={internship.company_verification_status} />
          </div>
        </div>

        {/* Metadata Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono tabular-nums">
          <span className="px-2 py-0.5 rounded bg-[#101524] border border-[#f77218]/25 text-slate-300">
            📍 {internship.location}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#101524] border border-[#f77218]/25 text-slate-300">
            ⏳ {internship.duration}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#f66f14]/15 border border-[#f66f14]/40 text-[#ffad75] font-semibold">
            💰 {formatETB(internship.stipend_amount)}
          </span>
          <span className="text-slate-400 text-[11px] ml-auto">
            Deadline: {formatDate(internship.application_deadline)}
          </span>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {internship.description}
        </p>

        {/* Required skills tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(internship.required_skills || []).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#131b2e] text-slate-200 border border-slate-700/80 group-hover:border-[#f66f14]/30 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Match Calculation & CTA */}
      <div className="pt-4 border-t border-[#f77218]/20 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div>
          {showMatch && internship.match ? (
            <SkillMatchBreakdown match={internship.match} compact />
          ) : (
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {internship.positions} {internship.positions === 1 ? 'Slot' : 'Slots'} Open ·{' '}
              {(internship.fields_of_study || []).slice(0, 2).join(' / ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {internship.application_status && (
            <span className="text-xs font-mono text-[#ffad75] font-medium px-2 py-1 rounded bg-[#f66f14]/10 border border-[#f66f14]/30">
              {internship.application_status}
            </span>
          )}
          <Link
            to={`/internships/${internship.id}`}
            className="button-glow px-4 py-2 text-xs font-semibold whitespace-nowrap"
          >
            Explore Role →
          </Link>
        </div>
      </div>
    </article>
  );
}
