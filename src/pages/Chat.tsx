import React, { useEffect, useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  IonIcon,
  IonFooter,
  IonImg,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getMessages, saveMessages, getUsers, Message } from '../services/storage';
import { arrowForward, image } from 'ionicons/icons';
import { v4 as uuid } from 'uuid';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    (async () => {
      setMessages(await getMessages());
      const allUsers = await getUsers();
      setUsers(allUsers.filter((u) => u.id !== user?.id)); // exclure soi-même
    })();
  }, []);

  const save = async (msg: Message) => {
    const newMsgs = [...messages, msg];
    await saveMessages(newMsgs);
    setMessages(newMsgs);
    setTimeout(() => contentRef.current?.scrollToBottom(300), 100);
  };

  const sendText = async () => {
    if (!text.trim() || !selectedUserId) return;
    await save({
      id: uuid(),
      from: user!.id,
      to: selectedUserId,
      type: 'text',
      content: text.trim(),
      timestamp: Date.now(),
    });
    setText('');
  };

  const sendImage = async () => {
    if (!selectedUserId) return;
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    await save({
      id: uuid(),
      from: user!.id,
      to: selectedUserId,
      type: 'image',
      content: `data:image/${photo.format};base64,${photo.base64String}`,
      timestamp: Date.now(),
    });
  };

  const displayedMessages = messages.filter(
    (m) =>
      (m.from === user?.id && m.to === selectedUserId) ||
      (m.from === selectedUserId && m.to === user?.id)
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Messagerie</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} scrollY className="ion-padding">
        <IonItem>
          <IonLabel>Envoyer à :</IonLabel>
          <IonSelect
            placeholder="Sélectionner un utilisateur"
            value={selectedUserId}
            onIonChange={(e) => setSelectedUserId(e.detail.value)}
          >
            {users.map((u) => (
              <IonSelectOption key={u.id} value={u.id}>
                {u.email}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        {selectedUserId && (
          <>
            {displayedMessages.map((m) => (
              <IonItem
                key={m.id}
                lines="none"
                className={m.from === user?.id ? 'ion-text-right' : ''}
              >
                {m.type === 'text' ? (
                  <IonLabel>{m.content}</IonLabel>
                ) : (
                  <IonImg src={m.content} style={{ maxWidth: 200, maxHeight: 200 }} />
                )}
              </IonItem>
            ))}
          </>
        )}
      </IonContent>

      {selectedUserId && (
        <IonFooter>
          <IonItem lines="none">
            <IonButton fill="clear" onClick={sendImage}>
              <IonIcon icon={image} />
            </IonButton>
            <IonTextarea
              value={text}
              onIonInput={(e) => setText(e.detail.value!)}
              autoGrow
              placeholder="Écrivez un message..."
            />
            <IonButton onClick={sendText}>
              <IonIcon icon={arrowForward} />
            </IonButton>
          </IonItem>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default Chat;
