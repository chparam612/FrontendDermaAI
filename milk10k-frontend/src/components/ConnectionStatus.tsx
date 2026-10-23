import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getHealth } from '../api/apiClient';
import type { HealthResponse } from '../api/types';

export function ConnectionStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    setHasError(false);
    try {
      const data = await getHealth({ timeoutMs: 4000 });
      setHealth(data);
    } catch {
      setHasError(true);
      setHealth(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getHealth({ timeoutMs: 4000 })
      .then((data) => {
        if (active) setHealth(data);
      })
      .catch(() => {
        if (active) {
          setHasError(true);
          setHealth(null);
        }
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (isChecking && !health && !hasError) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" aria-hidden="true" />
        <span>Checking backend...</span>
      </div>
    );
  }

  if (hasError || !health) {
    return (
      <button
        type="button"
        onClick={checkStatus}
        title="Backend API is unreachable. Click to retry connection check."
        aria-label="Backend status: Disconnected. Click to recheck."
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
        <span>Backend Offline</span>
        <span className="text-[10px] text-red-500 underline font-normal">(retry)</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={checkStatus}
      title={`Backend online. Device: ${health.device}, Model: ${health.model_version}, Checkpoint: ${health.checkpoint_sha256}. Click to recheck.`}
      aria-label={`Backend status: Online. Running on ${health.device}. Checkpoint ${health.checkpoint_sha256}.`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-850 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
      <span>Online ({health.device})</span>
      <span className="text-[10px] text-emerald-700 font-mono font-normal">[{health.checkpoint_sha256}]</span>
    </button>
  );
}
