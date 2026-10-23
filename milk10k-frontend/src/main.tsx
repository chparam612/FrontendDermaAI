import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

async function prepareApp() {
  // MSW mock interceptor starts strictly when VITE_USE_MOCK=true is enabled. Default is real backend API.
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { worker } = await import('./api/mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
