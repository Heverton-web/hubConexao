import React, { createContext, useContext, useState } from 'react';
import { UserProfile, Role } from '../types';
import { mockDb } from '../lib/mockDb';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = async (email: string, password: string) => {
    // In a real app, validation happens on server
    const foundUser = await mockDb.login(email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Usuário não encontrado (Demo: use admin@demo.com ou client@demo.com)');
    }
  };

  const register = async (data: any) => {
    const newUser = await mockDb.register(data);
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
