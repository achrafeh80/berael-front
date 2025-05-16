import { useState } from 'react';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput, IonListHeader, IonHeader, IonToolbar, IonTitle, IonModal, IonSelect, IonSelectOption, IonButtons, useIonViewWillEnter } from '@ionic/react';
import Header from '../components/Header';
import DataService from '../services/DataService';
import { useHistory } from 'react-router-dom';

const ChatListPage: React.FC = () => {
  const history = useHistory();
  const [currentUser, setCurrentUser] = useState(DataService.getCurrentUser());
  const [friendId, setFriendId] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);

  // État du formulaire de création de groupe
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  useIonViewWillEnter(() => {
    // Mettre à jour les données de l'utilisateur (amis/invitations)
    setCurrentUser(DataService.getCurrentUser());
  });

  if (!currentUser) {
    // Si non connecté, rediriger vers la connexion
    history.replace('/login');
    return null;
  }

  const handleSendInvite = () => {
    if (!friendId) return;
    const success = DataService.sendFriendRequest(currentUser.username, friendId);
    if (!success) {
      setInviteError("Invitation impossible (identifiant invalide ou déjà en ami)");
    } else {
      setInviteError('');
      setFriendId('');
      alert('Invitation envoyée');
    }
  };

  const handleAcceptInvite = (fromUser: string) => {
    DataService.acceptFriendRequest(currentUser.username, fromUser);
    // Mettre à jour la liste après acceptation
    setCurrentUser(DataService.getCurrentUser());
  };

  const handleRejectInvite = (fromUser: string) => {
    DataService.rejectFriendRequest(currentUser.username, fromUser);
    setCurrentUser(DataService.getCurrentUser());
  };

  const openChatWithFriend = (friendUsername: string) => {
    const chatId = DataService.createChat([currentUser.username, friendUsername], false, '');
    history.push(`/app/chat/${chatId}`);
  };

  const openGroupChat = (chatId: string) => {
    history.push(`/app/chat/${chatId}`);
  };

  const handleCreateGroup = () => {
    if (!groupName || groupMembers.length === 0) {
      return;
    }
    // Inclure l'utilisateur courant dans le groupe
    const participants = [currentUser.username, ...groupMembers];
    const chatId = DataService.createChat(participants, true, groupName);
    setShowGroupModal(false);
    setGroupName('');
    setGroupMembers([]);
    // Ouvrir la nouvelle conversation de groupe
    history.push(`/app/chat/${chatId}`);
  };

  return (
    <IonPage>
      <Header title="Discussions" />
      <IonContent className="ion-padding">
        <IonItem>
          <IonInput placeholder="Identifiant de l'ami" value={friendId} onIonChange={e => setFriendId(e.detail.value!)} />
          <IonButton onClick={handleSendInvite}>Ajouter ami</IonButton>
        </IonItem>
        {inviteError && <IonItem lines="none"><IonLabel color="danger">{inviteError}</IonLabel></IonItem>}
        {/* Liste d'amis */}
        <IonList>
          <IonListHeader>Amis</IonListHeader>
          {currentUser.friends.map(friend => (
            <IonItem button key={friend} onClick={() => openChatWithFriend(friend)}>
              <IonLabel>{friend}</IonLabel>
            </IonItem>
          ))}
        </IonList>
        {/* Liste des groupes */}
        <IonList>
          <IonListHeader>Groupes</IonListHeader>
          {DataService.getChatsForUser(currentUser.username).filter(c => c.isGroup).map(groupChat => (
            <IonItem button key={groupChat.id} onClick={() => openGroupChat(groupChat.id)}>
              <IonLabel>{groupChat.name || 'Groupe'}</IonLabel>
            </IonItem>
          ))}
          <IonItem>
            <IonButton onClick={() => setShowGroupModal(true)}>Nouveau groupe</IonButton>
          </IonItem>
        </IonList>
        {/* Invitations d'amis reçues */}
        {currentUser.friendRequestsReceived.length > 0 && (
          <IonList>
            <IonListHeader>Invitations d'amis</IonListHeader>
            {currentUser.friendRequestsReceived.map(req => (
              <IonItem key={req}>
                <IonLabel>{req}</IonLabel>
                <IonButton color="primary" onClick={() => handleAcceptInvite(req)}>Accepter</IonButton>
                <IonButton color="medium" onClick={() => handleRejectInvite(req)}>Refuser</IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
      {/* Fenêtre modale de création de groupe */}
      <IonModal isOpen={showGroupModal} onDidDismiss={() => setShowGroupModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Créer un groupe</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowGroupModal(false)}>Annuler</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Nom du groupe</IonLabel>
            <IonInput value={groupName} onIonChange={e => setGroupName(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel>Membres</IonLabel>
            <IonSelect multiple value={groupMembers} placeholder="Choisir des amis" onIonChange={e => setGroupMembers(e.detail.value as string[])}>
              {currentUser.friends.map(friend => (
                <IonSelectOption key={friend} value={friend}>{friend}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonButton expand="block" className="ion-margin-top" onClick={handleCreateGroup}>Créer</IonButton>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default ChatListPage;
