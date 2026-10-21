import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { InternshipCard } from '../../components/InternshipCard.jsx';
import { ApplicationStatusText } from '../../components/StatusIndicator.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';
import { SecurityCenter } from '../../components/SecurityCenter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../services/apiClient.js';
import { formatDate, formatETB } from '../../utils/formatters.js';

// ============================================================================
// 1. /student/dashboard
// ============================================================================
export function StudentDashboardPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [appRes, recRes, intvRes] = await Promise.all([
          apiFetch('/applications'),
          apiFetch('/students/recommendations'),
          apiFetch('/interviews'),
        ]);
        if (active) {
          setApplications(appRes.data || []);
          setCounts(appRes.counts || {});
          setRecommendations((recRes.data || []).slice(0, 2));
          setInterviews(intvRes.data || []);
        }
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
  }, []);

  return (
    <DashboardLayout
      title="Student Placement Dashboard"
      subtitle={`${profile?.full_name || 'Student'} · ${profile?.university_name || ''} · ${profile?.department_name || ''}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/student/cv-builder"
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            Build / Export CV
          </Link>
          <Link
            to="/internships"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 whitespace-nowrap"
          >
            Find Internships
          </Link>
        </div>
      }
    >
      {/* Application Tracking KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Applied', value: counts.total || 0 },
          { label: 'Under Review', value: counts['Under Review'] || 0 },
          { label: 'Shortlisted', value: counts.Shortlisted || 0 },
          { label: 'Interviews', value: counts.Interview || 0 },
          { label: 'Accepted', value: counts.Accepted || 0 },
          { label: 'Rejected', value: counts.Rejected || 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-lg p-4 space-y-1"
          >
            <div className="text-xs text-slate-500">{stat.label}</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Interviews Alert */}
      {interviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Upcoming Scheduled Interviews ({interviews.length})
            </h2>
            <Link
              to="/student/interviews"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Manage Interviews →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {interviews.map((iv) => (
              <div
                key={iv.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900">
                    {iv.internship?.title}
                  </span>{' '}
                  <span className="text-slate-500">at {iv.internship?.company_name}</span>
                  <div className="font-mono text-slate-500 mt-0.5">
                    {iv.scheduled_date} · {iv.start_time} – {iv.end_time} · {iv.interview_type}
                  </div>
                </div>
                <span className="font-mono font-semibold text-teal-700">
                  Response: {iv.student_response}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications + Timeline Preview */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display">
            Recent Applications & Status Timeline
          </h2>
          <Link
            to="/student/applications"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            View All Applications →
          </Link>
        </div>

        {loading ? (
          <div className="h-32 animate-pulse bg-slate-50 rounded" />
        ) : applications.length === 0 ? (
          <p className="text-xs text-slate-500">
            You haven’t applied to any internships yet. Explore verified roles to get started.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 4).map((app) => (
              <div key={app.id} className="py-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link
                      to={`/internships/${app.internship_id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-teal-700"
                    >
                      {app.internship?.title}
                    </Link>
                    <div className="text-xs text-slate-500 font-mono">
                      {app.internship?.company_name} · {app.internship?.location} ·{' '}
                      {app.match_score}% Skill Match · Applied {formatDate(app.submitted_at)}
                    </div>
                  </div>
                  <ApplicationStatusText status={app.status} />
                </div>

                {/* Horizontal Step Timeline */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {(app.timeline || []).map((stepObj) => (
                    <div
                      key={stepObj.step}
                      className={`p-2 rounded border text-[11px] font-mono ${
                        stepObj.active
                          ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold'
                          : stepObj.completed
                          ? 'border-slate-200 bg-slate-50 text-slate-700'
                          : 'border-slate-100 text-slate-400'
                      }`}
                    >
                      <span>{stepObj.completed ? '✓ ' : stepObj.active ? '● ' : '○ '}</span>
                      <span>{stepObj.step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Skill-Matched Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display">
            Highest Skill-Matched Internships for Your Profile
          </h2>
          <Link
            to="/student/recommendations"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            All Recommendations →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((item) => (
            <InternshipCard key={item.id} internship={item} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 2. /student/applications
// ============================================================================
export function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/applications?status=${statusFilter}`);
      setApplications(res.data || []);
      setCounts(res.counts || {});
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      await apiFetch(`/applications/${withdrawTarget.id}/status`, {
        method: 'PUT',
        body: { status: 'Withdrawn' },
      });
      setWithdrawTarget(null);
      loadApplications();
    } catch {
      setWithdrawTarget(null);
    }
  };

  return (
    <DashboardLayout
      title="Application Tracker & Timeline"
      subtitle="Track every stage from submission to interview and final selection."
    >
      {/* Status Summary Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-lg">
        {[
          { key: 'ALL', label: `All (${counts.total || 0})` },
          { key: 'Submitted', label: `Submitted (${counts.Submitted || 0})` },
          { key: 'Under Review', label: `Under Review (${counts['Under Review'] || 0})` },
          { key: 'Shortlisted', label: `Shortlisted (${counts.Shortlisted || 0})` },
          { key: 'Interview', label: `Interviews (${counts.Interview || 0})` },
          { key: 'Accepted', label: `Accepted (${counts.Accepted || 0})` },
          { key: 'Rejected', label: `Rejected (${counts.Rejected || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap font-mono ${
              statusFilter === tab.key
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3">
          <p className="text-sm text-slate-600">No applications in this status view.</p>
          <Link
            to="/internships"
            className="inline-block px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg"
          >
            Explore Internships
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const canWithdraw = !['Accepted', 'Rejected', 'Withdrawn'].includes(app.status);
            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-lg p-6 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Link
                      to={`/internships/${app.internship_id}`}
                      className="text-base font-semibold text-slate-900 hover:text-teal-700"
                    >
                      {app.internship?.title}
                    </Link>
                    <div className="text-xs text-slate-500 font-mono">
                      {app.internship?.company_name} · {app.internship?.location} (
                      {app.internship?.work_mode}) · {formatETB(app.internship?.stipend_amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-700 font-semibold">
                      {app.match_score}% Skill Match
                    </span>
                    <ApplicationStatusText status={app.status} />
                    {canWithdraw && (
                      <button
                        type="button"
                        onClick={() => setWithdrawTarget(app)}
                        className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Vertical / Stepper Application Timeline */}
                <div className="border-t border-b border-slate-100 py-4">
                  <div className="text-xs font-semibold text-slate-700 mb-3">
                    Application Lifecycle Timeline:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {(app.timeline || []).map((stepObj, index) => (
                      <div
                        key={stepObj.step}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          stepObj.active
                            ? 'border-teal-600 bg-teal-50/40 text-slate-900'
                            : stepObj.completed
                            ? 'border-slate-200 bg-slate-50 text-slate-800'
                            : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        <div className="font-mono font-semibold">
                          {stepObj.completed ? '✓' : stepObj.active ? '●' : '○'} 0{index + 1}
                        </div>
                        <div className="font-medium">{stepObj.step}</div>
                        {stepObj.date && (
                          <div className="text-[11px] font-mono text-slate-500">
                            {formatDate(stepObj.date)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {app.company_notes && (
                  <div className="text-xs bg-slate-50 p-3 rounded border border-slate-100 text-slate-700">
                    <strong className="text-slate-900">Reviewer Feedback / Notes: </strong>
                    {app.company_notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        title="Withdraw Internship Application"
        description={`Are you sure you want to withdraw your application for "${withdrawTarget?.internship?.title}" at ${withdrawTarget?.internship?.company_name}?`}
        confirmLabel="Confirm Withdrawal"
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />
    </DashboardLayout>
  );
}

// ============================================================================
// 3. /student/saved
// ============================================================================
export function StudentSavedPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/students/saved');
      setSaved(res.data || []);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleToggleSave = async (internshipId) => {
    await apiFetch(`/students/saved/${internshipId}`, { method: 'POST' });
    loadSaved();
  };

  return (
    <DashboardLayout
      title="Saved Internships"
      subtitle="Shortlisted opportunities bookmarked for upcoming application deadlines."
    >
      {loading ? (
        <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : saved.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3">
          <p className="text-sm text-slate-600">You have no saved internships yet.</p>
          <Link
            to="/internships"
            className="inline-block px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg"
          >
            Browse Internships
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {saved.map((item) => (
            <InternshipCard
              key={item.id}
              internship={item}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================================
// 4. /student/recommendations
// ============================================================================
export function StudentRecommendationsPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/students/recommendations');
      setItems(res.data || []);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return (
    <DashboardLayout
      title="Rule-Based Skill Match Recommendations"
      subtitle={`Ranked deterministically against your ${profile?.skills?.length || 0} profile skills (${(profile?.skills || []).map((s) => s.name).join(', ')}).`}
    >
      {loading ? (
        <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <InternshipCard key={item.id} internship={item} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================================
// 5. /student/interviews
// ============================================================================
export function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/interviews');
      setInterviews(res.data || []);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const handleResponse = async (id, student_response) => {
    await apiFetch(`/interviews/${id}`, {
      method: 'PUT',
      body: { student_response },
    });
    loadInterviews();
  };

  return (
    <DashboardLayout
      title="Scheduled Interviews"
      subtitle="Confirm attendance or review meeting links for online and in-person interviews."
    >
      {loading ? (
        <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : interviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-xs text-slate-500">
          No interviews scheduled yet.
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <div
              key={iv.id}
              className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {iv.internship?.title} — {iv.internship?.company_name}
                  </h3>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    Date: {iv.scheduled_date} · Time: {iv.start_time} – {iv.end_time} EAT · Mode:{' '}
                    {iv.interview_type}
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-teal-700">
                  Status: {iv.status} ({iv.student_response})
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded border border-slate-100">
                {iv.meeting_link && (
                  <div>
                    <strong className="text-slate-900">Meeting Link: </strong>
                    <a
                      href={iv.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:underline font-mono"
                    >
                      {iv.meeting_link}
                    </a>
                  </div>
                )}
                {iv.location && (
                  <div>
                    <strong className="text-slate-900">Location: </strong>
                    {iv.location}
                  </div>
                )}
                {iv.notes && (
                  <div>
                    <strong className="text-slate-900">Preparation Notes: </strong>
                    {iv.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResponse(iv.id, 'Confirmed')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
                >
                  Confirm Attendance
                </button>
                <button
                  type="button"
                  onClick={() => handleResponse(iv.id, 'Reschedule Requested')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Request Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================================
// 6. /student/notifications (Also shared by Company & Admin)
// ============================================================================
export function NotificationsCenterPage() {
  const { refreshSession } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/notifications?filter=${filter}`);
      setNotifications(res.data || []);
      await refreshSession();
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, [filter, refreshSession]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    loadNotifications();
  };

  return (
    <DashboardLayout
      title="Notification Center"
      subtitle="Real-time alerts for applications, interview invitations, and verification updates."
      actions={
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap"
        >
          Mark All as Read
        </button>
      }
    >
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Notifications' },
          { key: 'unread', label: 'Unread' },
          { key: 'read', label: 'Read' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === t.key
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-xs text-slate-500">
          No notifications found in this filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 ${
                !n.is_read ? 'bg-teal-50/30' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{n.title}</span>
                  {!n.is_read && (
                    <span className="text-[11px] font-mono font-semibold text-teal-700">
                      [UNREAD]
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="text-[11px] font-mono text-slate-400">
                  {formatDate(n.created_at)}
                </div>
              </div>
              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs font-semibold text-teal-700 hover:underline whitespace-nowrap shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================================
// 7. /student/portfolio
// ============================================================================
export function StudentPortfolioManagePage() {
  const { profile, refreshSession } = useAuth();
  const [isPublic, setIsPublic] = useState(profile?.is_portfolio_public !== false);
  const [exposeContact, setExposeContact] = useState(Boolean(profile?.expose_contact_info));
  const [savedMsg, setSavedMsg] = useState(null);

  const handleSaveVisibility = async () => {
    await apiFetch('/students/profile', {
      method: 'PUT',
      body: {
        is_portfolio_public: isPublic,
        expose_contact_info: exposeContact,
      },
    });
    await refreshSession();
    setSavedMsg('Portfolio visibility and privacy settings updated.');
  };

  return (
    <DashboardLayout
      title="Public Portfolio & Privacy Controls"
      subtitle="Control whether employers can view your public portfolio and direct contact details."
      actions={
        profile?.id && (
          <Link
            to={`/students/${profile.id}`}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
          >
            View Live Public Portfolio ↗
          </Link>
        )
      }
    >
      {savedMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
          {savedMsg}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-900">
          Visibility & Contact Exposure Preferences
        </h2>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-teal-700"
          />
          <div>
            <div className="text-sm font-medium text-slate-900">
              Public Portfolio Visibility ({isPublic ? 'Public' : 'Private'})
            </div>
            <p className="text-xs text-slate-500">
              When enabled, your portfolio URL (`/students/${profile?.id}`) is accessible to verified recruiters and university faculty.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={exposeContact}
            onChange={(e) => setExposeContact(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-teal-700"
          />
          <div>
            <div className="text-sm font-medium text-slate-900">
              Display Direct Email & Phone in Employer Student Discovery
            </div>
            <p className="text-xs text-slate-500">
              When disabled, companies browsing the Student Discovery directory cannot see your personal phone number or email until you apply to their internship.
            </p>
          </div>
        </label>

        <button
          type="button"
          onClick={handleSaveVisibility}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Save Privacy Settings
        </button>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 8. /student/settings (Account & Security Center)
// ============================================================================
export function AccountSettingsPage() {
  const { user, profile } = useAuth();
  return (
    <DashboardLayout
      title="Security & Account Control Center"
      subtitle="Manage two-factor authentication, master password, active sessions, and live threat defenses."
    >
      <SecurityCenter user={user} profile={profile} />
    </DashboardLayout>
  );
}
