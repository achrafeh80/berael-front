import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { camera } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useAuth } from '../context/AuthContext';
import { addPhoto } from '../services/storage';

const TakePhoto: React.FC = () => {
  const { user } = useAuth();

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 90,
    });

    if (photo.base64String) {
      await addPhoto(user!.id, `data:image/${photo.format};base64,${photo.base64String}`);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Prendre une photo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={takePhoto}>
          <IonIcon icon={camera} slot="start" />
          Prendre une photo
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default TakePhoto;
