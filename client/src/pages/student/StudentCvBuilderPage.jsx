import React, { useState, useEffect } from 'react';
import { Printer, Save } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { apiFetch } from '../../services/apiClient.js';

export function StudentCvBuilderPage() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState('');
  const [headline, setHeadline] = useState('');
  const [showGpa, setShowGpa] = useState(true);
  const [savedNotice, setSavedNotice] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/students/profile');
        setProfile(res.data);
        setSummary(res.data.bio || '');
        setHeadline(
          `${res.data.academic_level} ${res.data.field_of_study_name} Candidate · ${res.data.university_short_name || res.data.university_name}`
        );
      } catch {
        // Ignore error
      }
    }
    load();
  }, []);

  const handleSaveSummary = async () => {
    if (!profile) return;
    await apiFetch('/students/profile', {
      method: 'PUT',
      body: { bio: summary },
    });
    setSavedNotice('CV summary synced with your student profile.');
  };

  const handlePrintDownload = () => {
    window.print();
  };

  if (!profile) {
    return (
      <DashboardLayout title="Professional CV Builder">
        <div className="h-64 bg-white border border-slate-200 rounded-lg animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Professional Internship CV Builder"
      subtitle="Customize, preview, and download a clean academic & engineering CV generated directly from your verified profile."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sync Summary to Profile</span>
          </button>
          <button
            type="button"
            onClick={handlePrintDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download / Print PDF CV</span>
          </button>
        </div>
      }
    >
      {savedNotice && (
        <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-800">
          {savedNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Columns: CV Customization Controls */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            CV Header & Summary Controls
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Executive Summary
            </label>
            <textarea
              rows={5}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showGpa}
              onChange={(e) => setShowGpa(e.target.checked)}
              className="rounded border-slate-300 text-teal-700"
            />
            <span>Include Cumulative GPA ({profile.gpa || '3.84'}) on CV</span>
          </label>
        </div>

        {/* Right 8 Columns: Printable A4 CV Preview */}
        <div
          id="cv-printable-area"
          className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-8 sm:p-10 space-y-6 text-slate-900"
        >
          {/* CV Header */}
          <div className="border-b-2 border-slate-900 pb-4 space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight font-display">
              {profile.full_name}
            </h2>
            <div className="text-sm font-semibold text-teal-800">{headline}</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-600">
              <span>{profile.email}</span>
              {profile.phone && <span>· {profile.phone}</span>}
              <span>· {profile.location}, Ethiopia</span>
              {profile.github_url && <span>· {profile.github_url}</span>}
              {profile.linkedin_url && <span>· {profile.linkedin_url}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {summary && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 border-b border-slate-200 pb-1">
                Professional Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 border-b border-slate-200 pb-1">
              Education
            </h3>
            <div className="flex items-baseline justify-between text-xs">
              <div>
                <strong className="text-slate-900 text-sm">
                  {profile.university_name} ({profile.university_short_name})
                </strong>
                <div className="text-slate-700">
                  {profile.academic_level} in {profile.department_name} ({profile.field_of_study_name})
                </div>
              </div>
              <div className="text-right font-mono text-slate-600">
                <div>Expected Graduation: {profile.graduation_year}</div>
                {showGpa && profile.gpa && <div>Cumulative GPA: {profile.gpa} / 4.00</div>}
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 border-b border-slate-200 pb-1">
              Technical Skills & Competencies
            </h3>
            <div className="text-xs text-slate-800 leading-relaxed font-mono">
              {(profile.skills || []).map((s) => `${s.name} (${s.proficiency})`).join(' · ')}
            </div>
          </div>

          {/* Experience */}
          {profile.experience?.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 border-b border-slate-200 pb-1">
                Academic & Technical Experience
              </h3>
              {profile.experience.map((exp) => (
                <div key={exp.id || exp.role} className="space-y-0.5 text-xs">
                  <div className="flex items-baseline justify-between">
                    <strong className="text-slate-900">{exp.role}</strong>
                    <span className="font-mono text-slate-500">{exp.period}</span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    {exp.organization} · {exp.location}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {profile.projects?.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 border-b border-slate-200 pb-1">
                Selected Engineering Projects
              </h3>
              {profile.projects.map((proj) => (
                <div key={proj.id} className="space-y-0.5 text-xs">
                  <div className="flex items-baseline justify-between">
                    <strong className="text-slate-900">{proj.title}</strong>
                    <span className="font-mono text-slate-500">
                      {(proj.technologies || []).join(', ')}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Certifications & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 border-b border-slate-200 pb-1">
                Certifications
              </h3>
              <ul className="space-y-1 text-xs text-slate-700">
                {(profile.certifications || []).map((c) => (
                  <li key={c.id}>
                    <strong>{c.name}</strong> — {c.issuer} ({c.issue_date})
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 border-b border-slate-200 pb-1">
                Languages & Availability
              </h3>
              <div className="text-xs text-slate-700 space-y-1">
                <div>
                  <strong>Languages: </strong>
                  {(profile.languages || []).join(' · ')}
                </div>
                <div>
                  <strong>Availability: </strong>
                  {profile.availability}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
