import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Bookmark, Flag, Shield, Code, Palette, BarChart3, CheckCircle2, UploadCloud, AlertCircle } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { VerificationBadge, ApplicationStatusText } from '../../components/StatusIndicator.jsx';
import { SkillMatchBreakdown } from '../../components/SkillMatchBreakdown.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../services/apiClient.js';
import { formatETB, formatDate } from '../../utils/formatters.js';

const CATEGORY_ICONS = {
  Cybersecurity: Shield,
  'Website Development': Code,
  'UI/UX Design': Palette,
  'Data Analysis': BarChart3,
};

export function InternshipDetailsPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application form state
  const [coverLetter, setCoverLetter] = useState('');
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Report modal state
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/internships/${id}`);
      setInternship(res.data);
      if (profile?.cv_url) {
        setCvUrl(profile.cv_url);
      }
      if (profile?.availability) {
        setAvailabilityNote(profile.availability);
      }
    } catch (err) {
      setError(err.message || 'Internship not found');
    } finally {
      setLoading(false);
    }
  }, [id, profile]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/uploads', {
        method: 'POST',
        body: formData,
      });
      setCvUrl(res.data.url);
      setFeedback({ type: 'success', text: 'CV file uploaded successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'CV upload failed.' });
    } finally {
      setUploadingCv(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    try {
      await apiFetch(`/students/saved/${id}`, { method: 'POST' });
      loadDetails();
    } catch {
      // Ignore
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      setFeedback({
        type: 'error',
        text: 'Only registered university student accounts can apply for internships.',
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await apiFetch(`/internships/${id}/apply`, {
        method: 'POST',
        body: {
          cv_url: cvUrl,
          cover_letter: coverLetter,
          availability_note: availabilityNote,
        },
      });
      setFeedback({
        type: 'success',
        text: 'Your application has been successfully submitted to the employer review queue.',
      });
      loadDetails();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;
    try {
      await apiFetch(`/students/applications/${applicationId}/withdraw`, {
        method: 'POST',
      });
      setFeedback({ type: 'success', text: 'Application withdrawn.' });
      loadDetails();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: {
          target_type: 'INTERNSHIP',
          target_id: id,
          reason: reportReason,
          details: reportDetails,
        },
      });
      setShowReport(false);
      setReportReason('');
      setReportDetails('');
      setFeedback({
        type: 'success',
        text: 'Report submitted to platform administrators for review.',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-6 animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-2/3" />
          <div className="h-4 bg-slate-900 rounded w-1/3" />
          <div className="h-64 bg-[#0c101d] border border-slate-800 rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !internship) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white font-display">
            Internship Opportunity Not Found
          </h1>
          <p className="text-xs text-slate-400 font-mono">{error}</p>
          <Link
            to="/internships"
            className="button-glow px-5 py-2 text-xs font-bold inline-block"
          >
            ← Back to Internships
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const category = internship.category || 'Website Development';
  const CategoryIcon = CATEGORY_ICONS[category] || Code;

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 bg-[#060910] text-[#f8fafc]">
        
        {/* Breadcrumb with Solar Highlight */}
        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <Link to="/internships" className="hover:text-[#f66f14] transition-colors">
            Internships
          </Link>
          <span>/</span>
          <span className="text-[#ffad75]">{category}</span>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-xs">{internship.title}</span>
        </div>

        {/* Top Header Box (RedSun Box) */}
        <div className="redsun-box p-6 sm:p-8 space-y-5 rounded-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#f66f14]/15 border border-[#f66f14]/40 text-[#ffad75] shadow-[0_0_12px_rgba(246,111,20,0.2)]">
                  <CategoryIcon className="w-3.5 h-3.5" />
                  <span>{category}</span>
                </span>
                <span className="text-xs font-mono text-slate-400 px-2.5 py-0.5 rounded bg-[#131b2e] border border-slate-700">
                  {internship.work_mode}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display leading-tight">
                {internship.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-300">
                <Link
                  to={`/companies/${internship.company_id}`}
                  className="font-bold text-[#ffad75] hover:text-[#f66f14] transition-colors"
                >
                  {internship.company_name}
                </Link>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <VerificationBadge status={internship.company_verification_status} />
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 font-mono">{internship.department_team}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user?.role === 'STUDENT' && (
                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    internship.is_saved
                      ? 'border-[#f66f14] text-[#f66f14] bg-[#f66f14]/20 shadow-[0_0_12px_rgba(246,111,20,0.3)]'
                      : 'button-simple text-slate-300 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{internship.is_saved ? 'Saved Role' : 'Save Role'}</span>
                </button>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => setShowReport(!showReport)}
                  className="button-simple inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-[#f77218]/15 text-xs font-mono tabular-nums">
            <div>
              <div className="text-slate-400 font-sans text-[11px]">Location & Work Mode</div>
              <div className="text-white font-semibold mt-0.5">
                📍 {internship.location} ({internship.work_mode})
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-sans text-[11px]">Guaranteed Stipend</div>
              <div className="text-[#ffad75] font-bold mt-0.5">
                💰 {formatETB(internship.stipend_amount)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-sans text-[11px]">Duration & Start</div>
              <div className="text-white font-semibold mt-0.5">
                ⏳ {internship.duration} · {formatDate(internship.start_date)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-sans text-[11px]">Application Deadline</div>
              <div className="text-white font-semibold mt-0.5">
                📅 {formatDate(internship.application_deadline)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-sans text-[11px]">Recruitment Quota</div>
              <div className="text-white font-semibold mt-0.5">
                👥 {internship.positions} Slots ({internship.applications_count} Applied)
              </div>
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Report Form */}
        {showReport && (
          <form
            onSubmit={handleSubmitReport}
            className="redsun-box border-rose-500/40 p-5 space-y-3 rounded-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Report Suspicious or Inaccurate Posting</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason (e.g. Inaccurate location, upfront fee request)"
                className="px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
              />
              <input
                type="text"
                required
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Additional details for trust & safety audit"
                className="px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReport(false)}
                className="button-simple px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Role Details & Match Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            {internship.match && <SkillMatchBreakdown match={internship.match} />}

            <div className="redsun-box p-6 sm:p-7 space-y-6 rounded-2xl">
              <div className="space-y-2">
                <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <span>Role Overview & Technical Context</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {internship.description}
                </p>
              </div>

              <div className="space-y-2 border-t border-[#f77218]/15 pt-4">
                <h2 className="text-base font-bold text-white font-display">
                  Key Deliverables & Responsibilities
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {internship.responsibilities}
                </p>
              </div>

              <div className="space-y-2 border-t border-[#f77218]/15 pt-4">
                <h2 className="text-base font-bold text-white font-display">
                  Minimum Requirements & Technical Standards
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {internship.minimum_requirements}
                </p>
                <div className="text-xs text-slate-400 pt-3 space-y-2 font-mono">
                  <div>
                    <strong className="text-slate-200">Eligible Fields of Study: </strong>
                    {(internship.fields_of_study || []).join(' · ')}
                  </div>
                  <div>
                    <strong className="text-slate-200">Academic Levels: </strong>
                    {(internship.academic_levels || []).join(' · ')}
                  </div>
                  <div>
                    <strong className="text-slate-200">Required Skills: </strong>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(internship.required_skills || []).map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded bg-[#12182b] text-white border border-[#f77218]/30"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {internship.benefits && (
                <div className="space-y-2 border-t border-[#f77218]/15 pt-4">
                  <h2 className="text-base font-bold text-white font-display">
                    Stipend, Mentorship & Benefits
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {internship.benefits}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Application Submission Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="redsun-box p-6 sm:p-7 space-y-5 rounded-2xl">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white font-display">
                  Apply for This Opportunity
                </h2>
                <p className="text-xs text-slate-400">
                  Direct submission to {internship.company_name} hiring committee.
                </p>
              </div>

              {internship.existing_application ? (
                <div className="p-4 bg-[#111728] border border-[#f77218]/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-mono">Application Status</span>
                    <ApplicationStatusText status={internship.existing_application.status} />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Submitted on: {formatDate(internship.existing_application.submitted_at)}
                  </div>
                  {internship.existing_application.match_score && (
                    <div className="text-xs text-[#ffad75] font-mono font-bold">
                      Calculated Match: {internship.existing_application.match_score}%
                    </div>
                  )}
                  {internship.existing_application.status === 'Submitted' && (
                    <button
                      type="button"
                      onClick={() => handleWithdraw(internship.existing_application.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold"
                    >
                      Withdraw Application
                    </button>
                  )}
                </div>
              ) : user?.role === 'COMPANY' || user?.role === 'ADMIN' ? (
                <div className="p-4 bg-[#111728] border border-slate-800 rounded-xl text-xs text-slate-400">
                  You are logged in as a <strong>{user.role}</strong>. Applications can only be submitted from Student accounts.
                </div>
              ) : !user ? (
                <div className="p-4 bg-[#111728] border border-slate-800 rounded-xl space-y-3 text-center">
                  <p className="text-xs text-slate-300">
                    Sign in to check your deterministic skill match score and apply with 1 click.
                  </p>
                  <Link
                    to="/login"
                    className="button-glow px-4 py-2 text-xs font-bold inline-block"
                  >
                    Sign In to Apply
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Curriculum Vitae (PDF)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleCvUpload}
                        className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#182035] file:text-slate-200 hover:file:bg-[#202942]"
                      />
                      {uploadingCv && (
                        <span className="text-[11px] font-mono text-[#ffad75]">Uploading...</span>
                      )}
                    </div>
                    {cvUrl && (
                      <div className="text-[11px] font-mono text-emerald-400">
                        ✓ CV attached: {cvUrl.split('/').pop()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Statement of Interest & Relevant Projects
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain how your university coursework, portfolio projects, or GitHub repositories align with this role..."
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:outline-none focus:border-[#f66f14]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Availability & Logistics Note
                    </label>
                    <input
                      type="text"
                      required
                      value={availabilityNote}
                      onChange={(e) => setAvailabilityNote(e.target.value)}
                      placeholder="e.g. Available immediately for 4 months on-site / hybrid"
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:outline-none focus:border-[#f66f14]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || uploadingCv}
                    className="button-glow w-full py-3 px-4 text-xs font-bold disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Application Now →'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </PublicLayout>
  );
}
