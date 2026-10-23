# Frontend-to-Backend Integration Guide & Runbook

This guide documents the end-to-end integration between the **React/Vite/TS Frontend** (`milk10k-frontend`) and the **FastAPI Inference Backend** (`SkinCancerTracker`).

---

## 1. Prerequisites

- **Python 3.10+** (with virtual environment or pinned packages from `SkinCancerTracker/api/requirements.txt`).
- **Node.js 18+** and `npm`.
- Exported model checkpoint located at `..\SkinCancerTracker\checkpoints\final\demo_model.pt` (327.4 MB, SHA-256 starts with `137c79912024`).

---

## 2. Starting the Services

### Backend Service (Terminal 1)
From the backend repository root (`..\SkinCancerTracker`):

```powershell
# Using the automated launch script:
.\run_demo.ps1

# Or manually via uvicorn:
py -m uvicorn api.app:app --host 127.0.0.1 --port 8000
```

The backend server logs upon successful startup:
```text
[INFO] Initializing SkinCancerTracker inference backend...
[INFO] Initialized official PanDerm ViT (Base)
[INFO] InferenceEngine initialized successfully and set to eval mode.
[INFO] SkinCancerTracker inference backend ready to receive requests.
INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### Frontend Application (Terminal 2)
From the frontend application directory (`milk10k-frontend`):

```powershell
cd milk10k-frontend
npm run dev
```

Vite will start the development server at `http://localhost:5173`.

---

## 3. Environment Settings

The frontend configuration resides in `milk10k-frontend/.env.development` (templated in `.env.example`):

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Target host and port of the running FastAPI inference backend. |
| `VITE_USE_MOCK` | `false` | When set to `true`, enables MSW service worker mock interceptor for offline demo mode. Default is `false` (real backend API). |

---

## 4. Port and CORS Notes

- **Default Port**: Vite runs on port `5173` (`http://localhost:5173` or `http://127.0.0.1:5173`).
- **Backend CORS Policy**: Defined in `..\SkinCancerTracker\api\config.py` via `CORS_ORIGINS`. By default, it allows `http://localhost:5173,http://127.0.0.1:5173`.
- **Custom Port Override**: If Vite assigns a different port (e.g. `5174` or `3000`), you must configure the backend `CORS_ORIGINS` environment variable before running the backend:
  ```powershell
  $env:CORS_ORIGINS = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5174"
  .\run_demo.ps1
  ```

---

## 5. Sample Image Locations

The sample images required for manual verification reside strictly within the backend repository (never copied to or committed in the frontend repo):

- Primary dataset directory: `..\SkinCancerTracker\data\images\`
  - `ISIC_8325963.jpg` (Case 1: BCC)
  - `ISIC_8015399.jpg` (Case 2: NV)
  - `ISIC_2531111.jpg` (Case 3: BKL)
  - `ISIC_8667960.jpg` (Case 4: MEL)
- Pre-rendered audit rollouts directory: `..\SkinCancerTracker\results\audit\rollout_examples\`
  - `example_1_BCC_ISIC_8325963_orig.jpg`
  - `example_4_NV_ISIC_8015399_orig.jpg`

---

## 6. Exact Manual Testing Checklist

| Test Item | Action | Expected Behavior |
| :--- | :--- | :--- |
| **1. Connection Indicator** | Open `http://localhost:5173` with backend running. | Green status pill appears in header: `Online (cpu) [137c79912024]`. |
| **2. True BCC Malignancy** | Upload `ISIC_8325963.jpg` to Dermoscopic dropzone and click **Analyze**. | Primary card predicts `BCC` with uncalibrated score ~89.6%, malignant probability ~93.7%, and attention overlay highlighting the central lesion nest. Observed inference latency on CPU on this laptop is approximately 1.5–2.2 s (not 450–520 ms). |
| **3. True NV Benign** | Upload `ISIC_8015399.jpg` to Dermoscopic dropzone and click **Analyze**. | Primary card predicts `NV` with uncalibrated score ~88.9%, malignant probability ~6.9%, benign badge active. |
| **4. False Alarm (BKL Mimicker)** | Upload `ISIC_2531111.jpg` (True BKL) and click **Analyze**. | Honest error displayed: Model predicts `BCC` (score ~87.4%), highlighting benign-to-malignant false positive rate. |
| **5. Critical Miss (Melanoma)** | Upload `ISIC_8667960.jpg` (True Melanoma) and click **Analyze**. | Critical false negative demonstrated honestly: Model predicts `NV` (~91.0% score, Melanoma score only 0.6%). Illustrates why AI decision support is uncalibrated. |
| **6. PNG Image Support** | Upload any standard PNG image (`.png`). | Accepted by dropzone, previews cleanly, successfully analyzed by backend without format rejection. |
| **7. 12 MB File Rejection** | Upload a file larger than 10 MB (e.g. 12 MB). | Client-side validation triggers immediately: Red alert displayed: `File "..." (12.00 MB) exceeds the maximum allowed size of 10 MB.` Submission is blocked. |
| **8. Renamed .txt File Rejection** | Upload a `.txt` text file renamed to `sample.jpg`. | Client-side allows if extension matches, but backend PIL verification fails: Returns HTTP 400 with readable alert: `Uploaded file in 'dermoscopic_image' is corrupted or not a valid image: cannot identify image file.` |
| **9. Backend Disconnected Error** | Stop the backend server (`Ctrl + C` in backend terminal) and click **Analyze** or refresh. | Header connection indicator turns red: `Backend Offline (retry)`. Form shows dismissible error alert: `Unable to reach backend API at http://127.0.0.1:8000/api/predict. Please verify the server is running...` with a Retry button. |
| **10. Mock Mode Fallback** | Set `VITE_USE_MOCK=true` in `milk10k-frontend/.env.development` and restart `npm run dev`. | Footer indicates `MSW Mock Server Active`. Submissions return simulated mock fixtures without backend process. |

---

## 7. Troubleshooting Guide

| Issue / Error | Root Cause | Resolution |
| :--- | :--- | :--- |
| **CORS Error** (`Access-Control-Allow-Origin blocked`) | Frontend running on an origin not listed in backend `CORS_ORIGINS`. | Set `$env:CORS_ORIGINS = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5174"` before launching `run_demo.ps1`. |
| **HTTP 422 Unprocessable Entity** (`dermoscopic_image field required`) | Request omitted required multipart form field `dermoscopic_image`. | Ensure `dermoscopic_image` is selected; client-side validation prevents submitting without it. |
| **HTTP 408 Request Timeout** | Inference execution exceeded the client's 60-second `AbortController` timeout. | Ensure backend device has sufficient CPU/GPU capacity and is not blocked by external processes. |
| **Model Not Loaded / 500 Error** | Checkpoint weights file missing at `checkpoints/final/demo_model.pt`. | In backend repo, run `py scripts/gate1_export_and_parity.py` to produce `demo_model.pt` from training artifacts. |
| **Port Conflict** (`Errno 10048 bind address in use`) | Another process is occupying port 8000. | Check process: `Get-NetTCPConnection -LocalPort 8000 \| Select OwningProcess`, or run backend on port 8080: `py -m uvicorn api.app:app --port 8080` and set `VITE_API_BASE_URL=http://127.0.0.1:8080`. |
