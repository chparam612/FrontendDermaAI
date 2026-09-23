import type { PredictResponse } from '../../api/types';
import { PredictionCard } from './PredictionCard';
import { PerClassProbChart } from './PerClassProbChart';
import { ExplainabilityOverlay } from './ExplainabilityOverlay';
import { ConceptRadarChart } from './ConceptRadarChart';
import { FairnessPanel } from './FairnessPanel';
import { ArrowLeft, AlertOctagon } from 'lucide-react';

export interface ResultScreenProps {
  result: PredictResponse;
  previewUrl?: string;
  onBackToUpload: () => void;
}

export function ResultScreen({ result, previewUrl, onBackToUpload }: ResultScreenProps) {
  return (
    <section aria-label="Analysis Results" className="flex flex-col gap-6 max-w-5xl mx-auto py-4">
      {/* Header with Navigation */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToUpload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-sky-600 outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Upload
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Diagnostic Assessment Report
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated via multi-view PanDerm vision model
            </p>
          </div>
        </div>
      </header>

      {/* Mandatory clinical advisory notice */}
      <div
        role="note"
        className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2"
      >
        <AlertOctagon className="w-4 h-4 shrink-0 text-amber-700" aria-hidden="true" />
        <span>
          Clinical Notice: Results are non-diagnostic decision-support estimations derived from multi-modal analysis.
        </span>
      </div>

      {/* 1. Primary Prediction Summary Card */}
      <PredictionCard
        predictedClass={result.predicted_class}
        confidence={result.confidence}
        malignantProbability={result.malignant_probability}
        modelVersion={result.model_version}
      />

      {/* 2 & 3. Explainability Lesion View & 11-Class Probability Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExplainabilityOverlay
          overlayDataUri={result.explainability_overlay}
          previewUrl={previewUrl}
        />
        <PerClassProbChart perClassProbs={result.per_class_probs} />
      </div>

      {/* 4. Dermatological Concept Radar/List */}
      <ConceptRadarChart conceptScores={result.concept_scores} />

      {/* 5. Fairness & Demographic Audit Panel */}
      <FairnessPanel />
    </section>
  );
}

export default ResultScreen;
