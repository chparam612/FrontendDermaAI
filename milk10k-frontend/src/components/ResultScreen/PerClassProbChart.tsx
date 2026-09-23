import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { MALIGNANT_CLASSES } from '../../constants/diagnosisGroups';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export interface PerClassProbChartProps {
  perClassProbs: Record<string, number>;
}

interface ChartDataItem {
  className: string;
  probability: number;
  percentage: number;
  isMalignant: boolean;
}

export function PerClassProbChart({ perClassProbs }: PerClassProbChartProps) {
  // Sort classes by probability descending
  const chartData: ChartDataItem[] = Object.entries(perClassProbs)
    .map(([cls, prob]) => ({
      className: cls,
      probability: prob,
      percentage: Number((prob * 100).toFixed(1)),
      isMalignant: MALIGNANT_CLASSES.has(cls),
    }))
    .sort((a, b) => b.probability - a.probability);

  const topPrediction = chartData[0];

  return (
    <section
      aria-label="Differential Diagnostic Distribution (11 Classes)"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">
            Differential Diagnostic Distribution
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Model class probabilities across 11 diagnostic classes (sorted descending)
          </p>
        </div>

        {/* Legend showing visual indicators beyond color alone */}
        <div className="flex items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
            <span>⚠ Malignant</span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Benign</span>
          </span>
        </div>
      </div>

      {/* Screen-reader accessible tabular fallback */}
      <div className="sr-only">
        <p>
          Differential diagnostic distribution chart with 11 classes sorted descending:
        </p>
        <ul>
          {chartData.map((item) => (
            <li key={item.className}>
              {item.className} ({item.isMalignant ? 'Malignant' : 'Benign'}): {item.percentage}%
            </li>
          ))}
        </ul>
      </div>

      {/* Recharts Horizontal BarChart (Vertical Layout) */}
      <div className="w-full h-96" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(val: number) => `${val}%`}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              type="category"
              dataKey="className"
              width={75}
              tick={(props: unknown) => {
                const { x, y, payload } = props as {
                  x: number;
                  y: number;
                  payload: { value: string };
                };
                const cls = payload?.value ?? '';
                const isMalignant = MALIGNANT_CLASSES.has(cls);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-6}
                      y={4}
                      textAnchor="end"
                      fontSize={11}
                      fontWeight={isMalignant ? 700 : 500}
                      fill={isMalignant ? '#dc2626' : '#334155'}
                    >
                      {isMalignant ? `⚠ ${cls}` : cls}
                    </text>
                  </g>
                );
              }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              formatter={(value: unknown, _name: unknown, item: unknown) => {
                const payloadItem = item as { payload?: ChartDataItem };
                const isMal = payloadItem?.payload?.isMalignant;
                return [
                  `${value}% (${isMal ? 'Malignant' : 'Benign'})`,
                  'Probability',
                ];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.className}`}
                  fill={entry.isMalignant ? '#fee2e2' : '#e0f2fe'}
                  stroke={entry.isMalignant ? '#dc2626' : '#0284c7'}
                  strokeWidth={entry.isMalignant ? 2 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {topPrediction && (
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>
            Primary candidate: <strong className="text-slate-800">{topPrediction.className}</strong> ({topPrediction.percentage}%)
            {topPrediction.isMalignant && (
              <span className="text-red-600 font-semibold ml-1.5">— Malignant finding</span>
            )}
          </span>
          <span className="text-[11px] text-slate-400">Total 11 classes evaluated</span>
        </p>
      )}
    </section>
  );
}

export default PerClassProbChart;
