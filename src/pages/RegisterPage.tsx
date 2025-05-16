import { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonButton, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import DataService from '../services/DataService';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleRegister = () => {
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    const newUser = DataService.register(username, password);
    if (!newUser) {
      setError('Identifiant déjà utilisé');
    } else {
      // Inscription réussie, naviguer vers l'application
      history.replace('/app/camera');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inscription</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonInput placeholder="Identifiant (email)" value={username} onIonChange={e => setUsername(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonInput placeholder="Mot de passe" type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
        </IonItem>
        {error && <IonText color="danger"><p>{error}</p></IonText>}
        <IonButton expand="block" onClick={handleRegister}>Créer un compte</IonButton>
        <IonButton fill="clear" expand="block" routerLink="/login">Annuler</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
