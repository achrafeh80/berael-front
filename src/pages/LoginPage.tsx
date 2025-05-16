import { useState } from 'react';
import { IonPage, IonContent, IonInput, IonItem, IonButton, IonText, IonTitle, IonToolbar, IonHeader } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import DataService from '../services/DataService';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = () => {
    const user = DataService.login(username, password);
    if (user) {
      // Rediriger vers l'application (page caméra par défaut)
      history.replace('/app/camera');
    } else {
      setError('Identifiant ou mot de passe incorrect');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonInput placeholder="Identifiant" value={username} onIonChange={e => setUsername(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonInput placeholder="Mot de passe" type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
        </IonItem>
        {error && <IonText color="danger"><p>{error}</p></IonText>}
        <IonButton expand="block" onClick={handleLogin}>Se connecter</IonButton>
        <IonButton fill="clear" expand="block" routerLink="/register">Créer un compte</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
