import { supabase } from './supabaseClient';
import { Material, UserProfile, Role, SystemConfig, UserStatus, AccessLog, Language } from '../types';

// --- MOCK DATA STORE (OFFLINE MODE) ---
let isMockMode = false;

const localUsers: UserProfile[] = [
    { id: 'mock-admin', name: 'Super Admin (Mock)', email: 'admin@demo.com', role: 'super_admin', whatsapp: '11999999999', status: 'active', preferences: { theme: 'light', language: 'pt-br' } },
    { id: 'mock-client', name: 'Cliente Exemplo', email: 'client@demo.com', role: 'client', whatsapp: '11988888888', cro: '12345', status: 'active', preferences: { theme: 'light', language: 'pt-br' } },
    { id: 'mock-distrib', name: 'Distribuidor Parceiro', email: 'distributor@demo.com', role: 'distributor', whatsapp: '11977777777', status: 'active', preferences: { theme: 'dark', language: 'en-us' } },
    { id: 'mock-consult', name: 'Consultor de Vendas', email: 'consultant@demo.com', role: 'consultant', whatsapp: '11966666666', status: 'pending', preferences: { theme: 'light', language: 'es-es' } },
];

let localMaterials: Material[] = [
    {
        id: 'mat-1',
        title: { 'pt-br': 'Catálogo de Produtos 2024', 'en-us': 'Product Catalog 2024' },
        type: 'pdf',
        allowedRoles: ['client', 'distributor', 'consultant'],
        active: true,
        createdAt: new Date().toISOString(),
        assets: {
            'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            'en-us': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
        }
    },
    {
        id: 'mat-2',
        title: { 'pt-br': 'Vídeo Institucional', 'es-es': 'Video Institucional' },
        type: 'video',
        allowedRoles: ['client', 'distributor', 'consultant'],
        active: true,
        createdAt: new Date().toISOString(),
        assets: {
            'pt-br': { url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' }, // Tech demo video
        }
    },
    {
        id: 'mat-3',
        title: { 'pt-br': 'Tabela de Preços (Confidencial)', 'en-us': 'Price List (Confidential)' },
        type: 'image',
        allowedRoles: ['distributor', 'super_admin'],
        active: true,
        createdAt: new Date().toISOString(),
        assets: {
            'pt-br': { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000' }
        }
    }
];

let localLogs: AccessLog[] = [
    { id: 'log-1', materialId: 'mat-1', materialTitle: 'Catálogo 2024', userId: 'mock-client', userName: 'Cliente Exemplo', userRole: 'client', language: 'pt-br', timestamp: new Date().toISOString() }
];

let localConfig: SystemConfig = {
    appName: 'Hub Conexão (Mock)',
    themeLight: { background: '#f8fafc', surface: '#ffffff', textMain: '#0f172a', textMuted: '#64748b', border: '#e2e8f0', accent: '#3b82f6', success: '#22c55e', warning: '#eab308', error: '#ef4444' },
    themeDark: { background: '#0b1120', surface: '#1e293b', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#334155', accent: '#60a5fa', success: '#4ade80', warning: '#facc15', error: '#f87171' }
};

// Helper para converter snake_case do banco para camelCase do frontend
const mapProfileFromDb = (data: any): UserProfile => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role,
  whatsapp: data.whatsapp,
  cro: data.cro,
  status: data.status,
  allowedTypes: data.allowed_types, // DB: allowed_types -> Front: allowedTypes
  preferences: data.preferences || { theme: 'light', language: 'pt-br' }
});

const mapMaterialFromDb = (data: any): Material => ({
  id: data.id,
  title: data.title,
  type: data.type,
  allowedRoles: data.allowed_roles, // DB: allowed_roles -> Front: allowedRoles
  assets: data.assets,
  active: data.active,
  createdAt: data.created_at
});

// Adapter que substitui o Mock pelo Supabase Real
export const mockDb = {
  
  enableMockMode: () => {
      console.log("🟡 MOCK MODE ACTIVATED");
      isMockMode = true;
  },

  disableMockMode: () => {
      isMockMode = false;
  },

  // --- SYSTEM CONFIG ---
  getSystemConfig: async (): Promise<SystemConfig> => {
    if (isMockMode) return localConfig;

    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      // Fallback seguro caso o banco esteja vazio
      return localConfig;
    }

    return {
      appName: data.app_name,
      logoUrl: data.logo_url,
      webhookUrl: data.webhook_url,
      themeLight: data.theme_light,
      themeDark: data.theme_dark
    };
  },

  updateSystemConfig: async (config: SystemConfig): Promise<void> => {
    if (isMockMode) {
        localConfig = config;
        return;
    }

    const { error } = await supabase
      .from('system_config')
      .update({
        app_name: config.appName,
        logo_url: config.logoUrl,
        webhook_url: config.webhookUrl,
        theme_light: config.themeLight,
        theme_dark: config.themeDark,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) throw error;
  },

  // --- AUTH (Apenas métodos auxiliares, o login real é feito no AuthContext via supabase.auth) ---
  
  // Busca o perfil completo na tabela 'profiles'
  getProfileByEmail: async (email: string): Promise<UserProfile | null> => {
    if (isMockMode) return localUsers.find(u => u.email === email) || null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return null;
    return mapProfileFromDb(data);
  },

  getProfileById: async (id: string): Promise<UserProfile | null> => {
    if (isMockMode) return localUsers.find(u => u.id === id) || null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return mapProfileFromDb(data);
  },

  // --- USERS MANAGEMENT ---
  getUsers: async (): Promise<UserProfile[]> => {
    if (isMockMode) return [...localUsers];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return (data || []).map(mapProfileFromDb);
  },

  updateUserStatus: async (userId: string, status: UserStatus): Promise<void> => {
    if (isMockMode) {
        const u = localUsers.find(user => user.id === userId);
        if (u) u.status = status;
        return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);
    if (error) throw error;
  },

  updateUser: async (updatedUser: UserProfile): Promise<void> => {
    if (isMockMode) {
        const idx = localUsers.findIndex(u => u.id === updatedUser.id);
        if (idx !== -1) localUsers[idx] = updatedUser;
        return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name,
        email: updatedUser.email,
        whatsapp: updatedUser.whatsapp,
        cro: updatedUser.cro,
        role: updatedUser.role,
        status: updatedUser.status,
        allowed_types: updatedUser.allowedTypes,
        preferences: updatedUser.preferences
      })
      .eq('id', updatedUser.id);
    if (error) throw error;
  },

  deleteUser: async (userId: string): Promise<void> => {
    if (isMockMode) {
        const idx = localUsers.findIndex(u => u.id === userId);
        if (idx !== -1) localUsers.splice(idx, 1);
        return;
    }
    // Nota: No Supabase, deletar da tabela 'auth.users' requer a Service Role Key (backend).
    // Aqui deletamos apenas o perfil público. O ideal é usar uma Edge Function para deletar o Auth User também.
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  },

  // --- MATERIALS ---
  getMaterials: async (role: Role): Promise<Material[]> => {
    if (isMockMode) {
        if (role === 'super_admin') return [...localMaterials];
        return localMaterials.filter(m => m.active && m.allowedRoles.includes(role));
    }

    let query = supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    // Se não for admin, aplica filtros de visibilidade (embora o RLS já faça isso, é bom filtrar no front/query também)
    if (role !== 'super_admin') {
      query = query
        .eq('active', true)
        .contains('allowed_roles', [role]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapMaterialFromDb);
  },

  createMaterial: async (material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> => {
    if (isMockMode) {
        const newMat: Material = {
            ...material,
            id: `mat-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        localMaterials.unshift(newMat);
        return newMat;
    }

    const { data, error } = await supabase
      .from('materials')
      .insert({
        title: material.title,
        type: material.type,
        allowed_roles: material.allowedRoles,
        assets: material.assets,
        active: material.active
      })
      .select()
      .single();

    if (error) throw error;
    return mapMaterialFromDb(data);
  },

  updateMaterial: async (material: Material): Promise<void> => {
    if (isMockMode) {
        const idx = localMaterials.findIndex(m => m.id === material.id);
        if (idx !== -1) localMaterials[idx] = material;
        return;
    }

    const { error } = await supabase
      .from('materials')
      .update({
        title: material.title,
        type: material.type,
        allowed_roles: material.allowedRoles,
        assets: material.assets,
        active: material.active
      })
      .eq('id', material.id);

    if (error) throw error;
  },

  deleteMaterial: async (id: string): Promise<void> => {
    if (isMockMode) {
        const idx = localMaterials.findIndex(m => m.id === id);
        if (idx !== -1) localMaterials.splice(idx, 1);
        return;
    }

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- ANALYTICS ---
  logAccess: async (materialId: string, userId: string, language: Language): Promise<void> => {
    if (isMockMode) {
        const mat = localMaterials.find(m => m.id === materialId);
        const usr = localUsers.find(u => u.id === userId);
        localLogs.unshift({
            id: `log-${Date.now()}`,
            materialId,
            materialTitle: mat?.title['pt-br'] || 'Material',
            userId,
            userName: usr?.name || 'User',
            userRole: usr?.role || 'client',
            language,
            timestamp: new Date().toISOString()
        });
        return;
    }

    const { error } = await supabase
      .from('access_logs')
      .insert({
        material_id: materialId,
        user_id: userId,
        language: language
      });
      
    if (error) console.error("Error logging access:", error);
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    if (isMockMode) return [...localLogs];

    // Join manual ou View no banco seria melhor, mas vamos buscar e mapear
    // Precisamos buscar logs e fazer join com materials e profiles para ter os nomes
    
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select(`
        id,
        material_id,
        user_id,
        language,
        timestamp,
        materials ( title ),
        profiles ( name, role )
      `)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return logs.map((log: any) => {
        // Safe access to joined data
        const matTitle = log.materials?.title?.['pt-br'] || log.materials?.title?.['en-us'] || 'Material Excluído';
        const userName = log.profiles?.name || 'Usuário Removido';
        const userRole = log.profiles?.role || 'client';

        return {
            id: log.id,
            materialId: log.material_id,
            materialTitle: matTitle,
            userId: log.user_id,
            userName: userName,
            userRole: userRole,
            language: log.language,
            timestamp: log.timestamp
        };
    });
  },

  // Métodos legacy mantidos para não quebrar contrato do AuthContext antigo,
  // mas agora lançam erro ou redirecionam, pois o AuthContext novo cuidará disso.
  login: async () => { throw new Error("Use supabase.auth.signInWithPassword"); },
  register: async () => { throw new Error("Use supabase.auth.signUp"); }
};