import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/react';
import { refresh } from 'ionicons/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getStories, Story } from '../services/storage';
import { Geolocation } from '@capacitor/geolocation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import './MapPage.css'; // <- Ajoutez ce fichier

const MapPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);

  const load = async () => {
    setStories(await getStories());
    const coordinates = await Geolocation.getCurrentPosition();
    setPosition([coordinates.coords.latitude, coordinates.coords.longitude]);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="map-content">
        {position && (
          <div className="map-wrapper">
            <MapContainer center={position} zoom={13} className="styled-map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
              />
              {stories.map((story) => (
                <Marker key={story.id} position={[story.lat, story.lng]} icon={new L.Icon.Default()}>
                  <Popup className="custom-popup">
                    {story.img && (
                      <img src={story.img} alt="Story" className="popup-image" />
                    )}
                    <br />
                    <span>{story.content}</span>
                  </Popup>
                </Marker>
              ))}
              <Marker
                position={position}
                icon={new L.Icon({
                  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
                  shadowUrl: '',
                })}
              >
                <Popup>Vous êtes ici</Popup>
              </Marker>
            </MapContainer>
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton onClick={load}>
                <IonIcon icon={refresh} />
              </IonFabButton>
            </IonFab>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
