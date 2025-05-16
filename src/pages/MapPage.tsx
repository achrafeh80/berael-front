import { useRef } from 'react';
import { IonPage, IonContent, useIonViewDidEnter } from '@ionic/react';
import Header from '../components/Header';
import DataService from '../services/DataService';
import * as L from 'leaflet';

const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const friendIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapPage: React.FC = () => {
  const user = DataService.getCurrentUser();
  const mapRef = useRef<L.Map | null>(null);

  const init = () => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', { zoomControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapRef.current);
    }
  };

  const refresh = () => {
    if (!mapRef.current || !user) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      DataService.updateUserLocation(user.username, latitude, longitude);
      const all = DataService.getUsers();

      mapRef.current!.eachLayer(l => {
        if ((l as any)._latlng) mapRef.current!.removeLayer(l);
      });

      L.marker([latitude, longitude], { icon: userIcon })
        .addTo(mapRef.current!)
        .bindPopup('<b>Moi</b>')
        .openPopup();

      user.friends.forEach(f => {
        const friend = all.find(u => u.username === f && u.location);
        if (friend?.location)
          L.marker([friend.location.lat, friend.location.lng], { icon: friendIcon })
            .addTo(mapRef.current!)
            .bindPopup(friend.username);
      });

      mapRef.current!.setView([latitude, longitude], 14);
    });
  };

  useIonViewDidEnter(() => {
    init();
    refresh();
  });

  if (!user) return null;

  return (
    <IonPage>
      <Header title="Carte" />
      <IonContent>
        <div id="map" style={{ height: '100%' }} />
      </IonContent>
    </IonPage>
  );
};
export default MapPage;
