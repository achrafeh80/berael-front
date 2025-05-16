import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import MainTabs from './pages/MainTabs';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import DataService from './services/DataService';

setupIonicReact();

const App: React.FC = () => {
  // Initialize local storage data (users, default admin si nécessaire)
  DataService.initData();
  const currentUser = DataService.getCurrentUser();

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route path="/login" component={LoginPage} exact />
          <Route path="/register" component={RegisterPage} exact />
          {/* Route protégée pour l'admin */}
          <Route path="/admin" component={AdminPage} />
          {/* Routes principales avec onglets */}
          <Route path="/app" component={MainTabs} />
          {/* Route par défaut : redirige selon l'état de connexion */}
          <Route exact path="/" render={() =>
            currentUser ? <Redirect to="/app" /> : <Redirect to="/login" />
          } />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
