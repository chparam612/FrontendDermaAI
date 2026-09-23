import { useState } from 'react';
import { ChevronDown, AlertTriangle, Info, Scale, ShieldAlert } from 'lucide-react';
import reportSummary from '../../api/mocks/report_summary.json';
import { TAIL_CLASSES, MALIGNANT_CLASSES } from '../../constants/diagnosisGroups';

interface BucketData {
  fnr: number;
  n_lesions: number;
  low_confidence: boolean;
}

interface ReportSummaryData {
  status: 'real' | 'preliminary' | 'placeholder';
  last_updated: string;
  macro_f1: number | null;
  per_class_f1: Record<string, number | null>;
  tail_class_f1: Record<string, number | null>;
  skin_tone_fnr: {
    dark: BucketData;
    medium: BucketData;
    light: BucketData;
  };
  fnr_gap: number;
  note?: string;
}

export function FairnessPanel() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const data = reportSummary as ReportSummaryData;

  const isPreliminaryOrPlaceholder = data.status === 'placeholder' || data.status === 'preliminary';

  return (
    <section
      aria-label="Fairness and Algorithmic Disparity Audit"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Collapsible Section Trigger Header */}
      <button
        type="button"
        id="fairness-panel-trigger"
        aria-expanded={isExpanded}
        aria-controls="fairness-panel-content"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-inset cursor-pointer"
      >
        <div className="flex items-center gap-3 pr-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Scale className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-slate-800 leading-snug">
            This model's accuracy varies by diagnosis rarity and skin tone — see full report.
          </span>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-180 text-sky-600' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Expanded Content View */}
      {isExpanded && (
        <div
          id="fairness-panel-content"
          role="region"
          aria-labelledby="fairness-panel-trigger"
          className="p-5 pt-0 border-t border-slate-100 flex flex-col gap-6"
        >
          {/* Status Alert Banner for Placeholder / Preliminary Data */}
          {isPreliminaryOrPlaceholder && (
            <div
              role="alert"
              className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-2xs"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-950">
                  {data.status === 'placeholder'
                    ? 'Report data not yet available — showing placeholder values for layout purposes only.'
                    : 'Preliminary evaluation data — benchmark runs still in progress.'}
                </p>
                <p className="text-amber-800">
                  Backend evaluation table (<code className="font-mono text-amber-900 bg-amber-100/80 px-1 py-0.5 rounded">results/ablation_table.csv</code>) is not present. Numbers below are synthetic placeholders and must not be used for clinical decisions.
                </p>
              </div>
            </div>
          )}

          {/* Metric Cards Grid: Macro-F1 & FNR Gap Headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Overall Macro-F1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Overall Macro-F1
                </span>
                <span className="text-[11px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  All 11 Classes
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {data.macro_f1 !== null ? `${(data.macro_f1 * 100).toFixed(1)}%` : 'N/A'}
                </span>
                {data.status === 'placeholder' && (
                  <span className="text-xs text-amber-700 font-semibold">(Placeholder)</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Unweighted arithmetic mean of F1 scores across all diagnostic categories.
              </p>
            </div>

            {/* 2. Headline FNR Gap */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Max Disparity (FNR Gap)
                </span>
                <span className="text-[11px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  Skin Tone Subgroups
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {(data.fnr_gap * 100).toFixed(1)}%
                </span>
                {data.status === 'placeholder' && (
                  <span className="text-xs text-amber-700 font-semibold">(Placeholder)</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Maximum minus minimum False Negative Rate disparity across skin-tone buckets.
              </p>
            </div>
          </div>

          {/* Section: Subgroup Performance by Skin-Tone Bucket */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                Skin-Tone Disaggregated False Negative Rate (FNR)
              </h5>
              <span className="text-[11px] text-slate-400">
                Section 6 Audit Threshold: n &ge; 30
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['dark', 'medium', 'light'] as const).map((bucketKey) => {
                const bucket = data.skin_tone_fnr[bucketKey];
                const label = bucketKey.charAt(0).toUpperCase() + bucketKey.slice(1);

                return (
                  <div
                    key={bucketKey}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{label} Skin Tone</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        n = {bucket.n_lesions}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Malignancy FNR:</span>
                      <span className="text-base font-bold font-mono text-slate-900">
                        {(bucket.fnr * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Low-confidence indicator using both icon and text */}
                    {bucket.low_confidence ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                        <span>Low confidence (n &lt; 30)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                        <span>Adequate sample size (n &ge; 30)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Tail-Class Diagnostic Performance */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" aria-hidden="true" />
                Tail-Class Diagnostic Performance (5 Rarest Classes)
              </h5>
              <span className="text-[11px] text-slate-400 font-mono">
                Last updated: {data.last_updated}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-2.5">Class Code</th>
                    <th scope="col" className="px-4 py-2.5">Clinical Classification</th>
                    <th scope="col" className="px-4 py-2.5 text-right">F1 Score</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Evaluation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TAIL_CLASSES.map((cls) => {
                    const score = data.tail_class_f1[cls];
                    const isMalignant = MALIGNANT_CLASSES.has(cls);
                    const isMalOth = cls === 'MAL_OTH';

                    return (
                      <tr key={cls} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-2.5 font-bold font-mono text-slate-900">
                          {cls}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isMalignant
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isMalignant ? '⚠ Malignant' : 'Benign'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">
                          {score !== null && score !== undefined
                            ? `${(score * 100).toFixed(1)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-500">
                          {isMalOth && score === null ? (
                            <span className="text-amber-700 font-medium">
                              Unstable estimate (n = 9 lesions)
                            </span>
                          ) : data.status === 'placeholder' ? (
                            <span className="text-slate-400">Placeholder value</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Measured</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default FairnessPanel;
