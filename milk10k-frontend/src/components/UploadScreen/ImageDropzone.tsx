import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent, MouseEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check, AlertCircle } from 'lucide-react';
import { validateImageFile } from '../../utils/imageValidation';

export interface ImageDropzoneProps {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError?: (errorMsg: string | null) => void;
}

export function ImageDropzone({
  id,
  label,
  description,
  required = false,
  file,
  onFileChange,
  onError,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dropzoneError, setDropzoneError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate and manage object URL for thumbnail preview
  useEffect(() => {
    if (!file) {
      // oxlint-disable-next-line react/set-state-in-effect
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    // oxlint-disable-next-line react/set-state-in-effect
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    };
  }, [file]);

  const processSelectedFile = (selected: File) => {
    const validation = validateImageFile(selected);
    if (!validation.isValid) {
      const err = validation.error ?? 'Invalid image file';
      setDropzoneError(err);
      onError?.(err);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setDropzoneError(null);
    onError?.(null);
    onFileChange(selected);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processSelectedFile(droppedFiles[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processSelectedFile(selectedFiles[0]);
    }
  };

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    setDropzoneError(null);
    onError?.(null);
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label} {required ? <span className="text-red-600 font-bold" aria-hidden="true">*</span> : <span className="text-slate-500 font-normal text-xs">(optional)</span>}
        </label>
        <span className="text-xs text-slate-500">
          {required ? 'Required by model' : 'Optional complementary view'}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-controls={id}
        aria-describedby={`${id}-desc`}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 ${
          dropzoneError
            ? 'border-red-300 bg-red-50/50'
            : isDragging
            ? 'border-sky-600 bg-sky-50/80 scale-[1.01]'
            : file
            ? 'border-emerald-500 bg-emerald-50/30'
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png"
          aria-required={required}
          onChange={handleInputChange}
          className="sr-only"
        />

        {file && previewUrl ? (
          <div className="w-full flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
              <img
                src={previewUrl}
                alt={`Preview thumbnail for ${label}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-800 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB &bull; {file.type || 'image'}
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Image loaded and ready for analysis
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove selected ${label}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors focus-visible:ring-2 focus-visible:ring-red-600 outline-none cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              {isDragging ? (
                <ImageIcon className="w-6 h-6 text-sky-600 animate-pulse" aria-hidden="true" />
              ) : (
                <UploadCloud className="w-6 h-6 text-slate-600" aria-hidden="true" />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-700">
              <span className="text-sky-600 hover:underline">Click to browse</span> or drag & drop
            </p>
            <p id={`${id}-desc`} className="text-xs text-slate-500 mt-1">
              {description} (JPEG or PNG, up to 10 MB)
            </p>
          </div>
        )}
      </div>

      {dropzoneError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-200"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{dropzoneError}</span>
        </div>
      )}
    </div>
  );
}

export default ImageDropzone;
