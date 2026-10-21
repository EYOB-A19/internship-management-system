import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { VerificationBadge } from '../../components/StatusIndicator.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../services/apiClient.js';
import { formatDate, formatETB } from '../../utils/formatters.js';

// ============================================================================
// 1. /admin/dashboard & /admin/analytics (KPIs + 7 Recharts Visualizations)
// ============================================================================
export function AdminDashboardPage({ fullAnalytics = false }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch('/admin/analytics');
        if (active) setAnalytics(res.data);
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

  if (loading || !analytics) {
    return (
      <DashboardLayout title="Platform Administration & Analytics">
        <div className="h-64 bg-white border border-slate-200 rounded-lg animate-pulse" />
      </DashboardLayout>
    );
  }

  const { kpis, charts, recentActions = [] } = analytics;

  return (
    <DashboardLayout
      title={fullAnalytics ? 'Platform Analytics & Telemetry' : 'National Platform Administration'}
      subtitle="Real-time governance across Ethiopian universities, employer verifications, and student placements."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/verifications"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
          >
            Review Pending Verifications ({kpis.pendingCompanies})
          </Link>
        </div>
      }
    >
      {/* 8 Mandatory Admin KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: kpis.totalStudents },
          { label: 'Total Companies', value: kpis.totalCompanies },
          { label: 'Verified Companies', value: kpis.verifiedCompanies },
          { label: 'Pending Companies', value: kpis.pendingCompanies },
          { label: 'Total Internships', value: kpis.totalInternships },
          { label: 'Active Internships', value: kpis.activeInternships },
          { label: 'Total Applications', value: kpis.totalApplications },
          { label: 'Successful Placements', value: kpis.successfulPlacements },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-lg p-4 space-y-1"
          >
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Applications Over Time & Applications By Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            01. Applications & Placements Over Time
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#0F766E"
                  fill="#CCFBF1"
                />
                <Area
                  type="monotone"
                  dataKey="placements"
                  name="Placements"
                  stroke="#0F172A"
                  fill="#E2E8F0"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            02. Applications By Pipeline Status
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.applicationsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Applications" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Students By University & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            03. Students By Ethiopian University
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.studentsByUniversity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="students" name="Enrolled Students" fill="#1E293B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            04. Top In-Demand Technical Skills
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topSkills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="skill" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="demand" name="Profiles & Roles" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3: Internships By Field, Students By Department & Company Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            05. Internships By Field of Study
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.internshipsByField}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Postings" fill="#0F766E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            06. Students By Academic Department
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.studentsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="students" name="Students" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            07. Verified Company Growth
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.companyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="total" name="Total" stroke="#64748B" fill="#F1F5F9" />
                <Area type="monotone" dataKey="verified" name="Verified" stroke="#0F766E" fill="#99F6E4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Administrative Audit Log */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Administrative Audit Trail
        </h2>
        <div className="divide-y divide-slate-100 text-xs">
          {recentActions.map((act) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between gap-4">
              <div>
                <span className="font-mono font-semibold text-teal-700">
                  [{act.action_type}]
                </span>{' '}
                <span className="text-slate-700">{act.details}</span>
              </div>
              <span className="font-mono text-slate-400 shrink-0">
                {formatDate(act.created_at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 2. /admin/verifications & /admin/companies
// ============================================================================
export function AdminVerificationsPage() {
  const [companies, setCompanies] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [feedback, setFeedback] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/companies');
      setCompanies(res.data || []);
    } catch {
      // Ignore error
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDecision = async (companyId, status) => {
    try {
      await apiFetch(`/admin/companies/${companyId}/verify`, {
        method: 'PUT',
        body: {
          status,
          verification_notes:
            notesMap[companyId] ||
            `Verification status updated to ${status} after TIN & trade registry check.`,
        },
      });
      setFeedback(`Company status updated to ${status}.`);
      loadData();
    } catch {
      // Ignore error
    }
  };

  return (
    <DashboardLayout
      title="Company Verification Queue"
      subtitle="Approve, reject, or suspend employer accounts after validating Ethiopian TIN and commercial license records."
    >
      {feedback && (
        <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-800">
          {feedback}
        </div>
      )}

      <div className="space-y-4">
        {companies.map((comp) => (
          <div
            key={comp.id}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    {comp.company_name}
                  </h3>
                  <VerificationBadge status={comp.verification_status} />
                </div>
                <div className="text-xs font-mono text-slate-500">
                  TIN: {comp.tin_number || 'Not submitted'} · Location: {comp.location} ·{' '}
                  {comp.industry} · {comp.email}
                </div>
                <p className="text-xs text-slate-600">{comp.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecision(comp.id, 'APPROVED')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
                >
                  Approve (✓ Verified)
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision(comp.id, 'REJECTED')}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision(comp.id, 'SUSPENDED')}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Suspend
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={notesMap[comp.id] ?? comp.verification_notes ?? ''}
                onChange={(e) =>
                  setNotesMap({ ...notesMap, [comp.id]: e.target.value })
                }
                placeholder="Verification audit notes..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 3. /admin/students (Manage Students & Suspend/Activate Accounts)
// ============================================================================
export function AdminStudentsPage() {
  const [students, setStudents] = useState([]);

  const loadStudents = useCallback(async () => {
    const res = await apiFetch('/admin/students');
    setStudents(res.data || []);
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleToggleAccountStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await apiFetch(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: { status: nextStatus },
    });
    loadStudents();
  };

  return (
    <DashboardLayout
      title="Manage University Students"
      subtitle="Audit registered student profiles and manage account access."
    >
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
              <th className="p-3.5 font-semibold">Student Name</th>
              <th className="p-3.5 font-semibold">University & Department</th>
              <th className="p-3.5 font-semibold">Level & Year</th>
              <th className="p-3.5 font-semibold">Skills</th>
              <th className="p-3.5 font-semibold">Status</th>
              <th className="p-3.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((st) => (
              <tr key={st.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-semibold text-slate-900">
                  <Link to={`/students/${st.id}`} className="hover:text-teal-700">
                    {st.full_name}
                  </Link>
                  <div className="font-mono text-slate-400 font-normal">{st.email}</div>
                </td>
                <td className="p-3.5 text-slate-700">
                  {st.university_name} ({st.university_short_name})
                  <div className="text-slate-500">{st.department_name}</div>
                </td>
                <td className="p-3.5 font-mono text-slate-600">
                  {st.academic_level} · {st.graduation_year}
                </td>
                <td className="p-3.5 text-slate-600">
                  {(st.skills || []).map((s) => s.name).join(', ')}
                </td>
                <td className="p-3.5 font-mono font-semibold">
                  <span
                    className={
                      st.account_status === 'ACTIVE' ? 'text-emerald-700' : 'text-red-600'
                    }
                  >
                    {st.account_status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleToggleAccountStatus(st.user_id, st.account_status)}
                    className="px-3 py-1 text-xs font-medium border border-slate-200 rounded hover:bg-slate-100"
                  >
                    {st.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 4. /admin/internships (Manage & Audit Internship Postings)
// ============================================================================
export function AdminInternshipsPage() {
  const [internships, setInternships] = useState([]);

  const loadInternships = useCallback(async () => {
    const res = await apiFetch('/admin/internships');
    setInternships(res.data || []);
  }, []);

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  const handleStatusChange = async (id, status) => {
    await apiFetch(`/admin/internships/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
    loadInternships();
  };

  const handleDelete = async (id) => {
    await apiFetch(`/internships/${id}`, { method: 'DELETE' });
    loadInternships();
  };

  return (
    <DashboardLayout
      title="Manage All Internship Postings"
      subtitle="Review, approve, close, or remove fraudulent internship postings across the platform."
    >
      <div className="space-y-3">
        {internships.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/internships/${item.id}`}
                  className="text-sm font-semibold text-slate-900 hover:text-teal-700"
                >
                  {item.title}
                </Link>
                <span className="text-xs font-mono text-teal-700 font-semibold">
                  [{item.status}]
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500">
                {item.company_name} · {item.location} ({item.work_mode}) ·{' '}
                {formatETB(item.stipend_amount)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange(item.id, 'Published')}
                className="px-3 py-1 text-xs font-medium border border-slate-200 rounded hover:bg-slate-50"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(item.id, 'Rejected')}
                className="px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200 rounded hover:bg-amber-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 5. /admin/universities (Manage Configurable Ethiopian Universities)
// ============================================================================
export function AdminUniversitiesPage() {
  const { refreshCatalog } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [website, setWebsite] = useState('');

  const loadUnis = useCallback(async () => {
    const res = await apiFetch('/admin/universities');
    setUniversities(res.data || []);
  }, []);

  useEffect(() => {
    loadUnis();
  }, [loadUnis]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await apiFetch('/admin/universities', {
      method: 'POST',
      body: { name, short_name: shortName, city, region, website },
    });
    setName('');
    setShortName('');
    setCity('');
    setRegion('');
    setWebsite('');
    await loadUnis();
    await refreshCatalog();
  };

  return (
    <DashboardLayout
      title="Ethiopian Universities Registry"
      subtitle="Add and manage accredited Ethiopian universities stored in PostgreSQL."
    >
      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-3"
      >
        <div className="text-xs font-semibold text-slate-800">
          Add Ethiopian University to Platform Catalog
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="University Name (e.g. Debre Birhan University)"
            className="sm:col-span-2 px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <input
            type="text"
            required
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="Acronym (e.g. DBU)"
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
          />
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Debre Birhan)"
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
          >
            + Add University
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {universities.map((u) => (
          <div key={u.id} className="p-4 flex items-center justify-between text-xs">
            <div>
              <strong className="text-slate-900 font-semibold">{u.name}</strong>{' '}
              <span className="font-mono text-teal-700">({u.short_name})</span>
              <div className="text-slate-500">
                City: {u.city} · Region: {u.region}
              </div>
            </div>
            <span className="font-mono text-slate-500">{u.website}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 6. /admin/departments & /admin/skills & /admin/reports
// ============================================================================
export function AdminDepartmentsPage() {
  const { refreshCatalog } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [description, setDescription] = useState('');

  const loadDepts = useCallback(async () => {
    const res = await apiFetch('/admin/departments');
    setDepartments(res.data || []);
  }, []);

  useEffect(() => {
    loadDepts();
  }, [loadDepts]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await apiFetch('/admin/departments', {
      method: 'POST',
      body: { name, faculty, description },
    });
    setName('');
    setFaculty('');
    setDescription('');
    await loadDepts();
    await refreshCatalog();
  };

  return (
    <DashboardLayout
      title="University Departments & Fields of Study"
      subtitle="Manage standardized academic departments across Ethiopian universities."
    >
      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Department Name"
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <input
            type="text"
            required
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            placeholder="Faculty / College"
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Focus areas"
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
          >
            + Add Department
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {departments.map((d) => (
          <div key={d.id} className="p-4 space-y-0.5 text-xs">
            <div className="font-semibold text-slate-900">{d.name}</div>
            <div className="text-slate-500">{d.faculty}</div>
            {d.description && <div className="text-slate-600">{d.description}</div>}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function AdminSkillsPage() {
  const { refreshCatalog } = useAuth();
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technical');

  const loadSkills = useCallback(async () => {
    const res = await apiFetch('/admin/skills');
    setSkills(res.data || []);
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await apiFetch('/admin/skills', {
      method: 'POST',
      body: { name, category },
    });
    setName('');
    await loadSkills();
    await refreshCatalog();
  };

  return (
    <DashboardLayout
      title="Skills Taxonomy Management"
      subtitle="Standardize skills used by the rule-based matching engine."
    >
      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap gap-3"
      >
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Skill Name (e.g. GraphQL, Kubernetes)"
          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Database">Database</option>
          <option value="Data & AI">Data & AI</option>
          <option value="DevOps & Tools">DevOps & Tools</option>
          <option value="Engineering">Engineering</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
        >
          + Add Skill
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {skills.map((sk) => (
          <div
            key={sk.id}
            className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between text-xs"
          >
            <span className="font-semibold text-slate-900">{sk.name}</span>
            <span className="font-mono text-slate-500">{sk.category}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function AdminReportsPage() {
  const [reports, setReports] = useState([]);

  const loadReports = useCallback(async () => {
    const res = await apiFetch('/admin/reports');
    setReports(res.data || []);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleResolve = async (id, status) => {
    await apiFetch(`/admin/reports/${id}`, {
      method: 'PUT',
      body: { status, resolution_notes: `Marked ${status} by Trust & Safety admin.` },
    });
    loadReports();
  };

  return (
    <DashboardLayout
      title="Trust & Safety Reports"
      subtitle="Review user-submitted reports regarding suspicious postings or unverified accounts."
    >
      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900">
                [{rep.target_type}] {rep.reason} —{' '}
                <span className="font-mono text-teal-700">{rep.status}</span>
              </div>
              <p className="text-xs text-slate-600">{rep.details}</p>
              <div className="text-xs font-mono text-slate-400">
                Reported by: {rep.reporter_email} · {formatDate(rep.created_at)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResolve(rep.id, 'RESOLVED')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg"
              >
                Mark Resolved
              </button>
              <button
                type="button"
                onClick={() => handleResolve(rep.id, 'DISMISSED')}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
