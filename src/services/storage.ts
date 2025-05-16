import { Storage } from '@ionic/storage';
import { v4 as uuid } from 'uuid';

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image';
  timestamp: number;
}

export interface Photo {
  id: string;
  userId: string;
  base64: string;
  timestamp: number;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  messages: Message[];
}

export interface FriendLocation {
  userId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

// Initialisation du stockage
const store = new Storage();
store.create();

// --- USERS ---
export const getUsers = async (): Promise<User[]> => (await store.get('users')) || [];

export const saveUsers = async (users: User[]) => {
  await store.set('users', users);
};

// --- MESSAGES ---
export const getMessages = async (): Promise<Message[]> => (await store.get('messages')) || [];

export const saveMessages = async (messages: Message[]) => {
  await store.set('messages', messages);
};

// --- PHOTOS PERSONNELLES ---
export const getPhotos = async (): Promise<Photo[]> => (await store.get('photos')) || [];

export const savePhotos = async (photos: Photo[]) => {
  await store.set('photos', photos);
};

// --- GROUPES ---
export const getGroups = async (): Promise<Group[]> => (await store.get('groups')) || [];

export const saveGroups = async (groups: Group[]) => {
  await store.set('groups', groups);
};

// --- LOCALISATION ---
export const getLocations = async (): Promise<FriendLocation[]> =>
  (await store.get('locations')) || [];

export const saveLocations = async (locations: FriendLocation[]) => {
  await store.set('locations', locations);
};

// --- UTILITAIRES ---
export const addPhoto = async (userId: string, base64: string) => {
  const photos = await getPhotos();
  const newPhoto: Photo = {
    id: uuid(),
    userId,
    base64,
    timestamp: Date.now(),
  };
  await savePhotos([...photos, newPhoto]);
};

export const addMessage = async (msg: Message) => {
  const messages = await getMessages();
  await saveMessages([...messages, msg]);
};

export const addGroup = async (group: Group) => {
  const groups = await getGroups();
  await saveGroups([...groups, group]);
};

export const updateLocation = async (loc: FriendLocation) => {
  const locations = await getLocations();
  const updated = locations.filter((l) => l.userId !== loc.userId);
  await saveLocations([...updated, loc]);
};
