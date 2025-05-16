interface User {
  username: string;
  password: string;
  type: 'admin' | 'user';
  friends: string[];
  friendRequestsSent: string[];
  friendRequestsReceived: string[];
  photos: string[];
  location?: { lat: number; lng: number };
}

interface ChatMessage {
  sender: string;
  text: string;
  image?: string;
  timestamp: string;
}

interface Chat {
  id: string;
  name: string;
  participants: string[];
  isGroup: boolean;
  messages: ChatMessage[];
}

const DataService = {
  // Initialiser les données de démo si besoin
  initData() {
    const usersJson = localStorage.getItem('users');
    if (!usersJson) {
      // Créer un admin par défaut et un utilisateur exemple
      const defaultAdmin: User = {
        username: 'admin',
        password: 'admin',
        type: 'admin',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        photos: [],
      };
      const defaultUser: User = {
        username: 'user',
        password: 'user',
        type: 'user',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        photos: [],
      };
      localStorage.setItem('users', JSON.stringify([defaultAdmin, defaultUser]));
      localStorage.setItem('chats', JSON.stringify([]));
      // Pas d'utilisateur connecté initialement
      localStorage.removeItem('currentUser');
    }
  },

  // Récupérer l'utilisateur actuellement connecté
  getCurrentUser(): User | null {
    const username = localStorage.getItem('currentUser');
    if (!username) return null;
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  },

  // Définir l'utilisateur actuel par son username
  setCurrentUser(username: string) {
    localStorage.setItem('currentUser', username);
  },

  // Déconnexion
  logout() {
    localStorage.removeItem('currentUser');
  },

  // Récupérer tous les utilisateurs
  getUsers(): User[] {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  },

  // Enregistrer la liste des utilisateurs
  saveUsers(users: User[]) {
    localStorage.setItem('users', JSON.stringify(users));
  },

  // Connexion avec identifiant et mot de passe
  login(username: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      this.setCurrentUser(user.username);
      return user;
    }
    return null;
  },

  // Inscription d'un nouvel utilisateur (type 'user' par défaut)
  register(username: string, password: string, type: 'admin' | 'user' = 'user' ): User | null {
    let users = this.getUsers();
    // Vérifie si l'identifiant est déjà pris
    if (users.find(u => u.username === username)) {
      return null; // identifiant existant
    }
    const newUser: User = {
      username,
      password,
      type: 'user',
      friends: [],
      friendRequestsSent: [],
      friendRequestsReceived: [],
      photos: [],
    };
    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(username);
    return newUser;
  },

  // Supprimer un utilisateur (admin uniquement)
  removeUser(username: string) {
    let users = this.getUsers();
    users = users.filter(u => u.username !== username);
    // Retirer l'utilisateur supprimé des listes d'amis et invitations des autres
    users.forEach(u => {
      u.friends = u.friends.filter(f => f !== username);
      u.friendRequestsSent = u.friendRequestsSent.filter(f => f !== username);
      u.friendRequestsReceived = u.friendRequestsReceived.filter(f => f !== username);
    });
    this.saveUsers(users);
    // Retirer l'utilisateur supprimé des discussions
    let chats = this.getChats();
    chats.forEach(chat => {
      chat.participants = chat.participants.filter(p => p !== username);
    });
    chats = chats.filter(chat => chat.participants.length > 0);
    this.saveChats(chats);
  },

  updateUser(
    oldUsername: string,
    data: { username?: string; password?: string; type?: 'admin' | 'user' }
  ) {
    let users = this.getUsers();
    const user = users.find(u => u.username === oldUsername);
    if (!user) return false;

    const newUsername = data.username ?? oldUsername;

    /* si l'identifiant change, vérifier l'unicité puis remplacer partout */
    if (newUsername !== oldUsername) {
      if (users.find(u => u.username === newUsername)) return false; // déjà pris
      // mettre à jour listes d'amitié & invitations
      users.forEach(u => {
        u.friends               = u.friends.map(f  => f === oldUsername ? newUsername : f);
        u.friendRequestsSent    = u.friendRequestsSent
                                   .map(f => f === oldUsername ? newUsername : f);
        u.friendRequestsReceived= u.friendRequestsReceived
                                   .map(f => f === oldUsername ? newUsername : f);
      });
      // mettre à jour les discussions
      let chats = this.getChats();
      chats.forEach(c => {
        c.participants = c.participants.map(p => p === oldUsername ? newUsername : p);
        c.messages.forEach(m => {
          if (m.sender === oldUsername) m.sender = newUsername;
        });
      });
      this.saveChats(chats);

      // si c'était le currentUser, le mettre à jour
      if (localStorage.getItem('currentUser') === oldUsername) {
        localStorage.setItem('currentUser', newUsername);
      }
    }

    // appliquer les changements sur la fiche
    Object.assign(user, {
      username : newUsername,
      password : data.password ?? user.password,
      type     : data.type     ?? user.type,
    });

    this.saveUsers(users);
    return true;
  },

  // Envoyer une invitation d'ami
  sendFriendRequest(from: string, to: string): boolean {
    let users = this.getUsers();
    const sender = users.find(u => u.username === from);
    const target = users.find(u => u.username === to);
    if (!sender || !target) return false;
    // Déjà amis ou invitation déjà envoyée ?
    if (sender.friends.includes(to) || sender.friendRequestsSent.includes(to)) {
      return false;
    }
    sender.friendRequestsSent.push(to);
    target.friendRequestsReceived.push(from);
    this.saveUsers(users);
    return true;
  },

  // Accepter une invitation d'ami (currentUser accepte l'invitation de friendUsername)
  acceptFriendRequest(currentUser: string, friendUsername: string) {
    let users = this.getUsers();
    const user = users.find(u => u.username === currentUser);
    const friend = users.find(u => u.username === friendUsername);
    if (!user || !friend) return;
    // Retirer des invitations en attente
    user.friendRequestsReceived = user.friendRequestsReceived.filter(u => u !== friendUsername);
    friend.friendRequestsSent = friend.friendRequestsSent.filter(u => u !== currentUser);
    // Ajouter aux listes d'amis des deux utilisateurs
    if (!user.friends.includes(friendUsername)) user.friends.push(friendUsername);
    if (!friend.friends.includes(currentUser)) friend.friends.push(currentUser);
    this.saveUsers(users);
    // Créer automatiquement une discussion privée entre les deux amis
    const chatId = this.createChat([currentUser, friendUsername], false, '');
    return chatId;
  },

  // Refuser une invitation d'ami
  rejectFriendRequest(currentUser: string, friendUsername: string) {
    let users = this.getUsers();
    const user = users.find(u => u.username === currentUser);
    const friend = users.find(u => u.username === friendUsername);
    if (!user || !friend) return;
    user.friendRequestsReceived = user.friendRequestsReceived.filter(u => u !== friendUsername);
    friend.friendRequestsSent = friend.friendRequestsSent.filter(u => u !== currentUser);
    this.saveUsers(users);
  },

  // Créer une discussion (groupe ou privée). Renvoie l'ID du chat.
  createChat(participants: string[], isGroup: boolean, name: string): string {
    let chats = this.getChats();
    // Si chat privé déjà existant entre ces deux utilisateurs, le réutiliser
    if (!isGroup && participants.length === 2) {
      const existing = chats.find(c =>
        !c.isGroup &&
        c.participants.length === 2 &&
        c.participants.includes(participants[0]) &&
        c.participants.includes(participants[1])
      );
      if (existing) {
        return existing.id;
      }
    }
    const newChat: Chat = {
      id: 'chat_' + Date.now(),
      name: name || (isGroup ? 'Groupe' : ''),
      participants: [...participants],
      isGroup,
      messages: [],
    };
    chats.push(newChat);
    this.saveChats(chats);
    return newChat.id;
  },

  // Récupérer tous les chats
  getChats(): Chat[] {
    const chatsJson = localStorage.getItem('chats');
    return chatsJson ? JSON.parse(chatsJson) : [];
  },

  // Enregistrer la liste des chats
  saveChats(chats: Chat[]) {
    localStorage.setItem('chats', JSON.stringify(chats));
  },

  // Récupérer un chat par son id
  getChat(chatId: string): Chat | undefined {
    const chats = this.getChats();
    return chats.find(c => c.id === chatId);
  },

  // Récupérer tous les chats auxquels participe un utilisateur
  getChatsForUser(username: string): Chat[] {
    const chats = this.getChats();
    return chats.filter(c => c.participants.includes(username));
  },

  // Envoyer un message (texte ou image) dans un chat
  sendMessage(chatId: string, sender: string, text: string, image?: string) {
    let chats = this.getChats();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const msg: ChatMessage = {
      sender,
      text,
      timestamp: new Date().toISOString(),
    };
    if (image) {
      msg.image = image;
    }
    chat.messages.push(msg);
    this.saveChats(chats);
  },

  // Obtenir toutes les images pour un utilisateur (photos prises ou reçues)
  getGalleryImages(username: string): string[] {
    let images: string[] = [];
    const user = this.getUsers().find(u => u.username === username);
    if (user) {
      images = [...user.photos];
    }
    const chats = this.getChatsForUser(username);
    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.image) {
          if (!images.includes(msg.image)) {
            images.push(msg.image);
          }
        }
      });
    });
    return images;
  },

  // Sauvegarder une photo prise par l'utilisateur dans sa galerie locale
  savePhotoForUser(username: string, imageData: string) {
    let users = this.getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return;
    user.photos.push(imageData);
    this.saveUsers(users);
  },

  // Mettre à jour la position de l'utilisateur
  updateUserLocation(username: string, lat: number, lng: number) {
    let users = this.getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return;
    user.location = { lat, lng };
    this.saveUsers(users);
  },
};

export default DataService;
