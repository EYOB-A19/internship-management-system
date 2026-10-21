import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Shield, Code, Palette, BarChart3, Filter } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { InternshipCard } from '../../components/InternshipCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { apiFetch } from '../../services/apiClient.js';

const DOMAIN_TABS = [
  { id: 'ALL', label: 'All 4 Disciplines', icon: null },
  { id: 'Cybersecurity', label: 'Cybersecurity', icon: Shield },
  { id: 'Website Development', label: 'Website Development', icon: Code },
  { id: 'UI/UX Design', label: 'UI/UX Design', icon: Palette },
  { id: 'Data Analysis', label: 'Data Analysis', icon: BarChart3 },
];

export function InternshipsPage() {
  const { user, catalog } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [universityId, setUniversityId] = useState(searchParams.get('university_id') || '');
  const [field, setField] = useState(searchParams.get('field') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('work_mode') || '');
  const [minStipend, setMinStipend] = useState(searchParams.get('min_stipend') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified_only') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const debouncedKeyword = useDebounce(keyword, 280);

  const [internships, setInternships] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.set('category', category);
      if (debouncedKeyword) params.set('keyword', debouncedKeyword);
      if (location) params.set('location', location);
      if (universityId) params.set('university_id', universityId);
      if (field) params.set('field', field);
      if (skill) params.set('skill', skill);
      if (workMode) params.set('work_mode', workMode);
      if (minStipend) params.set('min_stipend', minStipend);
      if (verifiedOnly) params.set('verified_only', 'true');
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '8');

      setSearchParams(params, { replace: true });
      const res = await apiFetch(`/internships?${params.toString()}`);
      setInternships(res.data || []);
      setPagination(
        res.pagination || { page: 1, limit: 8, total: (res.data || []).length, totalPages: 1 }
      );
    } catch (err) {
      setError(err.message || 'Failed to load internships.');
    } finally {
      setLoading(false);
    }
  }, [
    category,
    debouncedKeyword,
    location,
    universityId,
    field,
    skill,
    workMode,
    minStipend,
    verifiedOnly,
    sort,
    page,
    setSearchParams,
  ]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleResetFilters = () => {
    setCategory('ALL');
    setKeyword('');
    setLocation('');
    setUniversityId('');
    setField('');
    setSkill('');
    setWorkMode('');
    setMinStipend('');
    setVerifiedOnly(false);
    setSort('newest');
    setPage(1);
  };

  const handleToggleSave = async (internshipId) => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    try {
      await apiFetch(`/students/saved/${internshipId}`, { method: 'POST' });
      fetchInternships();
    } catch {
      // Ignore error
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 bg-[#060910] text-[#f8fafc]">
        
        {/* Page Header with Solar Amber Accent */}
        <div className="border-b border-[#f77218]/25 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#f66f14] uppercase tracking-wider">
              National Tech Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Specialized Ethiopian Internships
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Verified opportunities restricted strictly to Cybersecurity, Website Development, UI/UX Design, and Data Analysis.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-400 bg-[#111728] px-3 py-1.5 rounded-lg border border-[#f77218]/30">
            {pagination.total} Verified Openings Listed
          </div>
        </div>

        {/* 4 Specialized Domain Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {DOMAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategory(tab.id);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? 'button-glow text-white shadow-[0_0_20px_rgba(246,111,20,0.5)]'
                    : 'bg-[#0d1222] text-slate-300 border border-slate-800 hover:border-[#f77218]/40 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Control Box */}
        <div className="redsun-box p-6 space-y-4 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 text-[#f66f14] absolute left-3.5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="Search role, skills, or company (React, OWASP, Figma, Python)..."
                className="w-full pl-9 pr-3 py-2.5 text-xs text-white bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14] placeholder:text-slate-500"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs text-slate-200 bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14]"
              >
                <option value="">All Ethiopian Cities</option>
                {(catalog.locations || []).map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0c101d] text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <select
                value={universityId}
                onChange={(e) => {
                  setUniversityId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs text-slate-200 bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14]"
              >
                <option value="">University Compatibility (All)</option>
                {(catalog.universities || []).map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#0c101d] text-white">
                    {u.short_name} — {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            <select
              value={workMode}
              onChange={(e) => {
                setWorkMode(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14]"
            >
              <option value="">Work Mode (All)</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              value={minStipend}
              onChange={(e) => {
                setMinStipend(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14]"
            >
              <option value="">Minimum Monthly Stipend</option>
              <option value="5000">5,000+ ETB</option>
              <option value="7500">7,500+ ETB</option>
              <option value="8500">8,500+ ETB</option>
              <option value="9000">9,000+ ETB</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="relevant">Sort: Best Match Score</option>
              <option value="stipend">Sort: Highest Stipend</option>
              <option value="deadline">Sort: Application Deadline</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 bg-[#060910] border border-slate-700/80 rounded-xl cursor-pointer hover:border-[#f66f14]/50">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-slate-700 text-[#f66f14] focus:ring-[#f66f14] accent-[#f66f14]"
              />
              <span className="font-semibold text-emerald-400">✓ TIN Verified Only</span>
            </label>

            <button
              type="button"
              onClick={handleResetFilters}
              className="button-simple px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Results List */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/40 text-xs text-red-300 font-mono">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-slate-500">
            Filtering verified Ethiopian internships in {category === 'ALL' ? 'all 4 tracks' : category}...
          </div>
        ) : internships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl redsun-box space-y-4">
            <Filter className="w-8 h-8 text-[#f66f14] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-white font-display">
              No matching internships found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search criteria, selecting a different specialized discipline, or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="button-glow px-4 py-2 text-xs font-bold inline-block"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="button-simple px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-mono text-slate-400 px-3">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="button-simple px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
