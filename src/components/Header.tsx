import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBackButton } from '@ionic/react';
import { logOutOutline, settingsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import DataService from '../services/DataService';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton }) => {
  const history = useHistory();
  const currentUser = DataService.getCurrentUser();
  
  const handleLogout = () => {
    DataService.logout();
    history.replace('/login');
  };

  const goToAdmin = () => {
    history.push('/admin');
  };

  return (
    <IonHeader>
      <IonToolbar>
        {showBackButton && <IonButtons slot="start"><IonBackButton defaultHref="/app/chat" /></IonButtons>}
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          {currentUser && currentUser.type === 'admin' && (
            <IonButton onClick={goToAdmin}>
              <IonIcon icon={settingsOutline} slot="icon-only" />
            </IonButton>
          )}
          <IonButton onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="icon-only" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
