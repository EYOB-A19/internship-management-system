import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Code, Palette, BarChart3, GraduationCap, Award, ExternalLink, Mail, MapPin } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { apiFetch } from '../../services/apiClient.js';
import { formatDate, getInitials } from '../../utils/formatters.js';

export function PublicPortfolioPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/students/${id}`);
        if (active) setStudent(res.data);
      } catch (err) {
        if (active) setError(err.message || 'Student portfolio unavailable');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-6 animate-pulse">
          <div className="h-32 bg-[#0c101d] border border-slate-800 rounded-2xl" />
          <div className="h-64 bg-[#0c101d] border border-slate-800 rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !student) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white font-display">
            Student Portfolio Private or Not Found
          </h1>
          <p className="text-xs text-slate-400 font-mono">{error}</p>
          <Link
            to="/internships"
            className="button-glow px-4 py-2 text-xs font-bold inline-block"
          >
            ← Return to Marketplace
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 bg-[#060910] text-[#f8fafc]">
        
        {/* Portfolio Header Box */}
        <section className="redsun-box p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 rounded-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#182035] to-[#121727] border border-[#f77218]/40 text-[#ffad75] flex items-center justify-center text-2xl font-bold font-display shadow-lg shrink-0">
            {getInitials(student.full_name)}
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {student.full_name}
              </h1>
              <span className="text-xs font-mono text-[#ffad75] bg-[#f66f14]/15 px-3 py-1 rounded-full border border-[#f66f14]/30 font-semibold">
                {student.availability}
              </span>
            </div>

            <div className="text-xs sm:text-sm font-semibold text-slate-200">
              {student.academic_level} in {student.field_of_study_name} — {student.university_name} ({student.university_short_name})
            </div>

            <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2">
              <span>{student.department_name}</span>
              <span>·</span>
              <span>Class of {student.graduation_year}</span>
              <span>·</span>
              <span>📍 {student.location}</span>
              {student.gpa && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">GPA {student.gpa}</span>
                </>
              )}
            </div>

            {student.bio && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 max-w-3xl">
                {student.bio}
              </p>
            )}

            {/* External Links */}
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs font-semibold text-[#ffad75]">
              {student.github_url && (
                <a
                  href={student.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {student.linkedin_url && (
                <a
                  href={student.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {student.portfolio_url && (
                <a
                  href={student.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <span className="text-slate-500 font-mono text-[11px] ml-auto">
                {student.email}
              </span>
            </div>
          </div>
        </section>

        {/* Verified Technical Skills */}
        <section className="redsun-box p-6 sm:p-7 space-y-4 rounded-2xl">
          <h2 className="text-base font-bold text-white font-display">
            Verified Technical Skills & Proficiency
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(student.skills || []).map((sk) => (
              <div
                key={sk.id || sk.name}
                className="p-3 rounded-xl border border-slate-800 bg-[#060910] flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-white">{sk.name}</span>
                <span className="font-mono text-[11px] text-[#ffad75] bg-[#f66f14]/15 px-1.5 py-0.5 rounded">
                  {sk.proficiency}
                </span>
              </div>
            ))}
          </div>
          {student.languages?.length > 0 && (
            <div className="text-xs text-slate-400 pt-2 border-t border-[#f77218]/15 font-mono">
              <strong className="text-slate-200">Languages: </strong>
              {student.languages.join(' · ')}
            </div>
          )}
        </section>

        {/* Projects */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white font-display">
            Engineering & Academic Projects ({student.projects?.length || 0})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(student.projects || []).map((proj) => (
              <div
                key={proj.id}
                className="redsun-box p-6 space-y-3 rounded-2xl"
              >
                <h3 className="text-base font-bold text-white font-display">{proj.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                <div className="text-xs font-mono text-slate-400">
                  Technologies: {(proj.technologies || []).join(' · ')}
                </div>
                <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-[#ffad75]">
                  {proj.project_url && (
                    <a href={proj.project_url} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                      <span>Live Project</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {proj.github_url && (
                    <a href={proj.github_url} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                      <span>Source Code</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="redsun-box p-6 space-y-4 rounded-2xl">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#f66f14]" />
              <span>University Education</span>
            </h2>
            {(student.education || []).map((edu) => (
              <div key={edu.id} className="space-y-1 border-b border-slate-800 last:border-0 pb-3 last:pb-0">
                <div className="text-xs sm:text-sm font-bold text-white">
                  {edu.degree} in {edu.field_of_study}
                </div>
                <div className="text-xs text-[#ffad75]">{edu.institution_name}</div>
                <div className="text-xs font-mono text-slate-400">
                  {edu.start_year} – {edu.end_year || 'Present'} {edu.grade ? `· ${edu.grade}` : ''}
                </div>
                {edu.description && (
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">{edu.description}</p>
                )}
              </div>
            ))}
          </section>

          <section className="redsun-box p-6 space-y-4 rounded-2xl">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-[#f66f14]" />
              <span>Verified Certifications</span>
            </h2>
            {(student.certifications || []).map((cert) => (
              <div key={cert.id} className="space-y-1 border-b border-slate-800 last:border-0 pb-3 last:pb-0">
                <div className="text-xs sm:text-sm font-bold text-white">{cert.name}</div>
                <div className="text-xs text-slate-400">
                  Issued by {cert.issuer} · {formatDate(cert.issue_date)}
                </div>
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#ffad75] hover:underline inline-flex items-center gap-1 pt-0.5"
                  >
                    <span>Verify INSA / Authority</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </section>
        </div>

      </div>
    </PublicLayout>
  );
}
