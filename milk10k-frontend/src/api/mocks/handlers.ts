import { http, HttpResponse, delay } from 'msw';
import fixtures from './fixtures.json';
import type { PredictResponse } from '../types';

export const handlers = [
  http.post('*/api/predict', async () => {
    // Brief realistic delay to allow loading spinner to render
    await delay(150);
    const response: PredictResponse = fixtures.malignant;
    return HttpResponse.json(response);
  }),
];
