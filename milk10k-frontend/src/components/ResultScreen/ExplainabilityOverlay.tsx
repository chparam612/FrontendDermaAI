import { useState, useMemo } from 'react';
import { Eye, EyeOff, Layers, AlertCircle, ImageIcon } from 'lucide-react';

export interface ExplainabilityOverlayProps {
  overlayDataUri?: string;
  previewUrl?: string;
}

export function ExplainabilityOverlay({
  overlayDataUri,
  previewUrl,
}: ExplainabilityOverlayProps) {
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [overlayError, setOverlayError] = useState<boolean>(false);

  // Normalize base64 overlay URI
  const formattedOverlayUri = useMemo(() => {
    if (!overlayDataUri || overlayDataUri.trim() === '') {
      return null;
    }
    const trimmed = overlayDataUri.trim();
    if (trimmed.startsWith('data:image/')) {
      return trimmed;
    }
    // Prepend standard base64 png prefix if raw base64 string provided
    return `data:image/png;base64,${trimmed}`;
  }, [overlayDataUri]);

  const isOverlayAvailable = Boolean(formattedOverlayUri && !overlayError);

  return (
    <section
      aria-label="Explainability Lesion View"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
    >
      {/* Header with Title and Accessible Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" aria-hidden="true" />
            Visual Attention & Heatmap Overlay
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Macroscopic lesion photograph with model saliency attribution
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="overlay-toggle"
            className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 select-none"
          >
            {showOverlay ? (
              <Eye className="w-4 h-4 text-sky-600" aria-hidden="true" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-400" aria-hidden="true" />
            )}
            <span>Heatmap Overlay:</span>
          </label>
          <button
            type="button"
            id="overlay-toggle"
            role="switch"
            aria-checked={showOverlay}
            aria-label="Toggle visual attention heatmap overlay"
            disabled={!isOverlayAvailable}
            onClick={() => setShowOverlay((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 ${
              !isOverlayAvailable
                ? 'bg-slate-200 cursor-not-allowed opacity-60'
                : showOverlay
                ? 'bg-sky-600'
                : 'bg-slate-300'
            }`}
          >
            <span className="sr-only">Toggle visual attention heatmap overlay</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                showOverlay && isOverlayAvailable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-mono font-medium text-slate-500 min-w-7">
            {!isOverlayAvailable ? 'N/A' : showOverlay ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Main Image View Container — Fixed Aspect Ratio */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200">
        {/* Base Layer: Uploaded Clinical Image */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded macroscopic clinical lesion photograph"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <ImageIcon className="w-10 h-10 mb-2 stroke-1 text-slate-500" aria-hidden="true" />
            <p className="text-sm font-medium">Original clinical photograph not loaded</p>
            <p className="text-xs text-slate-500 mt-1">Upload an image to inspect visual attention</p>
          </div>
        )}

        {/* Heatmap Overlay Layer: Positioned absolutely on top of base image */}
        {isOverlayAvailable && showOverlay && formattedOverlayUri && (
          <img
            src={formattedOverlayUri}
            alt="Model visual attention heatmap overlay indicating salient regions"
            onError={() => setOverlayError(true)}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-200"
            style={{ opacity: 0.6 }}
          />
        )}

        {/* Graceful Fallback if explainability overlay is missing or malformed */}
        {!isOverlayAvailable && (
          <div
            role="status"
            className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-amber-300 text-xs px-3 py-1.5 rounded-lg border border-amber-500/40 flex items-center gap-1.5 shadow-md"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Explainability data unavailable</span>
          </div>
        )}

        {/* Layer Mode Badge */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-slate-300 text-[11px] px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span>Base: Original clinical image</span>
          {isOverlayAvailable && showOverlay && (
            <>
              <span className="text-slate-500" aria-hidden="true">&bull;</span>
              <span className="text-sky-300">Overlay: Attention heatmap (60% opacity)</span>
            </>
          )}
        </div>
      </div>

      {/* Mandatory exact caption text directly below the image */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
        <p className="text-xs font-semibold text-slate-700">
          This shows what the model attended to, not that its reasoning was medically correct.
        </p>
      </div>
    </section>
  );
}

export default ExplainabilityOverlay;
