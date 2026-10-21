import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  Laptop,
  Terminal,
  Sparkles,
  LogOut,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { apiFetch } from '../services/apiClient.js';

export function SecurityCenter({ user, profile }) {
  const [activeTab, setActiveTab] = useState('password'); // 'password' | '2fa' | 'sessions' | 'audit' | 'sandbox'
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // 2FA state
  const [twoFactorModal, setTwoFactorModal] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [submitting2FA, setSubmitting2FA] = useState(false);
  const [disable2FAModal, setDisable2FAModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  // Interactive Sandbox state
  const [scanTarget, setScanTarget] = useState('https://ethiointern.et/api');
  const [scanRunning, setScanRunning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  // Load security overview from API
  const loadSecurityOverview = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/security/overview');
      setSecurityData(res.data);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load security settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityOverview();
  }, []);

  // Password Strength Calculation
  const calculateStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 10;

    if (score < 40) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score < 70) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score < 90) return { score, label: 'Strong', color: 'bg-orange-500' };
    return { score: 100, label: 'Military-Grade', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(newPassword);

  const reqs = [
    { label: 'At least 8 characters long', valid: newPassword.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(newPassword) },
    { label: 'One numeric digit (0-9)', valid: /[0-9]/.test(newPassword) },
    { label: 'One special character (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSubmittingPassword(true);
    setFeedback(null);
    try {
      await apiFetch('/security/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      setFeedback({ type: 'success', text: 'Password has been updated securely!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadSecurityOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Password update failed.' });
    } finally {
      setSubmittingPassword(false);
    }
  };

  // 2FA Setup Flow
  const handleStart2FA = async () => {
    try {
      setFeedback(null);
      const res = await apiFetch('/security/2fa/generate', { method: 'POST' });
      setTwoFactorSetupData(res.data);
      setOtpCode('');
      setTwoFactorModal(true);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not initiate 2FA setup.' });
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setFeedback({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }
    setSubmitting2FA(true);
    try {
      await apiFetch('/security/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({
          token: otpCode.trim(),
          secret: twoFactorSetupData?.secret,
          recovery_codes: twoFactorSetupData?.recoveryCodes,
        }),
      });
      setTwoFactorModal(false);
      setFeedback({ type: 'success', text: 'Two-Factor Authentication is now enabled!' });
      loadSecurityOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Invalid verification code.' });
    } finally {
      setSubmitting2FA(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/security/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ password: disablePassword }),
      });
      setDisable2FAModal(false);
      setDisablePassword('');
      setFeedback({ type: 'success', text: 'Two-Factor Authentication has been disabled.' });
      loadSecurityOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to disable 2FA.' });
    }
  };

  // Revoke sessions
  const handleRevokeSessions = async () => {
    try {
      await apiFetch('/security/sessions/revoke-others', { method: 'POST' });
      setFeedback({ type: 'success', text: 'All other device sessions have been terminated.' });
      loadSecurityOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not revoke sessions.' });
    }
  };

  // Interactive Security Scan Simulation
  const handleRunSecurityScan = async () => {
    setScanRunning(true);
    setScanProgress(10);
    setScanResult(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    try {
      const res = await apiFetch('/security/simulate-scan', {
        method: 'POST',
        body: JSON.stringify({ target_url: scanTarget, scan_type: 'comprehensive' }),
      });
      clearInterval(interval);
      setScanProgress(100);
      setTimeout(() => {
        setScanResult(res.data);
        setScanRunning(false);
      }, 300);
    } catch {
      clearInterval(interval);
      setScanRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Security Status Header Card */}
      <div className="redsun-box p-6 rounded-2xl relative overflow-hidden border border-[#f77218]/40 bg-gradient-to-br from-[#0c101d] via-[#101627] to-[#181120]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#f66f14]/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#f66f14]" />
              <span className="text-xs font-mono font-bold text-[#ffad75] uppercase tracking-wider">
                Cryptographic Security & Identity Shield
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Authentication, 2FA & Threat Protection
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Manage zero-trust login credentials, two-factor authenticator keys, active sessions, and live platform defenses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#060910]/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400">2FA PROTECTION</div>
              <div className="text-xs font-bold font-mono mt-0.5 flex items-center gap-1 justify-center">
                {securityData?.two_factor_enabled ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> DISABLED
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#060910]/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400">ACTIVE SESSIONS</div>
              <div className="text-xs font-bold font-mono text-[#ffad75] mt-0.5">
                {securityData?.sessions?.length || 1} Connected
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-[#f77218]/20">
          {[
            { id: 'password', label: 'Password & Credentials', icon: Key },
            { id: '2fa', label: 'Two-Factor Authentication', icon: Smartphone },
            { id: 'sessions', label: 'Active Sessions', icon: Laptop },
            { id: 'audit', label: 'Security Audit Log', icon: Clock },
            { id: 'sandbox', label: 'Interactive Threat Sandbox', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setFeedback(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'button-glow text-white shadow-[0_0_18px_rgba(246,111,20,0.5)]'
                    : 'bg-[#0d1222] text-slate-300 hover:text-white border border-slate-800 hover:border-[#f66f14]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-950/50 text-rose-300 border-rose-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: PASSWORD & CREDENTIALS
          ========================================================================= */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 redsun-box p-6 rounded-2xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#f66f14]" />
                <span>Change Account Password</span>
              </h3>
              <p className="text-xs text-slate-400">
                Update your master authentication password with salted bcrypt encryption.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Current Password <span className="text-[#f66f14]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter existing password"
                    className="w-full px-3.5 py-2.5 text-xs text-white bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  New Password <span className="text-[#f66f14]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter fortified password (min 8 characters)"
                    className="w-full px-3.5 py-2.5 text-xs text-white bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Interactive Dynamic Strength Bar */}
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Entropy Strength:</span>
                      <span className="font-bold text-white">{strength.label} ({strength.score}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Confirm New Password <span className="text-[#f66f14]">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 text-xs text-white bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14]"
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="button-glow w-full py-2.5 text-xs font-bold disabled:opacity-50"
              >
                {submittingPassword ? 'Encrypting & Saving...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Password Policy & Interactive Checklist */}
          <div className="lg:col-span-5 redsun-box p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold font-mono text-[#ffad75] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Complexity Check</span>
            </h4>
            <p className="text-xs text-slate-400">
              Passwords are encrypted using 10 bcrypt salt rounds with strict NIST guidelines:
            </p>

            <div className="space-y-2.5 pt-2">
              {reqs.map((req, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs p-2 rounded-xl transition-all ${
                    req.valid
                      ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30 font-medium'
                      : 'bg-[#060910] text-slate-400 border border-slate-800'
                  }`}
                >
                  {req.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0">
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                    </div>
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#060910] border border-[#f77218]/30 font-mono text-[11px] text-slate-400 space-y-1 mt-4">
              <div className="text-slate-300 font-bold">Encrypted Token Identity:</div>
              <div className="truncate text-slate-500">ID: {user?.id}</div>
              <div className="text-[#ffad75]">Status: Verified Authenticated User</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TWO-FACTOR AUTHENTICATION (2FA)
          ========================================================================= */}
      {activeTab === '2fa' && (
        <div className="redsun-box p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f77218]/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#f66f14]" />
                <h3 className="text-lg font-bold text-white font-display">
                  Two-Factor Authentication (TOTP)
                </h3>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Add a cryptographic defense layer to your Ethiopian student or employer portal account using Google Authenticator, Authy, or 1Password.
              </p>
            </div>

            {securityData?.two_factor_enabled ? (
              <button
                type="button"
                onClick={() => setDisable2FAModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-600/40 hover:bg-rose-900/80 transition-colors whitespace-nowrap"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart2FA}
                className="button-glow px-5 py-2.5 text-xs font-bold whitespace-nowrap"
              >
                Set Up Two-Factor Auth
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#f66f14]/20 text-[#f66f14] flex items-center justify-center font-bold font-mono text-sm">
                1
              </div>
              <div className="text-xs font-bold text-white">Download Authenticator</div>
              <p className="text-[11px] text-slate-400">
                Install Google Authenticator or Microsoft Authenticator on your mobile device.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#f66f14]/20 text-[#f66f14] flex items-center justify-center font-bold font-mono text-sm">
                2
              </div>
              <div className="text-xs font-bold text-white">Scan or Enter Key</div>
              <p className="text-[11px] text-slate-400">
                Pair your account by scanning the QR code or manually entering the 32-character secret key.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#f66f14]/20 text-[#f66f14] flex items-center justify-center font-bold font-mono text-sm">
                3
              </div>
              <div className="text-xs font-bold text-white">Verify 6-Digit Code</div>
              <p className="text-[11px] text-slate-400">
                Input the dynamic one-time password (TOTP) to activate zero-trust verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2FA SETUP MODAL */}
      {twoFactorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="redsun-box max-w-lg w-full p-6 sm:p-8 rounded-2xl border border-[#f77218]/40 bg-[#0c101d] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#f66f14]" />
                <span>Pair Two-Factor Authenticator</span>
              </h3>
              <button
                type="button"
                onClick={() => setTwoFactorModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Secret key preview */}
            <div className="space-y-3">
              <div className="text-xs text-slate-300">
                Add this account to your authenticator app using the manual secret key below:
              </div>

              <div className="p-3 rounded-xl bg-[#060910] border border-slate-800 flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-[#ffad75] tracking-wider break-all">
                  {twoFactorSetupData?.secret}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(twoFactorSetupData?.secret || '');
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#182035] hover:bg-[#202942] text-white flex items-center gap-1 shrink-0"
                >
                  {copiedSecret ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Recovery Codes */}
              <div className="p-3 rounded-xl bg-[#060910] border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono font-bold text-slate-300">
                  Emergency One-Time Recovery Codes:
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-slate-400">
                  {(twoFactorSetupData?.recoveryCodes || []).map((c, i) => (
                    <span key={i} className="p-1 rounded bg-[#111728] text-center border border-slate-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Enter 6-Digit Code from Authenticator:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 text-white bg-[#060910] border border-[#f66f14] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTwoFactorModal(false)}
                  className="w-1/2 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting2FA || otpCode.length !== 6}
                  className="button-glow w-1/2 py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {submitting2FA ? 'Verifying...' : 'Activate 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA DISABLE MODAL */}
      {disable2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="redsun-box max-w-md w-full p-6 rounded-2xl border border-rose-500/40 bg-[#0c101d] space-y-5">
            <h3 className="text-base font-bold text-white font-display">
              Disable Two-Factor Authentication
            </h3>
            <p className="text-xs text-slate-400">
              Please enter your current account password to confirm disabling 2FA.
            </p>
            <form onSubmit={handleDisable2FA} className="space-y-4">
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                placeholder="Current account password"
                className="w-full px-3.5 py-2.5 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:outline-none focus:border-rose-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDisable2FAModal(false)}
                  className="w-1/2 py-2 text-xs rounded-xl bg-slate-800 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Confirm Disable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ACTIVE SESSIONS
          ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="redsun-box p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f77218]/20">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#f66f14]" />
                <span>Active Signed-In Devices</span>
              </h3>
              <p className="text-xs text-slate-400">
                Review devices currently granted session bearer tokens for your account.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRevokeSessions}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#182035] hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Revoke Other Sessions</span>
            </button>
          </div>

          <div className="space-y-3">
            {(securityData?.sessions || []).map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-[#060910] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#111728] border border-[#f77218]/30 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5 text-[#f66f14]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{sess.device}</span>
                      {sess.current && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      📍 {sess.ip} · Protocol: {sess.auth_protocol}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  {sess.last_active}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SECURITY AUDIT LOG
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="redsun-box p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#f77218]/20">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#f66f14]" />
                <span>Account Security Activity Timeline</span>
              </h3>
              <p className="text-xs text-slate-400">
                Immutable chronological log of authentication, credential updates, and defense events.
              </p>
            </div>
            <button
              type="button"
              onClick={loadSecurityOverview}
              className="p-2 rounded-xl bg-[#111728] text-slate-300 hover:text-white border border-slate-800"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(securityData?.security_logs || []).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#060910] border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#f66f14] mt-1.5 shrink-0" />
                  <div>
                    <div className="font-bold text-white font-mono text-[11px]">{log.event}</div>
                    <div className="text-slate-300 mt-0.5">{log.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">IP: {log.ip}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleDateString()} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: INTERACTIVE THREAT SANDBOX
          ========================================================================= */}
      {activeTab === 'sandbox' && (
        <div className="redsun-box p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#f66f14]" />
              <span>Interactive Threat Defense & Vulnerability Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400">
              Execute live security audits across endpoints to verify SQL parameterization, cryptographic salting, XSS filters, and TLS telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={scanTarget}
              onChange={(e) => setScanTarget(e.target.value)}
              placeholder="Target URL or Endpoint"
              className="flex-1 px-3.5 py-2.5 text-xs text-white bg-[#060910] border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#f66f14] font-mono"
            />
            <button
              type="button"
              onClick={handleRunSecurityScan}
              disabled={scanRunning}
              className="button-glow px-5 py-2.5 text-xs font-bold whitespace-nowrap flex items-center gap-2"
            >
              {scanRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{scanRunning ? 'Running Defense Audit...' : 'Execute Security Audit'}</span>
            </button>
          </div>

          {/* Progress Bar while running */}
          {scanRunning && (
            <div className="space-y-2 p-4 rounded-xl bg-[#060910] border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#ffad75]">Auditing OWASP Top 10 Protections...</span>
                <span className="text-white font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f66f14] to-emerald-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Scan Results */}
          {scanResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#060910] border border-slate-800">
                  <div className="text-slate-400 text-[10px]">DEFENSE SCORE</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {scanResult.defenseScore}/100
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#060910] border border-slate-800">
                  <div className="text-slate-400 text-[10px]">STATUS</div>
                  <div className="text-lg font-bold text-[#ffad75] mt-0.5">
                    {scanResult.status} ✓
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#060910] border border-slate-800">
                  <div className="text-slate-400 text-[10px]">ENCRYPTION</div>
                  <div className="text-sm font-bold text-white mt-1 truncate">
                    {scanResult.networkTelemetry.tlsVersion}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#060910] border border-slate-800">
                  <div className="text-slate-400 text-[10px]">AUDIT LATENCY</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {scanResult.networkTelemetry.latency}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Vulnerability Mitigations Verified:
                </div>
                {scanResult.findings.map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl bg-[#060910] border border-emerald-500/30 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-white font-mono">{f.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                          {f.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-6">{f.description}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                      {f.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
