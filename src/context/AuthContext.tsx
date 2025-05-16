import React, { createContext, useContext, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { v4 as uuid } from 'uuid';
import { getUsers, saveUsers, User } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const { value } = await Preferences.get({ key: 'currentUser' });
      if (value) setUser(JSON.parse(value));
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const users = await getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      await Preferences.set({ key: 'currentUser', value: JSON.stringify(found) });
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string) => {
    const users = await getUsers();
    if (users.some((u) => u.email === email)) return false;
    const newUser = { id: uuid(), email, password } as User;
    const newUsers = [...users, newUser];
    await saveUsers(newUsers);
    setUser(newUser);
    await Preferences.set({ key: 'currentUser', value: JSON.stringify(newUser) });
    return true;
  };

  const logout = async () => {
    setUser(null);
    await Preferences.remove({ key: 'currentUser' });
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);