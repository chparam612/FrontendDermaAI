# Clinical Dermatology Analysis API Contract

Canonical Source of Truth: [`types.ts`](../types.ts)

This document specifies the frozen API contract for the dermatology image-analysis application across the frontend, mock server, and backend API client.

---

## 1. Endpoints

### `POST /predict`
Submits clinical/dermoscopic imagery and optional clinical metadata for model inference.

- **Content-Type**: `multipart/form-data`
- **Request Interface**: `PredictRequest`
- **Response Interface**: `PredictResponse`

---

## 2. Request Contract (`PredictRequest`)

| Field | Type | Required | Range / Description |
| :--- | :--- | :---: | :--- |
| `clinical_image` | `File` | **Yes** | Primary clinical macroscopic skin photograph. |
| `dermoscopic_image` | `File` | No | Optional high-magnification dermoscopic photograph. |
| `skin_tone` | `number` | No | Fitzpatrick/skin-tone category scale `[0, 5]`. |

### Single-View Fallback
- The application natively supports **clinical image only** single-view submissions.
- When `dermoscopic_image` is absent, the client does not send dummy/fake files or empty fields.
- When `skin_tone` is absent, no default value is assumed or transmitted.

---

## 3. Response Contract (`PredictResponse`)

| Field | Type | Range / Format | Description |
| :--- | :--- | :--- | :--- |
| `predicted_class` | `string` | e.g. `"BCC"`, `"MEL"` | Diagnostic prediction across the 11 classes. |
| `confidence` | `number` | `[0.0, 1.0]` | Prediction confidence score. |
| `malignant_probability` | `number` | `[0.0, 1.0]` | Probability that the lesion is malignant. |
| `per_class_probs` | `Record<string, number>` | Values in `[0.0, 1.0]` | Full probability distribution across 11 diagnostic classes. |
| `concept_scores` | `object` | Values in `[0.0, 1.0]` | Explanatory scores for 7 clinical concepts. |
| `explainability_overlay` | `string` | Base64 Data URI (`data:image/png;base64,...`) | Visual heatmap / attribution mask overlay. |
| `model_version` | `string` | e.g. `"panderm-v1.0"` | Identifier of the active inference model. |

### 11-Class Probability Map
The `per_class_probs` record maps standardized diagnostic category codes to normalized probabilities:
1. `AKIEC` (Actinic Keratosis / Intraepithelial Carcinoma)
2. `BCC` (Basal Cell Carcinoma)
3. `BEN_OTH` (Other Benign)
4. `BKL` (Benign Keratosis)
5. `DF` (Dermatofibroma)
6. `INF` (Inflammatory / Infectious)
7. `MAL_OTH` (Other Malignant)
8. `MEL` (Melanoma)
9. `NV` (Melanocytic Nevus)
10. `SCCKA` (Squamous Cell Carcinoma / Keratoacanthoma)
11. `VASC` (Vascular Lesion)

### 7 Required Concept Keys
`concept_scores` must include exactly all seven numeric keys:
1. `ulceration_crust`: numeric score `[0, 1]`
2. `hair`: numeric score `[0, 1]`
3. `vasculature`: numeric score `[0, 1]`
4. `erythema`: numeric score `[0, 1]`
5. `pigmented`: numeric score `[0, 1]`
6. `gel_fluid`: numeric score `[0, 1]`
7. `skin_markings`: numeric score `[0, 1]`

### Explainability Overlay Format
- Embedded Base64 Data URI string: `data:image/png;base64,<payload>`.
- Preserved verbatim by the API client and frontend components.

---

## 4. Architecture & Enforcement

- **Canonical Types**: [`types.ts`](../types.ts)
- **Runtime Validation**: [`src/validation.ts`](../src/validation.ts) enforces contract shapes at runtime; invalid payloads throw `ContractValidationError`.
- **Mock Server**: [`src/mock-server.ts`](../src/mock-server.ts) imports canonical types and generates contract-compliant responses.
- **Real API Client**: [`src/client.ts`](../src/client.ts) imports canonical types and serializes requests as `multipart/form-data`.
- **Contract Tests**: [`tests/contract.test.ts`](../tests/contract.test.ts) guards against contract regressions or deviations.
