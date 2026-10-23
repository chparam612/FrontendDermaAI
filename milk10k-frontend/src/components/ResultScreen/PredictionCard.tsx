import { statusTokens } from '../../styles/tokens';
import { ShieldAlert, Clock, Info } from 'lucide-react';

export interface PredictionCardProps {
  predictedClass: string;
  confidence: number;
  malignantProbability: number;
  modelVersion: string;
  inferenceMs?: number;
  inputNote?: string;
  disclaimer?: string;
}

export function PredictionCard({
  predictedClass,
  confidence,
  malignantProbability,
  modelVersion,
  inferenceMs,
  inputNote,
  disclaimer,
}: PredictionCardProps) {
  const isMalignant = malignantProbability > 0.5;
  const token = statusTokens[isMalignant ? 'malignant' : 'benign'];
  const StatusIcon = token.icon;

  const scorePct = (confidence * 100).toFixed(1);
  const malignantPct = (malignantProbability * 100).toFixed(1);

  return (
    <article
      aria-label="Model Prediction Summary"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Model Prediction
          </span>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {predictedClass}
          </h3>
        </div>

        {/* Accessible status badge with icon + text + uncalibrated warning */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div
            role="status"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border shadow-xs ${token.bgClass}`}
          >
            <StatusIcon className={`w-5 h-5 shrink-0 ${token.iconClass}`} aria-hidden="true" />
            <div className="flex flex-col">
              <span className="leading-tight">{token.badgeLabel}</span>
              <span className="text-[10px] opacity-80 font-medium">
                Score (Malignant Classes): {malignantPct}%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium leading-tight sm:text-right max-w-xs">
            Not a risk estimate. Scores are uncalibrated; misses and false alarms occur.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Uncalibrated model score */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-600 font-semibold">Model score (uncalibrated)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{scorePct}%</p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all"
              style={{ width: `${scorePct}%` }}
              aria-label={`Model score uncalibrated: ${scorePct}%`}
            />
          </div>
        </div>

        {/* Uncalibrated malignant classes score */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-600 font-semibold">
            Model score: malignant classes (uncalibrated)
          </p>
          <p className={`text-2xl font-bold mt-1 ${isMalignant ? 'text-red-600' : 'text-emerald-600'}`}>
            {malignantPct}%
          </p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isMalignant ? 'bg-red-600' : 'bg-emerald-600'}`}
              style={{ width: `${malignantPct}%` }}
              aria-label={`Malignant classes score uncalibrated: ${malignantPct}%`}
            />
          </div>
        </div>

        {/* Model metadata & inference latency */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Model Version</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate" title={modelVersion}>
              {modelVersion}
            </p>
            {inferenceMs !== undefined && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Inference: {inferenceMs.toFixed(1)} ms</span>
              </p>
            )}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            Decision-support only
          </p>
        </div>
      </div>

      {/* Input note regarding modalities */}
      {inputNote && (
        <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-100 text-sky-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-semibold block">Input Modality Note:</span>
            <span className="text-sky-800 leading-relaxed">{inputNote}</span>
          </div>
        </div>
      )}

      {/* Response-attached Regulatory Disclaimer */}
      {disclaimer && (
        <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span className="font-medium italic">{disclaimer}</span>
        </div>
      )}
    </article>
  );
}

export default PredictionCard;
