import { useState } from 'react';
import { ChevronDown, Scale, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import rawReportData from '../../data/report_summary.json';
import type { ReportSummaryPayload } from '../../data/reportSummaryTypes';

const reportData = rawReportData as ReportSummaryPayload;

function sanitizePath(p: string): string {
  return p.replace(/^[A-Za-z]:[\\/][^\\/]+[\\/]/g, '').replace(/Users[\\/][^\\/]+[\\/]/g, '');
}

export function FairnessPanel() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const {
    provenance,
    overall_test_metrics,
    malignant_vs_benign_metrics,
    per_class_metrics,
    skin_tone_subgroup_metrics,
    caveats,
  } = reportData;

  const replicateScore = overall_test_metrics.seed43_replicate_macro_f1
    ? (overall_test_metrics.seed43_replicate_macro_f1 * 100).toFixed(1)
    : '36.4';

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
          <div>
            <span className="text-sm font-semibold text-slate-800 leading-snug block">
              This model's accuracy varies by diagnosis rarity and skin tone — see full report.
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Audited on MILK10k held-out partition (N={provenance.total_test_samples} lesions) &bull; Single run (seed 42): Macro-F1 = {(overall_test_metrics.macro_f1 * 100).toFixed(1)}% (second run of the same recipe scored substantially lower: {replicateScore}%)
            </span>
          </div>
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
          {/* Neutral Audit Status Stamp */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-slate-800">
                Generated from saved results files &bull; Model: {provenance.model_architecture}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Split SHA: {provenance.split_sha256.slice(0, 16)}... | Seed {provenance.seed}
            </div>
          </div>

          {/* BLOCK 1: Provenance and Split Hash */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Training &amp; Split Provenance
              </h5>
              <span className="text-[10px] font-mono text-slate-400">
                Source: {sanitizePath(provenance.source)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Experiment</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block truncate">{provenance.experiment_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Random Seed</span>
                <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">{provenance.seed}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Evaluated Modality</span>
                <span className="font-medium text-slate-800 text-xs mt-0.5 block truncate">{provenance.modality_evaluated}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Test Sample Size</span>
                <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">{provenance.total_test_samples} lesions</span>
              </div>
            </div>
          </div>

          {/* BLOCK 2: Overall Test Metrics */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Overall Evaluation Metrics (Held-out Test Partition)
              </h5>
              <span className="text-[10px] font-mono text-slate-400">
                Source: {sanitizePath(overall_test_metrics.source)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Macro-F1 (Seed 42)</span>
                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                  {(overall_test_metrics.macro_f1 * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">Single primary run</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Accuracy</span>
                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                  {(overall_test_metrics.accuracy * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">Top-1 accuracy</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Balanced Acc</span>
                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                  {(overall_test_metrics.balanced_accuracy * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">Mean class recall</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Weighted-F1</span>
                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                  {(overall_test_metrics.weighted_f1 * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">Support-weighted</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Macro AUROC</span>
                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                  {overall_test_metrics.macro_auroc.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400">One-vs-rest mean</span>
              </div>
            </div>
          </div>

          {/* BLOCK 3: Malignant vs Benign Binary Audit */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden="true" />
                3. Malignant vs Benign Binary Detection Metrics
              </h5>
              <span className="text-[10px] font-mono text-slate-400">
                Source: {sanitizePath(malignant_vs_benign_metrics.source)}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Sensitivity (Recall)</span>
                  <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">
                    {(malignant_vs_benign_metrics.sensitivity * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400">Malignant detection rate</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Specificity</span>
                  <span className="text-xl font-black text-slate-800 font-mono mt-0.5 block">
                    {(malignant_vs_benign_metrics.specificity * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400">Benign true negative rate</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-red-200">
                  <span className="text-[10px] uppercase font-bold text-red-600 block">False Negatives (FN)</span>
                  <span className="text-xl font-black text-red-700 font-mono mt-0.5 block">
                    {malignant_vs_benign_metrics.false_negative_count}
                  </span>
                  <span className="text-[10px] text-red-600 font-medium">Critical misses ({((malignant_vs_benign_metrics.false_negative_count / malignant_vs_benign_metrics.total_malignant) * 100).toFixed(1)}%)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">False Positives (FP)</span>
                  <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">
                    {malignant_vs_benign_metrics.false_positive_count}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">Benign false alarms</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2.5">
                <span>
                  <strong>Malignant Classes:</strong> {malignant_vs_benign_metrics.malignant_classes.join(', ')}
                </span>
                <span className="font-mono text-slate-500">
                  TP={malignant_vs_benign_metrics.true_positive_count} &bull; TN={malignant_vs_benign_metrics.true_negative_count} &bull; Total Malignant={malignant_vs_benign_metrics.total_malignant} &bull; Total Benign={malignant_vs_benign_metrics.total_benign}
                </span>
              </div>
            </div>
          </div>

          {/* BLOCK 4: Per-Class Recall & F1 with Support and Tail Class Flags */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Per-Class Diagnostic Performance &amp; Long-Tail Support
              </h5>
              <span className="text-[10px] font-mono text-slate-400">
                Source: {sanitizePath(per_class_metrics.source)}
              </span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1 Score</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Test Support (N)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {Object.entries(per_class_metrics.classes).map(([cls, metric]) => {
                    const isMalignant = malignant_vs_benign_metrics.malignant_classes.includes(cls);
                    return (
                      <tr key={cls} className={metric.is_tail_class ? 'bg-amber-50/40' : ''}>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {cls}
                          {isMalignant && (
                            <span className="ml-1 text-[10px] text-red-600 font-semibold" title="Malignant diagnostic class">
                              [Mal]
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-[11px] font-sans">
                          {metric.is_tail_class ? (
                            <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px]">
                              ⚠ Rare Tail Class
                            </span>
                          ) : (
                            <span className="text-slate-500">Head / Moderate</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {(metric.recall * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {(metric.f1_score * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {(metric.precision * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-bold">
                          {metric.support}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOCK 5: Demographic Subgroups (Skin Tone Disparity Audit) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                5. Demographic Subgroups (Skin Tone Disparity Audit)
              </h5>
              <span className="text-[10px] font-mono text-slate-400">
                Source: {sanitizePath(skin_tone_subgroup_metrics.source)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {Object.entries(skin_tone_subgroup_metrics.subgroups).map(([bucketKey, subgroup]) => {
                const label = bucketKey.replace('skin_tone_', 'Tone ');
                return (
                  <div
                    key={bucketKey}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                      subgroup.low_confidence
                        ? 'bg-amber-50/80 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{label}</span>
                      <span className="text-[10px] font-mono text-slate-500">n={subgroup.sample_count}</span>
                    </div>

                    <div className="space-y-0.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans text-[11px]">Accuracy:</span>
                        <span className="font-bold text-slate-800">{(subgroup.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans text-[11px]">Bal. Acc:</span>
                        <span className="font-semibold text-slate-700">{(subgroup.balanced_accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans text-[11px]">Macro-F1:</span>
                        <span className="font-semibold text-slate-700">{(subgroup.macro_f1 * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Low confidence flag shown as icon + text */}
                    {subgroup.low_confidence ? (
                      <div
                        role="status"
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
                        <span>Low confidence (n &lt; 30)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span>Adequate sample size</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Disparity metrics with explicit tone comparisons and diagnosis mix caveat */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col gap-2">
              <div className="space-y-1">
                <span className="font-semibold text-slate-800 block text-xs">Disparity Comparison:</span>
                <p className="leading-relaxed">
                  <strong>Balanced Accuracy Disparity = {(skin_tone_subgroup_metrics.balanced_accuracy_disparity * 100).toFixed(2)}%</strong> between Tone 2 (n=72) and Tone 3 (n=486).
                </p>
                <p className="leading-relaxed">
                  <strong>Accuracy Disparity = {(skin_tone_subgroup_metrics.accuracy_disparity * 100).toFixed(2)}%</strong> between Tone 2 (n=72) and Tone 1 (n=12).
                </p>
                <p className="text-amber-800 font-medium">
                  Groups have different diagnosis mixes, so these gaps are not like-for-like.
                </p>
              </div>
              <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-1.5">
                {skin_tone_subgroup_metrics.disparity_caveat}
              </p>
            </div>
          </div>

          {/* BLOCK 6: Caveats List Verbatim */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" aria-hidden="true" />
                6. Critical Scientific &amp; Clinical Caveats (Verbatim)
              </h5>
              <span className="text-[10px] font-mono text-slate-400">
                Source: {sanitizePath(caveats.source)}
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 list-disc pl-5">
              <li className="leading-relaxed">
                <strong>Single Training Run:</strong> {caveats.single_run}
              </li>
              <li className="leading-relaxed">
                <strong>Seed Variance:</strong> {caveats.seed_variance}
              </li>
              <li className="leading-relaxed">
                <strong>Internal Test Split Only:</strong> {caveats.internal_test_split}
              </li>
              <li className="leading-relaxed">
                <strong>Tail Class Low Support:</strong> Test supports for extreme tail classes:{' '}
                {Object.entries(caveats.tail_class_supports)
                  .map(([cls, count]) => `${cls}: n=${count}`)
                  .join(', ')}
                . High metric variance expected.
              </li>
              <li className="leading-relaxed">
                <strong>Published Benchmark Incomparability:</strong> {caveats.published_benchmark_incomparability}
              </li>
              <li className="leading-relaxed font-semibold text-slate-900">
                <strong>Clinical Scope:</strong> {caveats.clinical_decision_support_only}
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export default FairnessPanel;
