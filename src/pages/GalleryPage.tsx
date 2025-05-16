import { useState } from 'react';
import {
  IonPage, IonContent, IonFab, IonFabButton, IonIcon,
  IonActionSheet, IonModal, IonImg, IonButton, IonHeader,
  IonToolbar, IonTitle, IonGrid, IonRow, IonCol , useIonViewWillEnter
} from '@ionic/react';
import { cameraOutline, shareSocial, arrowUp } from 'ionicons/icons';
import Header from '../components/Header';
import DataService from '../services/DataService';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const GalleryPage: React.FC = () => {
  const me = DataService.getCurrentUser();
  const [pics, setPics] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [shareImg, setShareImg] = useState<string | null>(null);   // image à partager

  useIonViewWillEnter(() => {
    if (me) setPics(DataService.getGalleryImages(me.username));
  });

  if (!me) return null;

  /* ----------- Caméra depuis la galerie ------------------------------- */
  const takePhoto = async () => {
    try {
      const p = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        quality: 80,
        source: CameraSource.Camera
      });
      if (p?.dataUrl) {
        DataService.savePhotoForUser(me.username, p.dataUrl);
        setPics([p.dataUrl, ...pics]);
      }
    } catch {}
  };

  /* ----------- Partage ------------------------------------------------- */
  const doShare = (img: string) => setShareImg(img);

  const buttons = [
    ...me.friends.map(f => ({
      text: f,
      handler: () => {
        const chatId = DataService.createChat([me.username, f], false, '');
        DataService.sendMessage(chatId, me.username, '', shareImg!);
      }
    })),
    ...DataService.getChatsForUser(me.username)
      .filter(c => c.isGroup)
      .map(g => ({
        text: g.name || 'Groupe',
        handler: () => {
          DataService.sendMessage(g.id, me.username, '', shareImg!);
        }
      })),
    { text: 'Annuler', role: 'cancel' }
  ];

  return (
    <IonPage>
      <Header title="Galerie" />
      <IonContent fullscreen>
        {/* Grille responsive Masonry */}
        <IonGrid style={{ '--ion-grid-padding':0 }}>
          <IonRow
            style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',
              gap:'8px',
              width:'100%'
            }}
          >
            {pics.map((p,i)=>(
              <IonCol key={i} size="auto" style={{padding:0}}>
                <IonImg
                  src={p}
                  alt=""
                  onClick={()=> setPreview(p)}
                  style={{cursor:'pointer',borderRadius:'12px',transition:'filter .2s'}}
                  onMouseOver={e => (e.currentTarget.style.filter='brightness(.85)')}
                  onMouseOut ={e => (e.currentTarget.style.filter='none')}
                />
                {/* Bouton share flottant */}
                <IonFab
                  vertical="top" horizontal="end"
                  style={{transform:'scale(.6)',top:'4px',right:'4px'}}
                >
                  <IonFabButton size="small" onClick={()=> doShare(p)}>
                    <IonIcon icon={shareSocial}/>
                  </IonFabButton>
                </IonFab>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* FAB Caméra + ScrollUp */}
        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonFabButton onClick={takePhoto}>
            <IonIcon icon={cameraOutline}/>
          </IonFabButton>
        </IonFab>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton size="small" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
            <IonIcon icon={arrowUp}/>
          </IonFabButton>
        </IonFab>

        {/* Aperçu plein-écran */}
        <IonModal isOpen={!!preview} onDidDismiss={()=>setPreview(null)}>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle>Photo</IonTitle>
              <IonButton slot="end" fill="clear" onClick={()=>setPreview(null)}>Fermer</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {preview && <IonImg src={preview} style={{borderRadius:'12px'}}/>}
          </IonContent>
        </IonModal>

        {/* Choix ami/groupe pour partage */}
        <IonActionSheet
          isOpen={!!shareImg}
          onDidDismiss={()=>setShareImg(null)}
          header="Envoyer à…"
          buttons={buttons}
        />
      </IonContent>
    </IonPage>
  );
};
export default GalleryPage;
