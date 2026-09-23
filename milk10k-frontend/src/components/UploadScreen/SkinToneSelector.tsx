export interface SkinToneSelectorProps {
  value: number | undefined;
  onChange: (tone: number | undefined) => void;
}

const TONE_OPTIONS = [
  { value: 0, label: 'Type 0', desc: 'Extremely pale', swatch: '#FFF0E5' },
  { value: 1, label: 'Type 1', desc: 'Fair', swatch: '#F9E4D4' },
  { value: 2, label: 'Type 2', desc: 'Medium fair', swatch: '#E8C5A5' },
  { value: 3, label: 'Type 3', desc: 'Olive / Medium', swatch: '#BA8D68' },
  { value: 4, label: 'Type 4', desc: 'Brown', swatch: '#8D5B36' },
  { value: 5, label: 'Type 5', desc: 'Dark brown / Black', swatch: '#452C1E' },
] as const;

export function SkinToneSelector({ value, onChange }: SkinToneSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3 w-full border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <legend className="text-sm font-semibold text-slate-800">
          Skin Tone / Fitzpatrick Category <span className="text-xs text-slate-500 font-normal">(optional metadata)</span>
        </legend>
        <span className="text-xs text-slate-500">
          Used to verify demographic fairness & model calibration
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Skin tone selection (0 to 5 or skip)"
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
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
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
