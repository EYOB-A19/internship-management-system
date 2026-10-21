import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    return '/student/dashboard';
  };

  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-[#060910]/85 backdrop-blur-xl border-b border-[#f77218]/20 transition-all duration-300">
      {/* Zone 1: Wordmark with Solar Amber Core */}
      <Link
        to="/"
        className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white font-display group whitespace-nowrap shrink-0"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#f66f14] shadow-[0_0_12px_#f66f14] group-hover:scale-125 transition-transform" />
        <span className="tracking-tight">
          Ethio<span className="text-[#f66f14] group-hover:drop-shadow-[0_0_12px_rgba(246,111,20,0.8)] transition-all">Intern</span>
        </span>
      </Link>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
        <Link
          to="/internships"
          className={`transition-all duration-200 relative py-1 ${
            isActive('/internships')
              ? 'text-[#f66f14] drop-shadow-[0_0_8px_rgba(246,111,20,0.6)] font-bold'
              : 'hover:text-white'
          }`}
        >
          Specialized Internships
          {isActive('/internships') && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f66f14] shadow-[0_0_8px_#f66f14] rounded-full" />
          )}
        </Link>
        <Link
          to="/companies"
          className={`transition-all duration-200 relative py-1 ${
            isActive('/companies')
              ? 'text-[#f66f14] drop-shadow-[0_0_8px_rgba(246,111,20,0.6)] font-bold'
              : 'hover:text-white'
          }`}
        >
          Verified Employers
          {isActive('/companies') && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f66f14] shadow-[0_0_8px_#f66f14] rounded-full" />
          )}
        </Link>
        <Link
          to="/students/stu-eyob-001"
          className={`transition-all duration-200 relative py-1 ${
            isActive('/students')
              ? 'text-[#f66f14] drop-shadow-[0_0_8px_rgba(246,111,20,0.6)] font-bold'
              : 'hover:text-white'
          }`}
        >
          Talent Showcase
          {isActive('/students') && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f66f14] shadow-[0_0_8px_#f66f14] rounded-full" />
          )}
        </Link>
        <Link
          to="/about"
          className={`transition-all duration-200 relative py-1 ${
            isActive('/about')
              ? 'text-[#f66f14] drop-shadow-[0_0_8px_rgba(246,111,20,0.6)] font-bold'
              : 'hover:text-white'
          }`}
        >
          Matching Engine
          {isActive('/about') && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f66f14] shadow-[0_0_8px_#f66f14] rounded-full" />
          )}
        </Link>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              to={getDashboardPath()}
              className="button-glow px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>
                {user.role === 'STUDENT'
                  ? 'Student Workspace'
                  : user.role === 'COMPANY'
                  ? 'Recruiter Portal'
                  : 'Admin Console'}
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="button-simple px-3 py-2 text-xs font-medium text-slate-300 hover:text-white whitespace-nowrap shrink-0"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="button-simple px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white whitespace-nowrap shrink-0"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="button-glow px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Get Started
            </Link>
          </>
        )}

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0c101d] border-b border-[#f77218]/25 p-4 space-y-3 z-50 shadow-2xl">
          <Link
            to="/internships"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-[#f66f14]"
          >
            Specialized Internships
          </Link>
          <Link
            to="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-[#f66f14]"
          >
            Verified Employers
          </Link>
          <Link
            to="/students/stu-eyob-001"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-[#f66f14]"
          >
            Talent Showcase
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-[#f66f14]"
          >
            Matching Engine
          </Link>
        </div>
      )}
    </header>
  );
}
