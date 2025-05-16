import { useState } from 'react';
import {
  IonPage, IonContent, IonFab, IonFabButton,
  IonIcon, IonImg, useIonViewDidEnter
} from '@ionic/react';
import { cameraOutline } from 'ionicons/icons';
import Header from '../components/Header';
import DataService from '../services/DataService';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const CameraPage: React.FC = () => {
  const currentUser = DataService.getCurrentUser();
  const [lastPhoto, setLastPhoto] = useState<string>();

  const takePhoto = async (source: CameraSource = CameraSource.Camera) => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source,
        quality: 75,
      });
      if (photo?.dataUrl) {
        if (currentUser) DataService.savePhotoForUser(currentUser.username, photo.dataUrl);
        setLastPhoto(photo.dataUrl);
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  useIonViewDidEnter(() => {
    void takePhoto();
  });

  return (
    <IonPage>
      <Header title="Caméra" />
      <IonContent className="ion-padding">
        {lastPhoto && <IonImg src={lastPhoto} className="ion-margin-bottom" />}
        {/* FAB pour relancer l’appareil photo */}
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={cameraOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
export default CameraPage;
