import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export function VerificationBadge({ status = 'PENDING' }) {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.25)] whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        <span>TIN Verified</span>
      </span>
    );
  }
  if (status === 'REJECTED' || status === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-300 bg-rose-950/50 border border-rose-500/40 px-2 py-0.5 rounded-full whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
        <span>Verification {status}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded-full whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
      <span>Pending Verification</span>
    </span>
  );
}

export function ApplicationStatusText({ status = 'Submitted' }) {
  const styles = {
    Submitted: 'text-slate-300 bg-slate-800/60 border-slate-700',
    'Under Review': 'text-amber-300 bg-amber-950/60 border-amber-500/40',
    Shortlisted: 'text-[#ffad75] bg-[#f66f14]/20 border-[#f66f14]/40 font-semibold shadow-[0_0_8px_rgba(246,111,20,0.25)]',
    Interview: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.25)]',
    Accepted: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40 font-semibold shadow-[0_0_8px_rgba(52,211,153,0.25)]',
    Rejected: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
    Withdrawn: 'text-slate-500 bg-slate-900 border-slate-800 line-through',
  };

  return (
    <span className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded border whitespace-nowrap ${styles[status] || 'text-slate-300'}`}>
      {status}
    </span>
  );
}
