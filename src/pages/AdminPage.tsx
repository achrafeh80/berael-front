import { useState } from 'react';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel,
  IonButton, IonInput, IonSelect, IonSelectOption,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons
} from '@ionic/react';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import DataService from '../services/DataService';

const AdminPage: React.FC = () => {
  const me = DataService.getCurrentUser();
  if (!me || me.type !== 'admin') return <Redirect to="/app/chat" />;

  /* -------- création d’utilisateur ------------------- */
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newType, setNewType] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');

  /* -------- modification ----------------------------- */
  const [editUser, setEditUser] = useState<any>(null);       // objet user en cours d’édition
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editType, setEditType]       = useState<'admin' | 'user'>('user');
  const users = DataService.getUsers();

  const refresh = () => {
    setEditUser(null);
    setNewUsername(''); setNewPassword(''); setError('');
  };

  const handleCreate = () => {
    if (!newUsername || !newPassword) { setError('Champs requis'); return; }
    const ok = DataService.register(newUsername, newPassword, newType);
    if (!ok) setError('Identifiant déjà pris');
    else     refresh();
  };

  const handleDelete = (u: string) => {
    if (u === me.username) return;
    DataService.removeUser(u);
    refresh();
  };

  /* ---------- ouvrir l’éditeur ---------------------- */
  const openEdit = (u: any) => {
    setEditUser(u);
    setEditUsername(u.username);
    setEditPassword(u.password);
    setEditType(u.type);
  };

  const saveEdit = () => {
    const ok = DataService.updateUser(editUser.username, {
      username: editUsername.trim(),
      password: editPassword.trim(),
      type    : editType,
    });
    if (!ok) { alert('Identifiant déjà utilisé'); return; }
    refresh();
  };

  return (
    <IonPage>
      <Header title="Administration" showBackButton />

      <IonContent className="ion-padding">
        {/* -------- liste des utilisateurs ------------- */}
        <IonList>
          {DataService.getUsers().map(u => (
            <IonItem key={u.username}>
              <IonLabel>
                <h2>{u.username}</h2>
                <p>Type : {u.type}</p>
              </IonLabel>
              <IonButton size="small" color="medium" onClick={() => openEdit(u)}>
                Modifier
              </IonButton>
              {u.username !== me.username && (
                <IonButton size="small" color="danger" onClick={() => handleDelete(u.username)}>
                  Supprimer
                </IonButton>
              )}
            </IonItem>
          ))}
        </IonList>

        {/* -------- formulaire de création ------------- */}
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Identifiant</IonLabel>
            <IonInput value={newUsername} onIonChange={e => setNewUsername(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Mot de passe</IonLabel>
            <IonInput type="password" value={newPassword} onIonChange={e => setNewPassword(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel>Type</IonLabel>
            <IonSelect value={newType} onIonChange={e => setNewType(e.detail.value)}>
              <IonSelectOption value="user">Utilisateur</IonSelectOption>
              <IonSelectOption value="admin">Administrateur</IonSelectOption>
            </IonSelect>
          </IonItem>
          {error && <IonItem lines="none"><IonLabel color="danger">{error}</IonLabel></IonItem>}
          <IonButton expand="block" className="ion-margin-top" onClick={handleCreate}>
            Créer l’utilisateur
          </IonButton>
        </IonList>
      </IonContent>

      {/* -------- modal d’édition --------------------- */}
      <IonModal isOpen={!!editUser} onDidDismiss={() => setEditUser(null)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Modifier : {editUser?.username}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setEditUser(null)}>Fermer</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Nouvel identifiant</IonLabel>
              <IonInput value={editUsername} onIonChange={e => setEditUsername(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Mot de passe</IonLabel>
              <IonInput type="password" value={editPassword} onIonChange={e => setEditPassword(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel>Type</IonLabel>
              <IonSelect value={editType} onIonChange={e => setEditType(e.detail.value)}>
                <IonSelectOption value="user">Utilisateur</IonSelectOption>
                <IonSelectOption value="admin">Administrateur</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
          <IonButton expand="block" onClick={saveEdit}>Enregistrer</IonButton>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};
export default AdminPage;
