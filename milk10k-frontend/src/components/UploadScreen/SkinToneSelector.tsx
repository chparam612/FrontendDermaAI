export interface SkinToneSelectorProps {
  value: number | undefined;
  onChange: (tone: number | undefined) => void;
}

export const SKIN_TONE_CLAIM =
  'As defined in the MILK10k metadata (0 = darkest, 5 = lightest); not Fitzpatrick.';

const TONE_OPTIONS = [
  { value: 0, label: 'Class 0', desc: 'Metadata class 0', swatch: '#452C1E' },
  { value: 1, label: 'Class 1', desc: 'Metadata class 1', swatch: '#8D5B36' },
  { value: 2, label: 'Class 2', desc: 'Metadata class 2', swatch: '#BA8D68' },
  { value: 3, label: 'Class 3', desc: 'Metadata class 3', swatch: '#E8C5A5' },
  { value: 4, label: 'Class 4', desc: 'Metadata class 4', swatch: '#F9E4D4' },
  { value: 5, label: 'Class 5', desc: 'Metadata class 5', swatch: '#FFF0E5' },
] as const;

export function SkinToneSelector({ value, onChange }: SkinToneSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3 w-full border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <legend className="text-sm font-semibold text-slate-800">
          MILK10k skin-tone class 0–5 <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Not used by the model (recorded only)</span>
        </legend>
        <span className="text-xs text-slate-500">
          {SKIN_TONE_CLAIM}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="MILK10k skin-tone class selection (0 to 5 or skip)"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1"
      >
        {TONE_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer text-center outline-none ${
                isSelected
                  ? 'border-sky-600 bg-sky-50 shadow-sm ring-2 ring-sky-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="skin-tone"
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                className="w-7 h-7 rounded-full border border-slate-300 shadow-inner mb-1.5"
                style={{ backgroundColor: opt.swatch }}
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-slate-800">{opt.label}</span>
              <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</span>
            </label>
          );
        })}
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer ${
            value === undefined
              ? 'bg-slate-100 text-slate-800 font-semibold border-slate-300'
              : 'text-slate-500 hover:text-slate-700 border-transparent hover:bg-slate-50'
          }`}
        >
          {value === undefined ? '✓ Skipped (Unspecified)' : 'Prefer not to say / Skip'}
        </button>
      </div>
    </fieldset>
  );
}

export default SkinToneSelector;
