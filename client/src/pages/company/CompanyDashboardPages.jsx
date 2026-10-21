import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { VerificationBadge, ApplicationStatusText } from '../../components/StatusIndicator.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../services/apiClient.js';
import { formatETB, formatDate, getInitials } from '../../utils/formatters.js';

// ============================================================================
// 1. /company/dashboard
// ============================================================================
export function CompanyDashboardPage() {
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const compRes = await apiFetch('/companies/profile/me');
        const myCompany = compRes.data;
        const [intRes, appRes] = await Promise.all([
          apiFetch(`/internships?company_id=${myCompany.id}&status=ALL`),
          apiFetch('/applications'),
        ]);
        if (active) {
          setCompany(myCompany);
          setInternships(intRes.data || []);
          setApplications(appRes.data || []);
          setCounts(appRes.counts || {});
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
      title="Employer Recruitment Overview"
      subtitle={
        company
          ? `${company.company_name} · ${company.location} · ${company.industry}`
          : 'Manage internship postings, student discovery, and interviews.'
      }
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/company/students"
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Find Students
          </Link>
          <Link
            to="/company/internships/create"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
          >
            + Create Internship
          </Link>
        </div>
      }
    >
      {/* Company Verification Status Banner */}
      {company && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">
                Verification Status:
              </span>
              <VerificationBadge status={company.verification_status} />
            </div>
            <p className="text-xs text-slate-600">
              {company.verification_status === 'APPROVED'
                ? `Your organization carries the ✓ Verified Company badge (TIN: ${company.tin_number || 'Verified'}).`
                : 'Submit or update your Ethiopian TIN and Commercial License in Company Profile to obtain the ✓ Verified Company badge.'}
            </p>
          </div>
          <Link
            to="/company/profile"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            Manage Verification & Profile →
          </Link>
        </div>
      )}

      {/* Recruitment Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Active Postings', value: internships.filter((i) => i.status === 'Published').length },
          { label: 'Total Applicants', value: counts.total || 0 },
          { label: 'Shortlisted', value: counts.Shortlisted || 0 },
          { label: 'Interview Stage', value: counts.Interview || 0 },
          { label: 'Accepted Offers', value: counts.Accepted || 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-xs text-slate-500">{stat.label}</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applicants Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display">
            Recent Student Applications
          </h2>
          <Link
            to="/company/applications"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            Review All Applicants →
          </Link>
        </div>

        {loading ? (
          <div className="h-32 animate-pulse bg-slate-50 rounded" />
        ) : applications.length === 0 ? (
          <p className="text-xs text-slate-500">No applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-4 font-semibold">Candidate</th>
                  <th className="py-2.5 px-4 font-semibold">University & Field</th>
                  <th className="py-2.5 px-4 font-semibold">Internship</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Skill Match</th>
                  <th className="py-2.5 pl-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 6).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      <Link
                        to={`/students/${app.student?.id}`}
                        className="hover:text-teal-700"
                      >
                        {app.student?.full_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {app.student?.university_short_name} · {app.student?.field_of_study_name}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{app.internship?.title}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {app.match_score}%
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <ApplicationStatusText status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 2. /company/profile (Company Profile & Verification Submission)
// ============================================================================
export function CompanyProfilePage() {
  const { catalog, refreshSession } = useAuth();
  const [company, setCompany] = useState(null);
  const [tinNumber, setTinNumber] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [verNotes, setVerNotes] = useState('');
  const [feedback, setFeedback] = useState(null);

  const loadCompany = useCallback(async () => {
    try {
      const res = await apiFetch('/companies/profile/me');
      setCompany(res.data);
      setTinNumber(res.data.tin_number || '');
    } catch {
      // Ignore error
    }
  }, []);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/companies/profile/me', {
        method: 'PUT',
        body: company,
      });
      setCompany(res.data);
      await refreshSession();
      setFeedback({ type: 'success', text: 'Company profile updated.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/companies/verify', {
        method: 'POST',
        body: {
          tin_number: tinNumber,
          registration_number: regNumber,
          notes: verNotes,
        },
      });
      await loadCompany();
      setFeedback({
        type: 'success',
        text: 'Verification request submitted to platform administrators.',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  if (!company) {
    return (
      <DashboardLayout title="Company Profile & Verification">
        <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Company Profile & TIN Verification"
      subtitle="Maintain accurate employer information and verification credentials."
    >
      {feedback && (
        <div
          className={`p-4 rounded-lg border text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Organization Details
            </h2>
            <VerificationBadge status={company.verification_status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Company Name
              </label>
              <input
                type="text"
                required
                value={company.company_name || ''}
                onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">Industry</label>
              <input
                type="text"
                required
                value={company.industry || ''}
                onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">City</label>
              <select
                value={company.location || 'Addis Ababa'}
                onChange={(e) => setCompany({ ...company, location: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {(catalog.locations || []).map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Company Size
              </label>
              <input
                type="text"
                value={company.company_size || ''}
                onChange={(e) => setCompany({ ...company, company_size: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Founded Year
              </label>
              <input
                type="number"
                value={company.founded_year || 2020}
                onChange={(e) => setCompany({ ...company, founded_year: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">Website</label>
              <input
                type="url"
                value={company.website || ''}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">Phone</label>
              <input
                type="text"
                value={company.phone || ''}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Street Address / Sub-City
            </label>
            <input
              type="text"
              value={company.address || ''}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Description
            </label>
            <textarea
              rows={4}
              value={company.description || ''}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
          >
            Save Company Profile
          </button>
        </form>

        {/* Right 5 Columns: Verification Request Submission */}
        <form
          onSubmit={handleSubmitVerification}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900 font-display">
            Company Verification Request
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Submit your Ethiopian Taxpayer Identification Number (TIN) and Ministry of Trade registration number for admin verification.
          </p>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Ethiopian TIN Number *
            </label>
            <input
              type="text"
              required
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
              placeholder="ET-TIN-0048291042"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Commercial Registration Number
            </label>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="MTI/AA/2024/..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Verification Notes for Admin
            </label>
            <textarea
              rows={3}
              value={verNotes}
              onChange={(e) => setVerNotes(e.target.value)}
              placeholder="University partnership details or HR contact notes..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            Submit Verification Request
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 3. /company/internships (Manage Postings)
// ============================================================================
export function CompanyInternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPostings = useCallback(async () => {
    setLoading(true);
    try {
      const compRes = await apiFetch('/companies/profile/me');
      const intRes = await apiFetch(
        `/internships?company_id=${compRes.data.id}&status=ALL`
      );
      setInternships(intRes.data || []);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPostings();
  }, [loadPostings]);

  const handleStatusChange = async (id, status) => {
    await apiFetch(`/internships/${id}`, {
      method: 'PUT',
      body: { status },
    });
    loadPostings();
  };

  return (
    <DashboardLayout
      title="Company Internship Postings"
      subtitle="Manage active, draft, and closed internship opportunities."
      actions={
        <Link
          to="/company/internships/create"
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
        >
          + Post New Internship
        </Link>
      }
    >
      {loading ? (
        <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : (
        <div className="space-y-4">
          {internships.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-6 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Link
                    to={`/internships/${item.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-teal-700"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs font-mono font-semibold text-teal-700">
                    [{item.status}]
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {item.location} ({item.work_mode}) · {item.duration} ·{' '}
                  {formatETB(item.stipend_amount)} · {item.applications_count} Applicants
                </div>
                <div className="text-xs text-slate-600">
                  Required: {(item.required_skills || []).join(' · ')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/company/internships/${item.id}`}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Edit Posting
                </Link>
                {item.status === 'Published' ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'Closed')}
                    className="px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50"
                  >
                    Close Posting
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'Published')}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================================
// 4. /company/internships/create & /company/internships/:id
// ============================================================================
export function CompanyInternshipFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { catalog } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    department_team: 'Software Engineering',
    location: 'Addis Ababa',
    work_mode: 'Hybrid',
    duration: '4 Months',
    start_date: '2026-11-15',
    application_deadline: '2026-11-05',
    positions: 2,
    stipend_amount: 7500,
    minimum_requirements: '',
    responsibilities: '',
    benefits: '',
    application_instructions: '',
    status: 'Published',
    required_skills: ['React', 'JavaScript', 'Node.js', 'PostgreSQL'],
    preferred_skills: ['Git'],
    fields_of_study: ['Computer Science', 'Software Engineering'],
    academic_levels: ['BSc'],
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    async function loadExisting() {
      try {
        const res = await apiFetch(`/internships/${id}`);
        setForm({
          ...res.data,
          required_skills: res.data.required_skills || [],
          preferred_skills: res.data.preferred_skills || [],
          fields_of_study: res.data.fields_of_study || [],
          academic_levels: res.data.academic_levels || ['BSc'],
        });
      } catch (err) {
        setError(err.message);
      }
    }
    loadExisting();
  }, [id, isEditing]);

  const toggleRequiredSkill = (skillName) => {
    setForm((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skillName)
        ? prev.required_skills.filter((s) => s !== skillName)
        : [...prev.required_skills, skillName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await apiFetch(`/internships/${id}`, {
          method: 'PUT',
          body: form,
        });
      } else {
        await apiFetch('/internships', {
          method: 'POST',
          body: form,
        });
      }
      navigate('/company/internships');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title={isEditing ? 'Edit Internship Opportunity' : 'Create New Internship Opportunity'}
      subtitle="Specify required skills, academic levels, and monthly stipend in ETB."
    >
      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-lg p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Internship Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Full-Stack JavaScript Software Engineering Intern"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Department / Team *
            </label>
            <input
              type="text"
              required
              value={form.department_team}
              onChange={(e) => setForm({ ...form, department_team: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Location</label>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              {(catalog.locations || []).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Work Mode</label>
            <select
              value={form.work_mode}
              onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Duration</label>
            <input
              type="text"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Stipend (ETB / mo)
            </label>
            <input
              type="number"
              value={form.stipend_amount}
              onChange={(e) => setForm({ ...form, stipend_amount: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Positions</label>
            <input
              type="number"
              min="1"
              value={form.positions}
              onChange={(e) => setForm({ ...form, positions: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Application Deadline *
            </label>
            <input
              type="date"
              required
              value={form.application_deadline}
              onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-800">
            Role Description * (min 20 chars)
          </label>
          <textarea
            rows={3}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Responsibilities
            </label>
            <textarea
              rows={3}
              value={form.responsibilities}
              onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Minimum Requirements
            </label>
            <textarea
              rows={3}
              value={form.minimum_requirements}
              onChange={(e) => setForm({ ...form, minimum_requirements: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-800">
            Required Skills (Used for Student Match Score Calculation)
          </label>
          <div className="flex flex-wrap gap-2">
            {(catalog.skills || []).map((sk) => {
              const active = form.required_skills.includes(sk.name);
              return (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => toggleRequiredSkill(sk.name)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sk.name} {active ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
        >
          {saving ? 'Saving...' : isEditing ? 'Save Internship Changes' : 'Publish Internship'}
        </button>
      </form>
    </DashboardLayout>
  );
}

// ============================================================================
// 5. /company/applications (Review Applicants & Schedule Interviews)
// ============================================================================
export function CompanyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('2026-10-20');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [interviewType, setInterviewType] = useState('Online');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/eth-int-tech');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState(null);

  const loadApps = useCallback(async () => {
    try {
      const res = await apiFetch('/applications');
      setApplications(res.data || []);
    } catch {
      // Ignore error
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleUpdateStatus = async (appId, status, company_notes) => {
    try {
      await apiFetch(`/applications/${appId}/status`, {
        method: 'PUT',
        body: { status, company_notes },
      });
      setFeedback({ type: 'success', text: `Application moved to ${status}.` });
      loadApps();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await apiFetch('/interviews', {
        method: 'POST',
        body: {
          application_id: selectedApp.id,
          scheduled_date: interviewDate,
          start_time: startTime,
          end_time: endTime,
          interview_type: interviewType,
          meeting_link: meetingLink,
          notes,
        },
      });
      setSelectedApp(null);
      setFeedback({
        type: 'success',
        text: 'Interview scheduled and notification sent to student.',
      });
      loadApps();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <DashboardLayout
      title="Applicant Review & Selection Pipeline"
      subtitle="Shortlist candidates, review skill match scores, and schedule interviews."
    >
      {feedback && (
        <div
          className={`p-4 rounded-lg border text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {selectedApp && (
        <div className="bg-white border-2 border-teal-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Schedule Interview with {selectedApp.student?.full_name}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Close ✕
            </button>
          </div>
          <form onSubmit={handleScheduleInterview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Mode</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Online">Online</option>
                  <option value="In-person">In-person</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Meeting Link or Office Location"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Interview Agenda / Instructions"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
            >
              Confirm & Send Interview Invite
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Link
                    to={`/students/${app.student?.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-teal-700"
                  >
                    {app.student?.full_name}
                  </Link>
                  <span className="text-xs font-mono font-semibold text-emerald-700">
                    {app.match_score}% Skill Match
                  </span>
                  <ApplicationStatusText status={app.status} />
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  {app.student?.university_name} ({app.student?.university_short_name}) ·{' '}
                  {app.student?.academic_level} in {app.student?.field_of_study_name} · GPA{' '}
                  {app.student?.gpa || 'N/A'}
                </div>
                <div className="text-xs text-slate-500">
                  Applying for: <strong className="text-slate-800">{app.internship?.title}</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100"
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  Invite to Interview
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(app.id, 'Accepted')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded border border-slate-100 leading-relaxed">
              <strong className="text-slate-900">Cover Letter: </strong>
              {app.cover_letter}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                <strong className="text-slate-700">Student Skills: </strong>
                {(app.student?.skills || []).map((s) => s.name).join(' · ')}
              </div>
              <Link
                to={`/students/${app.student?.id}`}
                className="font-semibold text-teal-700 hover:underline"
              >
                View Full Student Portfolio →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// 6. /company/students (Student Discovery Engine for Companies)
// ============================================================================
export function CompanyStudentDiscoveryPage() {
  const { catalog } = useAuth();
  const [search, setSearch] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (universityId) params.set('university_id', universityId);
      if (departmentId) params.set('department_id', departmentId);
      if (academicLevel) params.set('academic_level', academicLevel);
      if (skills) params.set('skills', skills);
      if (location) params.set('location', location);

      const res = await apiFetch(`/companies/students?${params.toString()}`);
      setStudents(res.data || []);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, [search, universityId, departmentId, academicLevel, skills, location]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <DashboardLayout
      title="Find Ethiopian University Students"
      subtitle="Search and filter candidates by University, Department, Field, Academic Level, Skills, and Location."
    >
      {/* Discovery Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search: React Developer, Computer Science, ASTU..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="">All Ethiopian Universities</option>
              {(catalog.universities || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.short_name} — {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="">All Departments</option>
              {(catalog.departments || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Filter by Skills comma-separated (e.g. React, Node.js, PostgreSQL)"
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <select
            value={academicLevel}
            onChange={(e) => setAcademicLevel(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All Academic Levels</option>
            {['Diploma', 'BSc', 'BA', 'MSc', 'MA', 'PhD'].map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All Cities</option>
            {(catalog.locations || []).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Discovery Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {students.map((st) => (
            <article
              key={st.id}
              className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-display shrink-0">
                      {getInitials(st.full_name)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {st.full_name}
                      </h3>
                      <div className="text-xs text-slate-600">
                        {st.field_of_study_name} · {st.university_name}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono tabular-nums text-emerald-700 shrink-0">
                    {st.match_score}% Match
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-500">
                  {st.academic_level} (Class of {st.graduation_year}) · {st.location} ·{' '}
                  {st.availability}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {st.bio}
                </p>

                <div className="text-xs text-slate-700">
                  <span className="font-semibold">Skills: </span>
                  {(st.skills || []).map((s) => s.name).join(' · ')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">
                  {st.contact_protected
                    ? 'Private contact protected'
                    : `Contact: ${st.email}`}
                </span>
                <Link
                  to={`/students/${st.id}`}
                  className="px-4 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  View Profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================================
// 7. /company/interviews
// ============================================================================
export function CompanyInterviewsPage() {
  const [interviews, setInterviews] = useState([]);

  const loadInterviews = useCallback(async () => {
    try {
      const res = await apiFetch('/interviews');
      setInterviews(res.data || []);
    } catch {
      // Ignore error
    }
  }, []);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const handleCancel = async (id) => {
    await apiFetch(`/interviews/${id}`, { method: 'DELETE' });
    loadInterviews();
  };

  return (
    <DashboardLayout
      title="Company Interview Calendar"
      subtitle="Manage scheduled candidate interviews and monitor student confirmation responses."
    >
      <div className="space-y-4">
        {interviews.map((iv) => (
          <div
            key={iv.id}
            className="bg-white border border-slate-200 rounded-lg p-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="text-base font-semibold text-slate-900">
                {iv.student?.full_name} — {iv.internship?.title}
              </div>
              <div className="text-xs font-mono text-slate-500">
                {iv.scheduled_date} · {iv.start_time} – {iv.end_time} · {iv.interview_type} ·{' '}
                {iv.meeting_link || iv.location}
              </div>
              <div className="text-xs text-slate-600">{iv.notes}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold text-teal-700">
                Candidate: {iv.student_response}
              </span>
              <button
                type="button"
                onClick={() => handleCancel(iv.id)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Cancel Interview
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
