import { useCallback, useState } from "react";

export const PEPTIDE_TRIAL_LIMIT = 2;

function readUses(key) {
  try {
    const value = Number(localStorage.getItem(key) || 0);
    return Number.isFinite(value) ? Math.max(0, Math.min(PEPTIDE_TRIAL_LIMIT, value)) : 0;
  } catch {
    return 0;
  }
}

export function usePeptideTrial(toolId, isPro = false) {
  const key = `evidstack_peptide_trial_${toolId}`;
  const [used, setUsed] = useState(() => readUses(key));
  const consume = useCallback(() => {
    if (isPro) return true;
    const current = readUses(key);
    if (current >= PEPTIDE_TRIAL_LIMIT) {
      setUsed(PEPTIDE_TRIAL_LIMIT);
      return false;
    }
    const next = current + 1;
    setUsed(next);
    try { localStorage.setItem(key, String(next)); } catch {}
    return true;
  }, [isPro, key]);
  return {
    used: isPro ? 0 : used,
    remaining: isPro ? Infinity : Math.max(0, PEPTIDE_TRIAL_LIMIT - used),
    locked: !isPro && used >= PEPTIDE_TRIAL_LIMIT,
    consume,
  };
}
