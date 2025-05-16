import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonText,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';

import './Login.css'; // <-- Ajoutez ce fichier CSS

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const ok = await login(email, password);
    if (ok) {
      history.push('/tabs');
    } else {
      setError('Mauvais identifiants');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding login-content">
        <IonCard className="login-card">
          <IonCardContent>
            <h2 className="login-title">Bienvenue</h2>
            <p className="login-subtitle">Connectez-vous pour continuer</p>
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                type="email"
                placeholder="exemple@domaine.com"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Mot de passe</IonLabel>
              <IonInput
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                type="password"
                placeholder="••••••••"
              />
            </IonItem>
            {error && <IonText color="danger"><p className="ion-padding-start">{error}</p></IonText>}
            <IonButton expand="block" className="ion-margin-top" onClick={handleLogin}>
              Se connecter
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={() => history.push('/register')}>
              Créer un compte
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Login;
