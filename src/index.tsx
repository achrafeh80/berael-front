import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import 'leaflet/dist/leaflet.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// (If reportWebVitals or serviceWorker needed, include accordingly, omitted for brevity.)
