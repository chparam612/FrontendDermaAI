import { useState } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { SkinToneSelector } from './SkinToneSelector';
import { ArrowRight, Info, AlertCircle, Loader2 } from 'lucide-react';
import { predict } from '../../api/apiClient';
import type { PredictResponse } from '../../api/types';

export interface UploadScreenProps {
  onAnalyzeSuccess: (result: PredictResponse, previewUrl?: string) => void;
}

export function UploadScreen({ onAnalyzeSuccess }: UploadScreenProps) {
  const [clinicalImage, setClinicalImage] = useState<File | null>(null);
  const [dermoscopicImage, setDermoscopicImage] = useState<File | null>(null);
  const [skinTone, setSkinTone] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!clinicalImage) {
      setErrorMessage('Please upload a macroscopic clinical photograph before analyzing.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await predict({
        clinical_image: clinicalImage,
        dermoscopic_image: dermoscopicImage ?? undefined,
        skin_tone: skinTone,
      });
      const previewUrl = URL.createObjectURL(clinicalImage);
      onAnalyzeSuccess(response, previewUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Prediction request failed. Please check network status and retry.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section aria-label="Upload Screen" className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      <header className="border-b border-slate-200 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
          Lesion Image Submission
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide macroscopic clinical photograph and optional dermoscopic view for multimodal AI analysis.
        </p>
      </header>

      {/* Error message alert */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageDropzone
          id="clinical-image-upload"
          label="Clinical Macroscopic Photograph"
          description="Standard overview photograph of lesion"
          required={true}
          file={clinicalImage}
          onFileChange={setClinicalImage}
        />

        <div className="flex flex-col gap-2">
          <ImageDropzone
            id="dermoscopic-image-upload"
            label="Dermoscopic Magnified Photograph"
            description="High-magnification polarized dermoscopic view"
            required={false}
            file={dermoscopicImage}
            onFileChange={setDermoscopicImage}
          />

          {/* Single-view mode note when dermoscopic image is not provided */}
          {!dermoscopicImage && (
            <div
              role="status"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs font-medium"
            >
              <Info className="w-4 h-4 shrink-0 text-sky-600" aria-hidden="true" />
              <span>Single-view mode — dermoscopic image not provided.</span>
            </div>
          )}
        </div>
      </div>

      {/* Skin tone selector */}
      <SkinToneSelector value={skinTone} onChange={setSkinTone} />

      {/* Action footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span>Network layer active &bull; MSW mock interceptor enabled in development.</span>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || !clinicalImage}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm rounded-xl shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 outline-none ${
            isLoading || !clinicalImage
              ? 'bg-sky-400 text-white cursor-not-allowed opacity-80'
              : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default UploadScreen;
