import { useState, useEffect, useRef } from 'react';
import {
  IonPage, IonContent, IonFooter, IonToolbar, IonInput,
  IonButton, IonIcon, IonList, IonItem, IonAvatar, IonText,
  IonFab, IonFabButton, IonActionSheet, IonRippleEffect
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { 
  cameraOutline, imageOutline, send, ellipsisVertical, 
  addOutline, chevronDown, arrowBackOutline
} from 'ionicons/icons';
import Header from '../components/Header';
import DataService from '../services/DataService';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import '../theme/chat.css';

/* -------- util : couleur stable par utilisateur ---------- */
const colorForUser = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue},70%,85%)`;
};

// Fonction pour obtenir les initiales d'un nom d'utilisateur
const getInitials = (name: string) => {
  return name.substring(0, 2).toUpperCase();
};

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const me = DataService.getCurrentUser();
  const [chat, setChat] = useState(DataService.getChat(id));
  const [text, setText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);

  if (!me || !chat) return null;
  
  const refresh = () => setChat({ ...DataService.getChat(id)! });

  // Fonction pour faire défiler vers le bas après l'envoi d'un message
  useEffect(() => {
    setTimeout(() => {
      contentRef.current?.scrollToBottom(300);
    }, 100);
  }, [chat?.messages.length]);

  /* ----- envoi texte / image ------------------------------------------ */
  const sendMsg = (msg: string, img?: string) => {
    if (!msg.trim() && !img) return;
    DataService.sendMessage(chat.id, me.username, msg, img);
    setText('');
    refresh();
    inputRef.current?.setFocus();
  };

  const takePhoto = async (src: CameraSource) => {
    try {
      const p = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        quality: 80,
        source: src
      });
      if (p?.dataUrl) sendMsg('', p.dataUrl);
    } catch { /* user cancelled */ }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMsg(text);
    }
  };

  const title = chat.isGroup
    ? chat.name || 'Groupe'
    : chat.participants.find(p => p !== me.username);

  // Regrouper les messages par expéditeur et par date
  const groupMessagesByDateAndSender = () => {
    const groups: { date: string; messages: typeof chat.messages }[] = [];
    let currentDate = '';
    
    chat.messages.forEach(message => {
      const msgDate = new Date(message.timestamp).toLocaleDateString();
      
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: currentDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDateAndSender();

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    
    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterdayStr) return "Hier";
    return dateStr;
  };

  // Fonction pour déterminer si on doit afficher l'avatar
  const shouldShowAvatar = (messages: typeof chat.messages, index: number) => {
    if (index === 0) return true;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    return currentMsg.sender !== prevMsg.sender || 
           // Afficher l'avatar si le message précédent date de plus de 10 minutes
           (new Date(currentMsg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 10 * 60 * 1000);
  };

  return (
    <IonPage className="chat-page">
      {/* Header personnalisé */}
      <div className="custom-header">
        <IonButton fill="clear" routerLink="/app/chat" className="back-button">
          <IonIcon icon={arrowBackOutline} />
        </IonButton>
        
        <div className="header-content">
          {chat.isGroup ? (
            <div className="avatar-group">
              <IonAvatar className="group-avatar">
                <div className="group-initials">{getInitials(title!)}</div>
              </IonAvatar>
            </div>
          ) : (
            <IonAvatar>
              <div className="user-avatar" style={{ background: colorForUser(title!) }}>
                {getInitials(title!)}
              </div>
            </IonAvatar>
          )}
          
          <div className="header-info">
            <h2>{title}</h2>
            {chat.isGroup && (
              <p className="participants">
                {chat.participants.length} participants
              </p>
            )}
          </div>
        </div>
        
        <IonButton fill="clear" onClick={() => setShowActions(true)}>
          <IonIcon icon={ellipsisVertical} />
        </IonButton>
      </div>

      <IonContent ref={contentRef} className="chat-content">
        {messageGroups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="message-group">
            <div className="date-divider">
              <span>{formatDate(group.date)}</span>
            </div>
            
            <IonList lines="none">
              {group.messages.map((m, i) => {
                const mine = m.sender === me.username;
                const showAvatar = !mine && chat.isGroup && shouldShowAvatar(group.messages, i);
                const showName = showAvatar;
                
                return (
                  <IonItem
                    key={`msg-${groupIndex}-${i}`}
                    className={`message-item ${mine ? 'sent' : 'received'} ${m.image ? 'has-image' : ''}`}
                  >
                    {!mine && chat.isGroup && (
                      <div className={`avatar-container ${showAvatar ? 'visible' : 'hidden'}`}>
                        {showAvatar && (
                          <IonAvatar>
                            <div className="user-avatar" style={{ background: colorForUser(m.sender) }}>
                              {getInitials(m.sender)}
                            </div>
                          </IonAvatar>
                        )}
                      </div>
                    )}
                    
                    <div className="message-container">
                      {!mine && chat.isGroup && showName && (
                        <div className="sender-name">{m.sender}</div>
                      )}
                      
                      <div 
                        className={`bubble ${mine ? 'my-bubble' : 'their-bubble'}`} 
                        style={{ 
                          background: mine ? 'var(--ion-color-primary)' : (chat.isGroup ? colorForUser(m.sender) : '#f1f1f1'),
                          color: mine || (chat.isGroup && colorForUser(m.sender).includes('hsl')) ? '#fff' : '#000'
                        }}
                      >
                        <IonRippleEffect></IonRippleEffect>
                        {m.image && (
                          <div className="image-container">
                            <img src={m.image} alt="" className="message-image" />
                          </div>
                        )}
                        {m.text && <p className="message-text">{m.text}</p>}
                        <div className="timestamp">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </IonItem>
                );
              })}
            </IonList>
          </div>
        ))}
      </IonContent>

      {/* Zone de saisie améliorée */}
      <IonFooter className="chat-footer">
        <IonToolbar className="input-toolbar">
          <div className="input-container">
            <IonInput
              ref={inputRef}
              placeholder="Message…"
              value={text}
              onIonChange={e => setText(e.detail.value!)}
              onKeyPress={handleKeyPress}
              className="message-input"
              enterkeyhint="send"
              clearInput
            />
            
            <div className="action-buttons">
              <IonButton 
                fill="clear" 
                className="media-button"
                onClick={() => takePhoto(CameraSource.Photos)}
              >
                <IonIcon icon={imageOutline} />
              </IonButton>
              
              <IonButton 
                fill="clear"
                className="media-button"
                onClick={() => takePhoto(CameraSource.Camera)}
              >
                <IonIcon icon={cameraOutline} />
              </IonButton>
              
              <IonButton 
                className="send-button" 
                disabled={!text.trim()} 
                onClick={() => sendMsg(text)}
              >
                <IonIcon icon={send} />
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonFooter>

      {/* FAB et Options */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed" className="chat-fab">
        <IonFabButton onClick={() => contentRef.current?.scrollToBottom(300)}>
          <IonIcon icon={chevronDown} />
        </IonFabButton>
      </IonFab>

      <IonActionSheet
        isOpen={showActions}
        onDidDismiss={() => setShowActions(false)}
        buttons={[
          {
            text: 'Rechercher',
            icon: 'search-outline'
          },
          {
            text: chat.isGroup ? 'Infos du groupe' : 'Infos du contact',
            icon: 'information-circle-outline'
          },
          {
            text: 'Médias partagés',
            icon: 'images-outline'
          },
          {
            text: 'Annuler',
            role: 'cancel'
          }
        ]}
      />
    </IonPage>
  );
};

export default ChatPage;