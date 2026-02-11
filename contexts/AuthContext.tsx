import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { supabase } from '../lib/supabaseClient';
import { mockDb } from '../lib/mockDb';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginMock: (role: Role) => Promise<void>; // New Method
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sincronizar sessão do Supabase ao carregar
  useEffect(() => {
    // 1. Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // 2. Escutar mudanças de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        // Se não estamos em sessão real, não limpamos o user imediatamente se for mock, 
        // mas aqui assumimos que auth real tem prioridade.
        // O Mock Login setará o user manualmente e não disparará esse listener.
        if (!user || !user.id.startsWith('mock-')) {
            setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await mockDb.getProfileById(userId);
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    mockDb.disableMockMode(); // Ensure we are using real DB on real login
  };

  const loginMock = async (role: Role) => {
      setIsLoading(true);
      mockDb.enableMockMode(); // Activate mock data
      
      // Get the mock user for this role from mockDb
      // We assume consistent IDs in mockDb
      const mockId = role === 'super_admin' ? 'mock-admin' : 
                     role === 'client' ? 'mock-client' :
                     role === 'distributor' ? 'mock-distrib' : 'mock-consult';
      
      const profile = await mockDb.getProfileById(mockId);
      if (profile) {
          setUser(profile);
      }
      setIsLoading(false);
  };

  const register = async (data: any) => {
    // 1. Tentar cadastro no Supabase Auth
    // Nota: Se houver um Trigger no banco (Abordagem 3) que falha, este signUp falhará.
    // Se o trigger não existir, o signUp funciona mas o perfil não é criado.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password || 'temp-password-change-me', // Fallback apenas para segurança
      options: {
        data: {
          name: data.name,
          role: data.role,
          whatsapp: data.whatsapp,
          cro: data.cro
        }
      }
    });

    if (authError) throw authError;

    // 2. Garantir criação do perfil (Fallback client-side)
    // Se o Trigger não existir ou não tiver rodado, inserimos manualmente.
    // Usamos 'upsert' para não dar erro se o Trigger já tiver criado.
    if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            name: data.name,
            email: data.email,
            role: data.role,
            whatsapp: data.whatsapp,
            cro: data.cro,
            status: 'pending', // Usuários novos entram como pendente por padrão
            preferences: { theme: 'light', language: 'pt-br' }
        }, { onConflict: 'id' });

        if (profileError) {
            console.error("Aviso: Falha ao garantir perfil via cliente. Verifique se o Trigger do banco está ativo.", profileError);
            // Não lançamos erro aqui para não bloquear o fluxo se o usuário já foi criado no Auth.
        }
    }
    
    alert("Cadastro realizado! Verifique seu e-mail para confirmar a conta (se configurado) ou aguarde aprovação.");
  };

  const logout = async () => {
    if (user && user.id.startsWith('mock-')) {
        setUser(null);
        mockDb.disableMockMode();
    } else {
        await supabase.auth.signOut();
        setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginMock, register, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};