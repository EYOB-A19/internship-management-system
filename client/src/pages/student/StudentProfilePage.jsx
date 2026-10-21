import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../services/apiClient.js';

export function StudentProfilePage() {
  const { catalog, refreshSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New project form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projGithub, setProjGithub] = useState('');

  // New certification form
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('2026-03-01');
  const [certUrl, setCertUrl] = useState('');

  // New skill input
  const [customSkill, setCustomSkill] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/students/profile');
      setProfile(res.data);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveMainProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await apiFetch('/students/profile', {
        method: 'PUT',
        body: {
          first_name: profile.first_name,
          father_name: profile.father_name,
          grandfather_name: profile.grandfather_name,
          phone: profile.phone,
          university_id: profile.university_id,
          department_id: profile.department_id,
          field_of_study_id: profile.field_of_study_id,
          academic_level: profile.academic_level,
          graduation_year: Number(profile.graduation_year),
          gpa: profile.gpa ? Number(profile.gpa) : null,
          location: profile.location,
          bio: profile.bio,
          availability: profile.availability,
          portfolio_url: profile.portfolio_url,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          skills: (profile.skills || []).map((s) => ({
            name: s.name || s,
            proficiency: s.proficiency || 'Advanced',
          })),
        },
      });
      setProfile(res.data);
      await refreshSession();
      setFeedback({ type: 'success', text: 'Student profile and skills saved to database.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skillName) => {
    const existing = (profile.skills || []).some((s) => s.name === skillName);
    const updated = existing
      ? profile.skills.filter((s) => s.name !== skillName)
      : [...(profile.skills || []), { name: skillName, proficiency: 'Advanced' }];
    setProfile({ ...profile, skills: updated });
  };

  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return;
    toggleSkill(customSkill.trim());
    setCustomSkill('');
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/students/profile/projects', {
        method: 'POST',
        body: {
          title: projTitle,
          description: projDesc,
          technologies: projTech,
          project_url: projUrl,
          github_url: projGithub,
        },
      });
      setProjTitle('');
      setProjDesc('');
      setProjTech('');
      setProjUrl('');
      setProjGithub('');
      loadProfile();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleDeleteProject = async (id) => {
    await apiFetch(`/students/profile/projects/${id}`, { method: 'DELETE' });
    loadProfile();
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/students/profile/certifications', {
        method: 'POST',
        body: {
          name: certName,
          issuer: certIssuer,
          issue_date: certDate,
          credential_url: certUrl,
        },
      });
      setCertName('');
      setCertIssuer('');
      setCertUrl('');
      loadProfile();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleDeleteCert = async (id) => {
    await apiFetch(`/students/profile/certifications/${id}`, { method: 'DELETE' });
    loadProfile();
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'cv');
      const res = await apiFetch('/uploads', {
        method: 'POST',
        body: formData,
      });
      setProfile({ ...profile, cv_url: res.data.url });
      setFeedback({ type: 'success', text: `Uploaded CV: ${res.data.filename}` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  if (loading || !profile) {
    return (
      <DashboardLayout title="Student Profile">
        <div className="h-64 bg-white border border-slate-200 rounded-lg animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Ethiopian University Student Profile"
      subtitle="Manage your academic credentials, verified technical skills, projects, and certifications."
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

      <form
        onSubmit={handleSaveMainProfile}
        className="bg-white border border-slate-200 rounded-lg p-6 space-y-6"
      >
        <h2 className="text-base font-bold text-slate-900 font-display border-b border-slate-100 pb-3">
          Personal & Ethiopian Academic Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">First Name</label>
            <input
              type="text"
              required
              value={profile.first_name || ''}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Father Name</label>
            <input
              type="text"
              required
              value={profile.father_name || ''}
              onChange={(e) => setProfile({ ...profile, father_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Grandfather Name</label>
            <input
              type="text"
              value={profile.grandfather_name || ''}
              onChange={(e) => setProfile({ ...profile, grandfather_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">University</label>
            <select
              value={profile.university_id || ''}
              onChange={(e) => setProfile({ ...profile, university_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              {(catalog.universities || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.short_name})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Department</label>
            <select
              value={profile.department_id || ''}
              onChange={(e) => setProfile({ ...profile, department_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              {(catalog.departments || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Field of Study</label>
            <select
              value={profile.field_of_study_id || ''}
              onChange={(e) => setProfile({ ...profile, field_of_study_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              {(catalog.fieldsOfStudy || []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Academic Level</label>
            <select
              value={profile.academic_level || 'BSc'}
              onChange={(e) => setProfile({ ...profile, academic_level: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              {['Diploma', 'BSc', 'BA', 'MSc', 'MA', 'PhD', 'Other'].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Graduation Year</label>
            <input
              type="number"
              value={profile.graduation_year || 2027}
              onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Cumulative GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={profile.gpa || ''}
              onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Location</label>
            <select
              value={profile.location || 'Addis Ababa'}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
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
            <label className="block text-xs font-semibold text-slate-800">Phone</label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-800">
            Professional Bio & Career Objective
          </label>
          <textarea
            rows={3}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Availability</label>
            <input
              type="text"
              value={profile.availability || ''}
              onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">GitHub URL</label>
            <input
              type="url"
              value={profile.github_url || ''}
              onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">LinkedIn URL</label>
            <input
              type="url"
              value={profile.linkedin_url || ''}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">Portfolio URL</label>
            <input
              type="url"
              value={profile.portfolio_url || ''}
              onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Skills Selection */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-800">
              Skills Used for Automated Internship Matching ({profile.skills?.length || 0} active)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom skill..."
                className="px-2.5 py-1 text-xs border border-slate-200 rounded"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-800 rounded hover:bg-slate-200"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(catalog.skills || []).map((sk) => {
              const active = (profile.skills || []).some((s) => s.name === sk.name);
              return (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => toggleSkill(sk.name)}
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

        {/* CV File Upload */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <label className="block text-xs font-semibold text-slate-800">
            Uploaded CV Document (Validated PDF / Max 5MB)
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-mono text-slate-600">
              Current CV: {profile.cv_url || 'None uploaded'}
            </span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleCvUpload}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
          >
            {saving ? 'Saving Changes...' : 'Save Profile & Recalculate Skill Matches'}
          </button>
        </div>
      </form>

      {/* Projects Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-900 font-display">
          Academic & Personal Projects ({profile.projects?.length || 0})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(profile.projects || []).map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-lg border border-slate-200 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">{proj.title}</div>
                <p className="text-xs text-slate-600">{proj.description}</p>
                <div className="text-xs font-mono text-slate-500">
                  {(proj.technologies || []).join(' · ')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteProject(proj.id)}
                className="text-slate-400 hover:text-red-600 p-1"
                title="Remove project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddProject} className="border-t border-slate-100 pt-4 space-y-3">
          <div className="text-xs font-semibold text-slate-800">Add New Project</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              placeholder="Project Name (e.g. ASTU Smart Clearance System)"
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              required
              value={projTech}
              onChange={(e) => setProjTech(e.target.value)}
              placeholder="Technologies comma-separated (React, Node.js, PostgreSQL)"
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <textarea
            rows={2}
            required
            value={projDesc}
            onChange={(e) => setProjDesc(e.target.value)}
            placeholder="Describe what the project solves and your architecture contribution..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="url"
              value={projUrl}
              onChange={(e) => setProjUrl(e.target.value)}
              placeholder="Live Project URL (optional)"
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
            <input
              type="url"
              value={projGithub}
              onChange={(e) => setProjGithub(e.target.value)}
              placeholder="GitHub Repository URL (optional)"
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </form>
      </div>

      {/* Certifications Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-900 font-display">
          Certifications & Credentials ({profile.certifications?.length || 0})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(profile.certifications || []).map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-lg border border-slate-200 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">{cert.name}</div>
                <div className="text-xs text-slate-500">
                  {cert.issuer} · {cert.issue_date}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCert(cert.id)}
                className="text-slate-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCert} className="border-t border-slate-100 pt-4 space-y-3">
          <div className="text-xs font-semibold text-slate-800">Add Certification</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              placeholder="Certificate Name"
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              required
              value={certIssuer}
              onChange={(e) => setCertIssuer(e.target.value)}
              placeholder="Issuer (e.g. ALX Ethiopia, Coursera)"
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
            <input
              type="date"
              value={certDate}
              onChange={(e) => setCertDate(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
            />
            <input
              type="url"
              value={certUrl}
              onChange={(e) => setCertUrl(e.target.value)}
              placeholder="Credential URL"
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
