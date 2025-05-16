import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonButton,
  IonText,
} from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { getPhotos, getUsers, addMessage, Photo } from '../services/storage';
import { v4 as uuid } from 'uuid';

const SendPhoto: React.FC = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const allPhotos = await getPhotos();
      const allUsers = await getUsers();
      setPhotos(allPhotos.filter((p) => p.userId === user?.id));
      setUsers(allUsers.filter((u) => u.id !== user?.id));
    })();
  }, []);

  const handleSend = async () => {
    if (!selectedUserId || !selectedPhoto) {
      setMessage('Veuillez choisir un utilisateur et une photo.');
      return;
    }

    await addMessage({
      id: uuid(),
      from: user!.id,
      to: selectedUserId,
      content: selectedPhoto.base64,
      type: 'image',
      timestamp: Date.now(),
    });

    setMessage('Photo envoyée avec succès.');
    setSelectedPhoto(null);
    setSelectedUserId(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Envoyer une photo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Envoyer à :</IonLabel>
          <IonSelect
            value={selectedUserId}
            placeholder="Choisir un utilisateur"
            onIonChange={(e) => setSelectedUserId(e.detail.value)}
          >
            {users.map((u) => (
              <IonSelectOption key={u.id} value={u.id}>
                {u.email}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonText color="medium" className="ion-padding-top ion-padding-bottom">
          Sélectionnez une photo à envoyer :
        </IonText>

        <IonGrid>
          <IonRow>
            {photos.map((photo) => (
              <IonCol size="6" key={photo.id}>
                <IonImg
                  src={photo.base64}
                  style={{
                    border: selectedPhoto?.id === photo.id ? '3px solid #3880ff' : 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedPhoto(photo)}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonButton expand="block" className="ion-margin-top" onClick={handleSend}>
          Envoyer la photo
        </IonButton>

        {message && (
          <IonText color="success">
            <p className="ion-padding-top">{message}</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SendPhoto;
