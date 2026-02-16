import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { supabase } from '../lib/supabaseClient';
import { mockDb } from '../lib/mockDb';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginMock: (role: Role) => Promise<void>; 
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isDbMissing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbMissing, setIsDbMissing] = useState(false);

  useEffect(() => {
    // 1. Timeout de Segurança: Se o Supabase demorar > 3s, libera o app para evitar tela branca eterna
    const safetyTimeout = setTimeout(() => {
        console.warn("Auth timeout reached - forcing UI unlock");
        setIsLoading(false);
    }, 3000);

    const initAuth = async () => {
        // Checa banco primeiro
        await checkDbConnection();
        
        // Depois checa sessão
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
            await fetchProfile(session.user.id);
        } else {
            setIsLoading(false);
        }
        
        clearTimeout(safetyTimeout);
    };

    initAuth();

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        if (!user || !user.id.startsWith('mock-')) {
            setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkDbConnection = async () => {
    // Verificação leve para saber se as tabelas existem
    const { error } = await supabase.from('system_config').select('id').limit(1);
    if (error && error.code === '42P01') {
        setIsDbMissing(true);
        setIsLoading(false); // CRÍTICO: Desbloqueia a UI imediatamente para mostrar o Modal
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await mockDb.getProfileById(userId);
      if (profile) {
        setUser(profile);
      } else {
        // PERFIL ÓRFÃO: Usuário existe no Auth, mas não na tabela profiles
        console.warn("Perfil não encontrado para usuário logado. Tentando recuperar...");
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
             await ensureProfile(userId, {
                 name: userData.user.user_metadata.name || 'Usuário Recuperado',
                 email: userData.user.email,
                 role: userData.user.user_metadata.role || 'client',
                 whatsapp: userData.user.user_metadata.whatsapp || '',
                 cro: userData.user.user_metadata.cro
             });
             const newProfile = await mockDb.getProfileById(userId);
             if (newProfile) setUser(newProfile);
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      if (error.code === '42P01') {
          setIsDbMissing(true);
          setIsLoading(false); // Garante desbloqueio em caso de erro fatal
      }
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
    mockDb.disableMockMode();
  };

  const loginMock = async (role: Role) => {
      setIsLoading(true);
      mockDb.enableMockMode();
      
      const mockId = role === 'super_admin' ? 'mock-admin' : 
                     role === 'client' ? 'mock-client' :
                     role === 'distributor' ? 'mock-distrib' : 'mock-consult';
      
      const profile = await mockDb.getProfileById(mockId);
      if (profile) {
          setUser(profile);
      }
      setIsLoading(false);
  };

  // Helper para garantir que o perfil existe no banco
  const ensureProfile = async (userId: string, data: any) => {
      const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
          name: data.name,
          email: data.email,
          role: data.role,
          whatsapp: data.whatsapp,
          cro: data.cro || null,
          status: 'pending', 
          preferences: { theme: 'light', language: 'pt-br' }
      }, { onConflict: 'id' });

      if (profileError) {
          console.error("Erro ao salvar perfil manual:", profileError);
          if (profileError.code === '42P01') { 
              setIsDbMissing(true);
              setIsLoading(false);
              throw new Error("MISSING_DB_SETUP");
          }
      }
  };

  const register = async (data: any) => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || 'temp-password-change-me',
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

        if (authData.user) {
            await ensureProfile(authData.user.id, data);
        }

    } catch (error: any) {
        if (error.code === '42P01' || error.message?.includes('Database error')) {
             setIsDbMissing(true);
             setIsLoading(false);
             throw new Error("MISSING_DB_SETUP");
        }
        throw error;
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginMock, register, logout, isLoading, isDbMissing }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};