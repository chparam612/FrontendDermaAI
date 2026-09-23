import { statusTokens } from '../../styles/tokens';
import { ShieldAlert } from 'lucide-react';

export interface PredictionCardProps {
  predictedClass: string;
  confidence: number;
  malignantProbability: number;
  modelVersion: string;
}

export function PredictionCard({
  predictedClass,
  confidence,
  malignantProbability,
  modelVersion,
}: PredictionCardProps) {
  const isMalignant = malignantProbability > 0.5;
  const token = statusTokens[isMalignant ? 'malignant' : 'benign'];
  const StatusIcon = token.icon;

  const confidencePct = (confidence * 100).toFixed(1);
  const malignantPct = (malignantProbability * 100).toFixed(1);

  return (
    <article
      aria-label="Diagnostic Prediction Summary"
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

        {/* Accessible status badge with icon + text + high contrast color */}
        <div
          role="status"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border shadow-xs ${token.bgClass}`}
        >
          <StatusIcon className={`w-5 h-5 shrink-0 ${token.iconClass}`} aria-hidden="true" />
          <div className="flex flex-col">
            <span className="leading-tight">{token.badgeLabel}</span>
            <span className="text-[10px] opacity-80 font-medium">
              Malignant Prob: {malignantPct}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium">Confidence</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{confidencePct}%</p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all"
              style={{ width: `${confidencePct}%` }}
              aria-label={`Confidence progress: ${confidencePct}%`}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium">Malignancy Probability</p>
          <p className={`text-2xl font-bold mt-1 ${isMalignant ? 'text-red-600' : 'text-emerald-600'}`}>
            {malignantPct}%
          </p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isMalignant ? 'bg-red-600' : 'bg-emerald-600'}`}
              style={{ width: `${malignantPct}%` }}
              aria-label={`Malignancy probability: ${malignantPct}%`}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Model Architecture</p>
            <p className="text-sm font-semibold text-slate-800 mt-1 truncate" title={modelVersion}>
              {modelVersion}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            Decision-support only
          </p>
        </div>
      </div>
    </article>
  );
}

export default PredictionCard;
