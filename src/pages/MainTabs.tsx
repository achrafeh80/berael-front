import { Redirect, Route } from 'react-router-dom';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { cameraOutline, chatbubblesOutline, imagesOutline, mapOutline } from 'ionicons/icons';
import CameraPage from './CameraPage';
import ChatListPage from './ChatListPage';
import ChatPage from './ChatPage';
import GalleryPage from './GalleryPage';
import MapPage from './MapPage';

const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/app/camera" component={CameraPage} exact />
        <Route path="/app/chat" component={ChatListPage} exact />
        <Route path="/app/chat/:id" component={ChatPage} />
        <Route path="/app/gallery" component={GalleryPage} exact />
        <Route path="/app/map" component={MapPage} exact />
        {/* Rediriger /app vers /app/camera par défaut */}
        <Route exact path="/app" render={() => <Redirect to="/app/camera" />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="camera" href="/app/camera">
          <IonIcon icon={cameraOutline} />
          <IonLabel>Caméra</IonLabel>
        </IonTabButton>
        <IonTabButton tab="chat" href="/app/chat">
          <IonIcon icon={chatbubblesOutline} />
          <IonLabel>Chat</IonLabel>
        </IonTabButton>
        <IonTabButton tab="gallery" href="/app/gallery">
          <IonIcon icon={imagesOutline} />
          <IonLabel>Galerie</IonLabel>
        </IonTabButton>
        <IonTabButton tab="map" href="/app/map">
          <IonIcon icon={mapOutline} />
          <IonLabel>Carte</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;
