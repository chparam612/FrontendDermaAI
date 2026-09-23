import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <aside
      aria-label="Clinical Disclaimer"
      className="sticky top-0 z-50 w-full bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md border-b-2 border-amber-600"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center text-xs md:text-sm font-semibold tracking-wide">
        <AlertTriangle className="h-5 w-5 shrink-0 text-slate-950" aria-hidden="true" />
        <p>
          RESEARCH / DECISION-SUPPORT PROTOTYPE ONLY. Not a diagnostic device. Does not replace
          clinical evaluation, biopsy, or a qualified dermatologist.
        </p>
      </div>
    </aside>
  );
}

export default DisclaimerBanner;
