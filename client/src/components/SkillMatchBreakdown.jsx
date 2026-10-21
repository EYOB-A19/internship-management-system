import React, { useState, useMemo } from 'react';
import { Sparkles, Check, Plus, RefreshCw } from 'lucide-react';

/**
 * Transparent Rule-Based Skill Match Breakdown Component
 * Features interactive real-time skill simulation and dynamic score recalculation
 */
export function SkillMatchBreakdown({ match, compact = false }) {
  if (!match) return null;

  const {
    score: initialScore = 0,
    requiredMatchedCount: initialMatchedCount = 0,
    requiredTotalCount = 0,
    checklist: initialChecklist = [],
    breakdown = {},
  } = match;

  // Interactive skill simulation state
  const [simulatedSkills, setSimulatedSkills] = useState({});
  const [simulatorActive, setSimulatorActive] = useState(false);

  // Compute live simulated match score and checklist
  const { currentScore, currentMatchedCount, liveChecklist } = useMemo(() => {
    if (!simulatorActive || Object.keys(simulatedSkills).length === 0) {
      return {
        currentScore: initialScore,
        currentMatchedCount: initialMatchedCount,
        liveChecklist: initialChecklist,
      };
    }

    let matchedReq = 0;
    const updatedChecklist = initialChecklist.map((item) => {
      const isSimulated = simulatedSkills[item.name];
      const isMatched = isSimulated !== undefined ? isSimulated : item.matched;
      if (item.isRequired && isMatched) {
        matchedReq += 1;
      }
      return {
        ...item,
        matched: isMatched,
        wasSimulated: isSimulated !== undefined && isSimulated !== item.matched,
      };
    });

    const newScore = requiredTotalCount > 0
      ? Math.round((matchedReq / requiredTotalCount) * 100)
      : 100;

    return {
      currentScore: Math.min(100, Math.max(0, newScore)),
      currentMatchedCount: matchedReq,
      liveChecklist: updatedChecklist,
    };
  }, [initialScore, initialMatchedCount, requiredTotalCount, initialChecklist, simulatedSkills, simulatorActive]);

  const scoreColor =
    currentScore >= 85
      ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]'
      : currentScore >= 60
      ? 'text-[#ffad75] drop-shadow-[0_0_10px_rgba(246,111,20,0.5)]'
      : 'text-amber-400';

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
        <span className={`font-bold ${scoreColor}`}>{currentScore}% Match</span>
        <span className="text-slate-600" aria-hidden="true">·</span>
        <span className="text-slate-400">
          {currentMatchedCount}/{requiredTotalCount} Skills
        </span>
      </div>
    );
  }

  const toggleSkill = (skillName, currentStatus) => {
    if (!simulatorActive) setSimulatorActive(true);
    setSimulatedSkills((prev) => ({
      ...prev,
      [skillName]: !currentStatus,
    }));
  };

  const resetSimulator = () => {
    setSimulatedSkills({});
    setSimulatorActive(false);
  };

  return (
    <div className="redsun-box p-6 rounded-2xl space-y-5 border border-[#f77218]/30 shadow-2xl relative overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#f77218]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white font-display">
              Skill Compatibility Evaluation
            </h3>
            {simulatorActive && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f66f14]/20 text-[#ffad75] border border-[#f66f14]/40 font-bold animate-pulse">
                SIMULATION ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent algorithmic comparison between student skills and verified requirements
          </p>
        </div>

        <div className="flex items-center gap-3">
          {simulatorActive && (
            <button
              type="button"
              onClick={resetSimulator}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <div className={`text-3xl font-extrabold font-mono tabular-nums ${scoreColor} transition-all duration-300`}>
            {currentScore}%
          </div>
        </div>
      </div>

      {/* Dynamic Animated Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Target Qualification Threshold (75%)</span>
          <span>{currentMatchedCount} of {requiredTotalCount} Required Skills Met</span>
        </div>
        <div className="w-full h-2.5 bg-[#060910] rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              currentScore >= 75
                ? 'bg-gradient-to-r from-amber-500 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-r from-red-600 to-[#f66f14]'
            }`}
            style={{ width: `${currentScore}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-[#f77218]/15 pb-4">
        <div>
          <div className="text-slate-400">Matching Skills</div>
          <div className="text-sm font-semibold font-mono tabular-nums text-white mt-0.5">
            {currentMatchedCount} of {requiredTotalCount}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Field Compatibility</div>
          <div className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">
            {breakdown.fieldCompatible ? 'Compatible ✓' : 'Cross-Disciplinary'}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Academic Level</div>
          <div className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">
            {breakdown.levelCompatible ? 'Eligible ✓' : 'Review Level'}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Location / Mode</div>
          <div className="text-sm font-semibold font-mono text-slate-200 mt-0.5">
            {breakdown.locationCompatible ? 'Aligned ✓' : 'Relocation / Hybrid'}
          </div>
        </div>
      </div>

      {/* Interactive Skill Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Interactive Skill Checklist <span className="text-slate-500 font-normal">(Click any skill to simulate match)</span>:
          </span>
          <span className="text-[11px] font-mono text-[#ffad75] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Click to Toggle
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {liveChecklist.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => toggleSkill(item.name, item.matched)}
              className={`flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl border text-left font-mono transition-all duration-200 cursor-pointer ${
                item.matched
                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-[#060910] text-slate-400 border-slate-800 hover:border-[#f66f14]/50 hover:text-slate-200'
              } ${item.wasSimulated ? 'ring-2 ring-[#f66f14]' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{item.name}</span>
                <span className="text-[10px] text-slate-500 font-sans">
                  ({item.isRequired ? 'Required' : 'Preferred'})
                </span>
                {item.wasSimulated && (
                  <span className="text-[9px] px-1 rounded bg-[#f66f14] text-slate-950 font-bold">
                    SIM
                  </span>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                  item.matched
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                }`}
              >
                {item.matched ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                <span>{item.matched ? 'Matched' : 'Missing'}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
