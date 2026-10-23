import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import type { PredictResponse } from '../../api/types';
import { Compass, Info } from 'lucide-react';

export interface ConceptRadarChartProps {
  conceptScores: PredictResponse['concept_scores'];
}

const CONCEPT_DEFINITIONS: Array<{
  key: string;
  label: string;
  description: string;
}> = [
  { key: 'ulceration_crust', label: 'Ulceration/Crust', description: 'Surface crusting or ulceration' },
  { key: 'hair', label: 'Hair', description: 'Follicular & hair presence' },
  { key: 'vasculature', label: 'Vasculature', description: 'Atypical or arborizing vascular patterns' },
  { key: 'erythema', label: 'Erythema', description: 'Inflammatory redness or flush' },
  { key: 'pigmented', label: 'Pigmentation', description: 'Melanocytic pigment network' },
  { key: 'gel_fluid', label: 'Gel/Fluid', description: 'Dermoscopic interface fluid' },
  { key: 'skin_markings', label: 'Skin Markings', description: 'Preserved or effaced dermatoglyphics' },
];

export function ConceptRadarChart({ conceptScores }: ConceptRadarChartProps) {
  // When concept_scores is null: show "Not available in this model" (no chart)
  if (!conceptScores) {
    return (
      <section
        aria-label="Clinical Feature Attention Radar"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
      >
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Dermatological Concept Attention Profile
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Concept bottleneck evaluation
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            N/A
          </span>
        </div>

        <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
            <Info className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Not available in this model</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            MONET concept bottleneck layer is not enabled for this ViT-Base baseline arm. Concept scores are null in this response.
          </p>
        </div>
      </section>
    );
  }

  const radarData = CONCEPT_DEFINITIONS.map(({ key, label }) => {
    const rawVal = conceptScores[key] ?? 0;
    return {
      concept: label,
      score: rawVal,
      percentage: Math.round(rawVal * 100),
      fullMark: 1.0,
    };
  });

  return (
    <section
      aria-label="Clinical Feature Attention Radar"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
    >
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" aria-hidden="true" />
            Dermatological Concept Attention Profile
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-attribute feature presence across 7 core dermatological concepts
          </p>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
          7 Concepts
        </span>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="concept"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 1.0]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              stroke="#cbd5e1"
            />
            <Radar
              name="Concept Attribution Score"
              dataKey="score"
              stroke="#0d9488"
              fill="#14b8a6"
              fillOpacity={0.35}
            />
            <Tooltip
              formatter={(value: unknown) => [
                `${(Number(value) * 100).toFixed(0)}% (${Number(value).toFixed(2)})`,
                'Attribution Score',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default ConceptRadarChart;
