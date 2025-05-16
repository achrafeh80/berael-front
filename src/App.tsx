import React from 'react';
import {
  IonApp,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { people, chatbox, map } from 'ionicons/icons';
import { Redirect, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import Chat from './pages/Chat';
import MapPage from './pages/MapPage';

import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ component: React.FC; path: string; exact?: boolean }> = ({ component: Component, ...rest }) => {
  const { user } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          // @ts-ignore
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const Tabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/tabs/users" component={Users} exact />
      <Route path="/tabs/chat/:id" component={Chat} exact />
      <Route path="/tabs/map" component={MapPage} exact />
      <Redirect exact from="/tabs" to="/tabs/users" />
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="users" href="/tabs/users">
        <IonIcon icon={people} />
        <IonLabel>Utilisateurs</IonLabel>
      </IonTabButton>
      <IonTabButton tab="chat" href="/tabs/chat/me">
        <IonIcon icon={chatbox} />
        <IonLabel>Chat</IonLabel>
      </IonTabButton>
      <IonTabButton tab="map" href="/tabs/map">
        <IonIcon icon={map} />
        <IonLabel>Carte</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" component={Login} exact />
          <Route path="/register" component={Register} exact />
          <PrivateRoute path="/tabs" component={Tabs} />
          <Redirect exact from="/" to="/login" />
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;