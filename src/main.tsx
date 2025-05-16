import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/* ① — initialiser Ionic  */
import { setupIonicReact } from '@ionic/react';
setupIonicReact();

/* ② — feuilles de style obligatoires */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/*   helpers facultatifs mais utiles   */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/display.css';

/* ③ — variables de thème  */
import './theme/variables.css';

/* ④ — feuille Leaflet (pour la carte)  */
import 'leaflet/dist/leaflet.css';

/* ⑤ — rendu React  */
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
