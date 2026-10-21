import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = {
  STUDENT: [
    { label: 'Overview', path: '/student/dashboard' },
    { label: 'My Profile', path: '/student/profile' },
    { label: 'My Applications', path: '/student/applications' },
    { label: 'Interviews', path: '/student/interviews' },
    { label: 'Saved Internships', path: '/student/saved' },
    { label: 'Recommendations', path: '/student/recommendations' },
    { label: 'CV Builder', path: '/student/cv-builder' },
    { label: 'Portfolio Settings', path: '/student/portfolio' },
    { label: 'Notifications', path: '/student/notifications' },
    { label: 'Account Settings', path: '/student/settings' },
  ],
  COMPANY: [
    { label: 'Recruitment Hub', path: '/company/dashboard' },
    { label: 'Company Profile', path: '/company/profile' },
    { label: 'Manage Postings', path: '/company/internships' },
    { label: 'Create Opportunity', path: '/company/internships/new' },
    { label: 'Review Applicants', path: '/company/applications' },
    { label: 'Discover Students', path: '/company/students' },
    { label: 'Interview Calendar', path: '/company/interviews' },
    { label: 'Notifications', path: '/company/notifications' },
    { label: 'Account Settings', path: '/company/settings' },
  ],
  ADMIN: [
    { label: 'Admin Command Center', path: '/admin/dashboard' },
    { label: 'Company Approvals', path: '/admin/verifications' },
    { label: 'Students Directory', path: '/admin/students' },
    { label: 'Internship Listings', path: '/admin/internships' },
    { label: 'Ethiopian Universities', path: '/admin/universities' },
    { label: 'University Departments', path: '/admin/departments' },
    { label: 'Skills Catalog', path: '/admin/skills' },
    { label: 'Moderation Reports', path: '/admin/reports' },
    { label: 'System Settings', path: '/admin/settings' },
  ],
};

export function DashboardLayout({ title, subtitle, actions, children }) {
  const { user, profile, unreadCount, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || 'STUDENT';
  const items = NAV_ITEMS[role] || NAV_ITEMS.STUDENT;

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#060910] text-[#f8fafc]">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#0c101d] border-b lg:border-b-0 lg:border-r border-[#f77218]/20 flex flex-col justify-between shadow-xl">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white font-display">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f66f14] shadow-[0_0_10px_#f66f14]" />
              <span>Ethio<span className="text-[#f66f14]">Intern</span></span>
            </Link>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f66f14]/20 text-[#f66f14] border border-[#f66f14]/40">
              {role}
            </span>
          </div>

          {/* Active User Summary Card */}
          <div className="border border-[#f77218]/25 rounded-xl bg-[#111728]/70 p-3.5 space-y-1">
            <div className="text-xs font-semibold text-white truncate">
              {profile?.full_name || profile?.company_name || user?.email}
            </div>
            <div className="text-[11px] text-slate-400 truncate font-mono">
              {profile?.university_short_name
                ? `${profile.university_short_name} · ${profile.department_name}`
                : profile?.industry || user?.email}
            </div>
          </div>

          {/* Primary Role Navigation */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {items.map((item) => {
              const active = location.pathname === item.path;
              const isNotif = item.path.endsWith('/notifications');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-[#f66f14] to-[#ea384c] text-white font-bold shadow-[0_0_16px_rgba(246,111,20,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-[#182035]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isNotif && unreadCount > 0 && (
                    <span
                      className={`font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-white text-[#f66f14] font-bold' : 'bg-[#f66f14] text-white'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Workspace Links */}
        <div className="p-5 border-t border-[#f77218]/15 space-y-3 bg-[#090d18]">
          <div className="flex items-center justify-between text-xs">
            <Link
              to="/internships"
              className="text-slate-400 hover:text-[#f66f14] transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <span>←</span> Marketplace
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 font-semibold text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060910]">
        {/* Contextual Top Bar */}
        <header className="bg-[#0c101d]/90 backdrop-blur-md border-b border-[#f77218]/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>EthioIntern</span>
              <span>/</span>
              <span className="text-[#f66f14]">{role.toLowerCase()}</span>
              <span>/</span>
              <span className="text-slate-200">{title}</span>
            </div>
            <h1 className="text-xl font-bold text-white font-display mt-0.5">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
