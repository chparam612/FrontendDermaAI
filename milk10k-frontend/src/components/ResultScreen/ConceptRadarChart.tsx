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
import { Compass } from 'lucide-react';

export interface ConceptRadarChartProps {
  conceptScores: PredictResponse['concept_scores'];
}

const CONCEPT_DEFINITIONS: Array<{
  key: keyof PredictResponse['concept_scores'];
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
  const radarData = CONCEPT_DEFINITIONS.map(({ key, label }) => {
    const rawVal = conceptScores ? conceptScores[key] ?? 0 : 0;
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

      {/* Screen-reader accessible tabular fallback */}
      <div className="sr-only">
        <p>Model's attention to clinical features — not a diagnosis.</p>
        <ul>
          {radarData.map((item) => (
            <li key={item.concept}>
              {item.concept}: {item.percentage}%
            </li>
          ))}
        </ul>
      </div>

      {/* Recharts RadarChart */}
      <div className="w-full h-80 sm:h-96" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="concept"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tickCount={5}
              tickFormatter={(val: number) => `${Math.round(val * 100)}%`}
              tick={{ fill: '#64748b', fontSize: 10 }}
              stroke="#cbd5e1"
            />
            <Radar
              name="Attention Score"
              dataKey="score"
              stroke="#0d9488"
              fill="#14b8a6"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Tooltip
              formatter={(val: unknown) => [
                `${(Number(val) * 100).toFixed(0)}%`,
                'Attention Score',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Mandatory exact caption text directly below the chart */}
      <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-center">
        <p className="text-xs font-semibold text-teal-900">
          Model's attention to clinical features — not a diagnosis.
        </p>
      </div>
    </section>
  );
}

export default ConceptRadarChart;
