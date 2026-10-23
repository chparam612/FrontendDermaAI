import { useState } from 'react';
import { Info, ChevronDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { getModelInfo } from '../api/apiClient';
import type { ModelInfoResponse } from '../api/types';

export function AboutModelPanel() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchInfo = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getModelInfo({ timeoutMs: 4000 });
      setModelInfo(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve model info';
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && !modelInfo && !isLoading) {
      fetchInfo();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <button
        type="button"
        id="about-model-trigger"
        aria-expanded={isOpen}
        aria-controls="about-model-content"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-inset"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">About This Model &amp; Technical Limitations</span>
            <span className="text-[11px] text-slate-500 block">Provenance, evaluated modality, and clinical caveats</span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-600' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id="about-model-content"
          role="region"
          aria-labelledby="about-model-trigger"
          className="border-t border-slate-200 p-4 bg-slate-50/70 text-xs text-slate-700 flex flex-col gap-3.5"
        >
          {isLoading && (
            <div className="flex items-center gap-2 py-3 text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin text-sky-600" aria-hidden="true" />
              <span>Fetching model specifications from backend...</span>
            </div>
          )}

          {loadError && !isLoading && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Unable to load model metadata from backend</p>
                  <p className="text-[11px] mt-0.5">{loadError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchInfo}
                className="px-2 py-1 bg-white border border-red-300 rounded text-[11px] font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {modelInfo && !isLoading && (
            <>
              {/* Provenance details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Model Version</span>
                  <span className="font-mono font-semibold text-slate-800 text-[11px] mt-0.5 block truncate" title={modelInfo.model_version}>
                    {modelInfo.model_version}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Experiment / Seed</span>
                  <span className="font-semibold text-slate-800 text-[11px] mt-0.5 block truncate">
                    {modelInfo.provenance.experiment_name} (seed {modelInfo.provenance.seed})
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Split Partition SHA-256</span>
                  <span className="font-mono text-slate-700 text-[10px] mt-0.5 block truncate" title={modelInfo.provenance.split_sha256}>
                    {modelInfo.provenance.split_sha256.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Limitations */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  <span>Clinical Limitations &amp; Modality Scope</span>
                </div>
                <p className="text-amber-900/90 leading-relaxed text-[11px]">{modelInfo.limitations}</p>
              </div>

              {/* Classes breakdown */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-[11px]">Supported Diagnostic Classes (11 Total)</span>
                  <span className="text-[10px] text-slate-400">Malignant flagged</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {modelInfo.classes.map((cls) => {
                    const isMal = modelInfo.malignant_classes.includes(cls);
                    return (
                      <span
                        key={cls}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          isMal
                            ? 'bg-red-50 text-red-700 border border-red-200 font-bold'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isMal && <span aria-hidden="true">⚠</span>}
                        {cls}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Regulatory Disclaimer from Model */}
              <p className="text-[10px] text-slate-500 italic border-l-2 border-slate-300 pl-2">
                {modelInfo.disclaimer}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
