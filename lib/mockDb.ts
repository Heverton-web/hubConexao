import { supabase } from './supabaseClient';
import { Material, UserProfile, Role, SystemConfig, UserStatus, AccessLog, Language, Collection, CollectionItem, UserProgress, MaterialAsset } from '../types';

// --- MOCK DATA STORE (FALLBACK ONLY FOR READS) ---
let isMockMode = false;

// Mock Data Definitions (Used only if DB read fails heavily or explicitly requested)
const localUsers: UserProfile[] = [
    { id: 'mock-admin', name: 'Super Admin (Mock)', email: 'admin@demo.com', role: 'super_admin', whatsapp: '11999999999', status: 'active', preferences: { theme: 'light', language: 'pt-br' } },
    { id: 'mock-client', name: 'Cliente Exemplo', email: 'client@demo.com', role: 'client', whatsapp: '11988888888', cro: '12345', status: 'active', preferences: { theme: 'light', language: 'pt-br' } }
];

// Helper to convert DB snake_case to frontend camelCase
const mapProfileFromDb = (data: any): UserProfile => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role,
  whatsapp: data.whatsapp,
  cro: data.cro,
  status: data.status,
  allowedTypes: data.allowed_types, 
  preferences: data.preferences || { theme: 'light', language: 'pt-br' }
});

const mapMaterialFromDb = (data: any): Material => {
    const assetsObj: Partial<Record<Language, MaterialAsset>> = {};
    if (data.material_assets && Array.isArray(data.material_assets)) {
        data.material_assets.forEach((asset: any) => {
            assetsObj[asset.language as Language] = {
                url: asset.url,
                subtitleUrl: asset.subtitle_url,
                status: asset.status
            };
        });
    }
    return {
        id: data.id,
        title: data.title,
        type: data.type,
        allowedRoles: data.allowed_roles,
        assets: assetsObj,
        active: data.active,
        createdAt: data.created_at
    };
};

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
    // Tries to fetch from Supabase. If table missing (404/500), returns defaults silently to not break UI.
    const { data, error } = await supabase.from('system_config').select('*').eq('id', 1).single();
    
    // Default config object used when DB is missing or error
    const defaults: SystemConfig = {
        appName: 'Hub Conexão',
        themeLight: { background: '#f8fafc', surface: '#ffffff', textMain: '#0f172a', textMuted: '#64748b', border: '#e2e8f0', accent: '#3b82f6', success: '#10b981', warning: '#f59e0b', error: '#ef4444' },
        themeDark: { background: '#0f172a', surface: '#1e293b', textMain: '#f8fafc', textMuted: '#94a3b8', border: 'transparent', accent: '#6366f1', success: '#22c55e', warning: '#eab308', error: '#ef4444' }
    };

    if (error || !data) {
        // If error is missing table, return defaults so app can mount. AuthContext will catch the missing DB and block the UI.
        return defaults;
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
    const { error } = await supabase
      .from('system_config')
      .upsert({
        id: 1,
        app_name: config.appName,
        logo_url: config.logoUrl,
        webhook_url: config.webhookUrl,
        theme_light: config.themeLight,
        theme_dark: config.themeDark,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // --- AUTH PROFILE READS ---
  getProfileById: async (id: string): Promise<UserProfile | null> => {
    if (id.startsWith('mock-')) return localUsers.find(u => u.id === id) || null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        // If 42P01 (Missing Table), we throw so AuthContext catches it
        if (error.code === '42P01') throw error;
        console.error("DB Read Error:", error);
        return null; 
    }
    return mapProfileFromDb(data);
  },

  // --- WRITES (STRICT SUPABASE) ---
  
  updateUserStatus: async (userId: string, status: UserStatus): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (error) throw error;
  },

  updateUser: async (updatedUser: UserProfile): Promise<void> => {
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
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },

  createMaterial: async (material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> => {
    const { data: matData, error: matError } = await supabase
      .from('materials')
      .insert({
        title: material.title,
        type: material.type,
        allowed_roles: material.allowedRoles,
        active: material.active
      })
      .select()
      .single();

    if (matError) throw matError;

    const assetsToInsert = Object.entries(material.assets).map(([lang, asset]) => ({
        material_id: matData.id,
        language: lang,
        url: asset.url,
        subtitle_url: asset.subtitleUrl,
        status: asset.status
    }));

    if (assetsToInsert.length > 0) {
        const { error: assetError } = await supabase.from('material_assets').insert(assetsToInsert);
        if (assetError) throw assetError;
    }

    return { ...mapMaterialFromDb(matData), assets: material.assets };
  },

  updateMaterial: async (material: Material): Promise<void> => {
    const { error: matError } = await supabase
      .from('materials')
      .update({
        title: material.title,
        type: material.type,
        allowed_roles: material.allowedRoles,
        active: material.active
      })
      .eq('id', material.id);

    if (matError) throw matError;

    const { error: delError } = await supabase.from('material_assets').delete().eq('material_id', material.id);
    if (delError) throw delError;

    const assetsToInsert = Object.entries(material.assets).map(([lang, asset]) => ({
        material_id: material.id,
        language: lang,
        url: asset.url,
        subtitle_url: asset.subtitleUrl,
        status: asset.status
    }));

    if (assetsToInsert.length > 0) {
        const { error: assetError } = await supabase.from('material_assets').insert(assetsToInsert);
        if (assetError) throw assetError;
    }
  },

  deleteMaterial: async (id: string): Promise<void> => {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) throw error;
  },

  // --- READS ---
  getUsers: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase.from('profiles').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapProfileFromDb);
  },

  getMaterials: async (role: Role): Promise<Material[]> => {
    let query = supabase.from('materials').select(`*, material_assets (*)`).order('created_at', { ascending: false });

    if (role !== 'super_admin') {
      query = query.eq('active', true).contains('allowed_roles', [role]);
    }

    const { data, error } = await query;
    if (error) {
       // Allow 42P01 to fall through or return empty if handled elsewhere
       if (error.code === '42P01') throw error; 
       throw error;
    }
    return (data || []).map(mapMaterialFromDb);
  },

  // --- ANALYTICS ---
  logAccess: async (materialId: string, userId: string, language: Language): Promise<void> => {
    const { error } = await supabase.from('access_logs').insert({ material_id: materialId, user_id: userId, language: language });
    if (error) console.error("Error logging access:", error);
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select(`id, material_id, user_id, language, timestamp, materials ( title ), profiles ( name, role )`)
      .order('timestamp', { ascending: false });

    if (error) {
        if (error.code === '42P01') throw error;
        throw error;
    }

    return logs.map((log: any) => ({
        id: log.id,
        materialId: log.material_id,
        materialTitle: log.materials?.title?.['pt-br'] || 'Item Excluído',
        userId: log.user_id,
        userName: log.profiles?.name || 'Desconhecido',
        userRole: log.profiles?.role || 'client',
        language: log.language,
        timestamp: log.timestamp
    }));
  },

  login: async () => {},
  register: async () => {},
  loginMock: async () => {},
};