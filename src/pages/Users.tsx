import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonInput,
  IonFooter,
  IonAlert,
  IonCard,
  IonCardHeader,
  IonCardContent,
} from '@ionic/react';
import { add, close } from 'ionicons/icons';
import { getUsers, saveUsers, User } from '../services/storage';
import { v4 as uuid } from 'uuid';

import './Users.css'; // <-- Ajouter ce fichier

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const loadUsers = async () => setUsers(await getUsers());
  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setEmail(u.email);
      setPassword(u.password);
    } else {
      setEditingUser(null);
      setEmail('');
      setPassword('');
    }
  };

  const save = async () => {
    const newUsers = editingUser
      ? users.map((u) => (u.id === editingUser.id ? { ...editingUser, email, password } : u))
      : [...users, { id: uuid(), email, password }];
    await saveUsers(newUsers);
    setUsers(newUsers);
    openModal();
  };

  const remove = async (id: string) => {
    const newUsers = users.filter((u) => u.id !== id);
    await saveUsers(newUsers);
    setUsers(newUsers);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Utilisateurs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="user-content">
        <IonList>
          {users.map((u) => (
            <IonItem key={u.id} lines="inset" button onClick={() => openModal(u)} className="user-item">
              <IonLabel>{u.email}</IonLabel>
              <IonButton
                slot="end"
                color="danger"
                fill="outline"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteId(u.id);
                }}
              >
                Supprimer
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => openModal()}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={editingUser !== null || email !== ''} onDidDismiss={() => openModal()}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingUser ? 'Modifier' : 'Ajouter'} un utilisateur</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => openModal()}>
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonCard className="modal-card">
              <IonCardHeader>
                {editingUser ? "Modifier l'utilisateur" : 'Créer un nouvel utilisateur'}
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value!)}
                    type="email"
                    placeholder="exemple@domaine.com"
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Mot de passe</IonLabel>
                  <IonInput
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value!)}
                    type="password"
                    placeholder="••••••••"
                  />
                </IonItem>
              </IonCardContent>
            </IonCard>
          </IonContent>
          <IonFooter>
            <IonButton expand="block" onClick={save}>
              {editingUser ? 'Mettre à jour' : 'Ajouter'}
            </IonButton>
          </IonFooter>
        </IonModal>

        <IonAlert
          isOpen={showDeleteId !== null}
          header="Confirmation"
          message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
          buttons={[
            {
              text: 'Annuler',
              role: 'cancel',
              handler: () => setShowDeleteId(null),
            },
            {
              text: 'Supprimer',
              role: 'destructive',
              handler: () => {
                if (showDeleteId) remove(showDeleteId);
                setShowDeleteId(null);
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Users;
