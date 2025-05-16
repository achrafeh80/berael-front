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

import './Register.css'; // <- Ajoutez ce fichier CSS

const Register: React.FC = () => {
  const { register } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const ok = await register(email, password);
    if (ok) {
      history.push('/tabs');
    } else {
      setError('Email déjà utilisé');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inscription</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding register-content">
        <IonCard className="register-card">
          <IonCardContent>
            <h2 className="register-title">Créer un compte</h2>
            <p className="register-subtitle">Veuillez remplir les champs ci-dessous</p>
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
            {error && (
              <IonText color="danger">
                <p className="ion-padding-start">{error}</p>
              </IonText>
            )}
            <IonButton expand="block" className="ion-margin-top" onClick={handleRegister}>
              S'inscrire
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={() => history.push('/login')}>
              J’ai déjà un compte
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Register;
