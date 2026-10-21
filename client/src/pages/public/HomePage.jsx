import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Shield, 
  Code, 
  Palette, 
  BarChart3, 
  CheckCircle2, 
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { InternshipCard } from '../../components/InternshipCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../services/apiClient.js';

const TRACKS = [
  {
    id: 'Cybersecurity',
    title: 'Cybersecurity',
    icon: Shield,
    tagline: 'Threat Intelligence, SOC Defense & Ethical Hacking',
    color: 'from-amber-500 to-red-600',
    borderColor: 'border-amber-500/40',
    accentColor: '#f66f14',
    bgBadge: 'bg-amber-950/40 text-amber-300',
    skills: ['Network Security', 'SOC Analysis', 'OWASP Top 10', 'Penetration Testing', 'Cryptography', 'Linux Security'],
    stipendRange: '8,500 – 9,500 ETB/mo',
    description: 'Protect Ethiopian financial systems, digital banking portals, and national infrastructure against evolving digital threats.',
  },
  {
    id: 'Website Development',
    title: 'Website Development',
    icon: Code,
    tagline: 'Modern Full-Stack, React, Node.js & Scalable Web Apps',
    color: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-500/40',
    accentColor: '#ffad75',
    bgBadge: 'bg-orange-950/40 text-orange-300',
    skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript', 'Tailwind CSS', 'REST APIs', 'Git'],
    stipendRange: '7,500 – 8,500 ETB/mo',
    description: 'Build responsive e-commerce portals, merchant checkout flows, and cloud-native web applications for high-growth startups.',
  },
  {
    id: 'UI/UX Design',
    title: 'UI/UX Design',
    icon: Palette,
    tagline: 'Figma Design Systems, Micro-Interactions & User Research',
    color: 'from-rose-500 to-orange-500',
    borderColor: 'border-rose-500/40',
    accentColor: '#fb7185',
    bgBadge: 'bg-rose-950/40 text-rose-300',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping', 'Usability Testing'],
    stipendRange: '7,500 – 8,000 ETB/mo',
    description: 'Craft intuitive, accessible user journeys and localized design tokens for millions of Ethiopian mobile and web users.',
  },
  {
    id: 'Data Analysis',
    title: 'Data Analysis',
    icon: BarChart3,
    tagline: 'Business Intelligence, SQL Analytics & Predictive Modeling',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/40',
    accentColor: '#34d399',
    bgBadge: 'bg-emerald-950/40 text-emerald-300',
    skills: ['Python', 'SQL', 'PostgreSQL', 'Data Analysis', 'Data Visualization', 'Pandas', 'Business Intelligence'],
    stipendRange: '8,000 – 8,500 ETB/mo',
    description: 'Extract business insights from transactional data, model credit risk, and build operational intelligence dashboards.',
  },
];

export function HomePage() {
  const { user, catalog } = useAuth();
  const navigate = useNavigate();

  const [selectedTrack, setSelectedTrack] = useState('Cybersecurity');
  const [activeTabCategory, setActiveTabCategory] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function loadFeatured() {
      try {
        const intRes = await apiFetch('/internships?limit=6&sort=relevant');
        if (active) {
          setFeaturedInternships(intRes.data || []);
        }
      } catch {
        // Ignore error
      } finally {
        if (active) setLoading(false);
      }
    }
    loadFeatured();
    return () => {
      active = false;
    };
  }, [user]);

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroRef.current.style.setProperty('--mouse-x', `${x}px`);
    heroRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location) params.set('location', location);
    if (selectedTrack) params.set('category', selectedTrack);
    navigate(`/internships?${params.toString()}`);
  };

  const handleToggleSave = async (internshipId) => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    try {
      await apiFetch(`/students/saved/${internshipId}`, { method: 'POST' });
      const refreshed = await apiFetch('/internships?limit=6&sort=relevant');
      setFeaturedInternships(refreshed.data || []);
    } catch {
      // Ignore error
    }
  };

  // Filter featured internships by tab
  const displayedInternships = activeTabCategory === 'ALL'
    ? featuredInternships
    : featuredInternships.filter((item) => (item.category || '').toLowerCase() === activeTabCategory.toLowerCase());

  const currentTrackData = TRACKS.find((t) => t.id === selectedTrack) || TRACKS[0];

  return (
    <PublicLayout>
      {/* =========================================================================
          HERO SECTION with RedSun Lighting Halo
          ========================================================================= */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative bg-[#060910] text-white overflow-hidden border-b border-[#f77218]/25 pt-12 pb-20 lg:pt-20 lg:pb-28 redsun-bg-radial"
      >
        {/* Animated Radiant Lighting Beam (RedSun Halo) */}
        <div className="redsun-hero-lighting" />

        <div className="relative max-w-5xl mx-auto px-6 space-y-8 text-center z-10">
          
          {/* Live Indicator Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111728] border border-[#f77218]/40 shadow-[0_0_15px_rgba(246,111,20,0.25)] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#f66f14] animate-ping" />
            <span className="text-[#ffad75] font-semibold">Specialized National Marketplace</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">4 In-Demand Tech Disciplines</span>
          </div>

          {/* Hero Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.15]">
              Connecting Ethiopian University Talent With Verified Internships in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffad75] via-[#f66f14] to-[#ea384c] drop-shadow-[0_0_24px_rgba(246,111,20,0.6)]">
                {selectedTrack}
              </span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Empowering students across 9 public Ethiopian universities with guaranteed stipends (7,500–9,500 ETB/mo). Strictly focused on high-demand tech roles.
            </p>
          </div>

          {/* 4 Specialized Domain Track Selector Buttons */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Select Your Specialized Domain:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRACKS.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTrack === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTrack(t.id)}
                    className={`flex flex-col items-center sm:items-start p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-[#182035] border-[#f66f14] shadow-[0_0_20px_rgba(246,111,20,0.35)] scale-[1.03]'
                        : 'bg-[#0c101d]/80 border-slate-800 hover:border-[#f77218]/40 hover:bg-[#121727]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#f66f14]' : 'text-slate-400'}`} />
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f66f14] shadow-[0_0_8px_#f66f14]" />
                      )}
                    </div>
                    <div className={`text-xs font-bold mt-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate w-full mt-0.5 font-mono">
                      {t.skills[0]} · {t.skills[1]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High-Impact Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 rounded-2xl bg-[#0c101d]/90 border border-[#f77218]/30 shadow-[0_0_25px_rgba(246,111,20,0.2)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <Search className="w-4 h-4 text-[#f66f14] shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={`Search ${selectedTrack} internships (e.g. ${currentTrackData.skills.slice(0, 3).join(', ')})...`}
                className="w-full text-xs sm:text-sm text-white placeholder:text-slate-500 bg-transparent focus:outline-none"
              />
            </div>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by Ethiopian city"
              className="px-3 py-2 text-xs text-slate-200 bg-[#121728] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14]"
            >
              <option value="">All Ethiopian Cities</option>
              {(catalog.locations || ['Addis Ababa', 'Adama', 'Bahir Dar', 'Hawassa', 'Jimma']).map((loc) => (
                <option key={loc} value={loc} className="bg-[#0c101d] text-white">
                  {loc}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="button-glow px-6 py-2.5 text-xs font-bold whitespace-nowrap"
            >
              Find {selectedTrack} Roles
            </button>
          </form>

          {/* Proof Metrics */}
          <div className="pt-4 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-[#f77218]/20">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center justify-center gap-1">
                <span>9</span>
                <span className="text-xs text-[#f66f14]">Universities</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ASTU · AAU · BDU · HU · JU
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
                <span>100%</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Verified Employers
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#ffad75] tabular-nums">
                {currentTrackData.stipendRange}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Verified Monthly Stipends
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          THE 4 SPECIALIZED PILLARS
          ========================================================================= */}
      <section className="py-20 bg-[#060910] border-b border-[#f77218]/20 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono text-[#f66f14] font-bold uppercase tracking-wider">
              Focused Discipline Excellence
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-display">
              Four Core Specialized Tracks Built for Ethiopian Industry
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We strictly exclude generic, unqualified roles. Every opening belongs to one of these 4 vital technology sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRACKS.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  className="redsun-box p-6 flex flex-col justify-between space-y-5 rounded-2xl group hover:border-[#f66f14] transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#182035] border border-[#f77218]/30 flex items-center justify-center text-[#f66f14] shadow-[0_0_12px_rgba(246,111,20,0.3)] group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f66f14]/15 text-[#ffad75] border border-[#f66f14]/30 font-semibold">
                        {track.stipendRange}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white font-display group-hover:text-[#ffad75] transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                        Core Tech Stack:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {track.skills.slice(0, 4).map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111728] text-slate-300 border border-slate-700/80"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/internships?category=${encodeURIComponent(track.id)}`}
                    className="button-simple w-full py-2 text-xs font-semibold text-center block text-slate-300 hover:text-white"
                  >
                    View Opportunities →
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          FEATURED INTERNSHIPS with Live Track Tabs & Cursor Spotlight
          ========================================================================= */}
      <section className="py-20 bg-[#090d18] border-b border-[#f77218]/20">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#f66f14] font-bold uppercase tracking-wider">
                Vetted Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Featured Verified Internship Openings
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Real opportunities from verified employers with transparent requirements and guaranteed student stipends.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0c101d] border border-slate-800">
              {['ALL', 'Cybersecurity', 'Website Development', 'UI/UX Design', 'Data Analysis'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTabCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTabCategory === cat
                      ? 'bg-gradient-to-r from-[#f66f14] to-[#ea384c] text-white shadow-[0_0_12px_rgba(246,111,20,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-[#161c2e]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Disciplines' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-slate-500">
              Loading verified Ethiopian internship listings...
            </div>
          ) : displayedInternships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedInternships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#0c101d] border border-slate-800 text-xs text-slate-400 font-mono">
              No openings currently posted under this category. Check back soon or browse all disciplines!
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              to="/internships"
              className="button-glow px-6 py-3 text-xs font-bold inline-flex items-center gap-2"
            >
              <span>Explore All {catalog.categories?.length || 4} Domain Catalogues</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>



      {/* =========================================================================
          CALL TO ACTION (RedSun Styled Box)
          ========================================================================= */}
      <section className="py-20 bg-[#060910] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="redsun-box p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden">
            {/* Glowing inner orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#f66f14]/15 blur-3xl pointer-events-none rounded-full" />

            <div className="space-y-3 relative z-10">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#f66f14]/20 text-[#ffad75] border border-[#f66f14]/40">
                GET STARTED IN ETHIOPIA
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                Ready to Accelerate Your Career in Tech?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Join hundreds of students from ASTU, AAU, and BDU who have secured legitimate, high-impact internships with verified companies.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
              <Link
                to="/register"
                className="button-glow px-6 py-3 text-xs font-bold whitespace-nowrap"
              >
                Create Student Account
              </Link>
              <Link
                to="/login"
                className="button-simple px-6 py-3 text-xs font-bold text-slate-200 hover:text-white whitespace-nowrap"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
