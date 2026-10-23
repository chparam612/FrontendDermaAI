import { useState, useEffect } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ConnectionStatus } from './components/ConnectionStatus';
import { AboutModelPanel } from './components/AboutModelPanel';
import { UploadScreen } from './components/UploadScreen';
import { ResultScreen } from './components/ResultScreen';
import type { PredictResponse } from './api/types';
import { Activity } from 'lucide-react';

export function App() {
  const [view, setView] = useState<'upload' | 'result'>('upload');
  const [analysisResult, setAnalysisResult] = useState<PredictResponse | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleAnalyzeSuccess = (result: PredictResponse, previewUrl?: string) => {
    setAnalysisResult(result);
    if (previewUrl) {
      setImagePreviewUrl((prev) => {
        if (prev && prev !== previewUrl) {
          URL.revokeObjectURL(prev);
        }
        return previewUrl;
      });
    }
    setView('result');
  };

  const handleBackToUpload = () => {
    setView('upload');
  };

  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Persistent, Non-dismissible Clinical Disclaimer */}
      <DisclaimerBanner />

      {/* 2. Application Navigation Bar */}
      <header className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                MILK10k Skin AI
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Clinical Dermatology Decision Support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Backend Connection Indicator (green/red with icon + text) */}
            <ConnectionStatus />

            {/* View navigation */}
            <nav aria-label="Screen View Selection" className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setView('upload')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                  view === 'upload'
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                1. Image Upload
              </button>
              <span className="text-slate-300" aria-hidden="true">&rarr;</span>
              <button
                type="button"
                onClick={() => analysisResult && setView('result')}
                disabled={!analysisResult}
                className={`px-3 py-1.5 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                  !analysisResult
                    ? 'text-slate-400 opacity-60 cursor-not-allowed'
                    : view === 'result'
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200 cursor-pointer'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                2. Analysis Result
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 3. Main Screen View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* About this model panel (fed by GET /api/model-info with graceful fallback) */}
        <AboutModelPanel />

        {view === 'upload' || !analysisResult ? (
          <UploadScreen onAnalyzeSuccess={handleAnalyzeSuccess} />
        ) : (
          <ResultScreen
            result={analysisResult}
            previewUrl={imagePreviewUrl ?? undefined}
            onBackToUpload={handleBackToUpload}
          />
        )}
      </main>

      {/* 4. Minimalist footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        MILK10k Clinical Skin AI Prototype &bull; Decision Support Only &bull;{' '}
        <span className={isMockMode ? 'text-amber-600 font-medium' : 'text-emerald-700 font-medium'}>
          {isMockMode ? 'MSW Mock Server Active (VITE_USE_MOCK=true)' : 'Live Backend Mode (VITE_API_BASE_URL)'}
        </span>
      </footer>
    </div>
  );
}

export default App;
