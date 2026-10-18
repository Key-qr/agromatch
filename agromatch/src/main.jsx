import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

/* PWA: solo en produccion, para no estorbar al desarrollo con HMR. */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', import.meta.env.BASE_URL), {
      scope: import.meta.env.BASE_URL,
    }).catch(() => {
      /* sin service worker la app sigue funcionando online */
    });
  });
}
