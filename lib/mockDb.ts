import { supabase } from './supabaseClient';
import { Material, UserProfile, Role, SystemConfig, UserStatus, AccessLog, Language, Collection, CollectionItem, MaterialAsset } from '../types';

// --- MOCK DATA STORE (FALLBACK ONLY FOR READS) ---
let isMockMode = false; // Changed to false to use Supabase

// Mock Data Definitions (still kept for reference/fallback if needed)
const localUsers: UserProfile[] = [
  { id: 'mock-admin', name: 'Super Admin (Mock)', email: 'admin@demo.com', role: 'super_admin', whatsapp: '11999999999', status: 'active', preferences: { theme: 'light', language: 'pt-br' } },
  { id: 'mock-client', name: 'Cliente Exemplo', email: 'client@demo.com', role: 'client', whatsapp: '11988888888', cro: '12345', status: 'active', allowedTypes: ['pdf', 'image', 'video'], preferences: { theme: 'light', language: 'pt-br' } },
  { id: 'mock-distrib', name: 'Distribuidor Parceiro', email: 'distributor@demo.com', role: 'distributor', whatsapp: '11977777777', status: 'active', preferences: { theme: 'light', language: 'pt-br' } },
  { id: 'mock-consult', name: 'Consultor de Vendas', email: 'consultant@demo.com', role: 'consultant', whatsapp: '11966666666', status: 'active', preferences: { theme: 'light', language: 'pt-br' } }
];

const localMaterials: Material[] = [
  { id: 'mat-1', title: { 'pt-br': 'Catálogo Geral 2024' }, type: 'pdf', category: 'Catálogos', tags: ['2024', 'Lançamento'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-01-15T10:00:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' }, 'en-us': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } } },
  { id: 'mat-2', title: { 'pt-br': 'Manual de Instalação - Porcelanato' }, type: 'pdf', category: 'Técnico', tags: ['Instalação', 'Obra'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-02-10T14:30:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } } },
  { id: 'mat-3', title: { 'pt-br': 'Campanha Verão 2025' }, type: 'video', category: 'Marketing', tags: ['Verão', 'Redes Sociais'], allowedRoles: ['distributor', 'consultant'], active: true, createdAt: '2024-03-05T09:15:00Z', assets: { 'pt-br': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' } } },
  { id: 'mat-4', title: { 'pt-br': 'Tabela de Preços Q1 2025' }, type: 'pdf', category: 'Comercial', tags: ['Preços', 'Confidencial'], allowedRoles: ['distributor', 'super_admin'], active: true, createdAt: '2024-01-02T08:00:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } } },
  { id: 'mat-5', title: { 'pt-br': 'Treinamento: Superando Objeções' }, type: 'video', category: 'Treinamento', tags: ['Vendas', 'Negociação'], allowedRoles: ['consultant'], active: true, createdAt: '2024-03-20T16:45:00Z', assets: { 'pt-br': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' } } },
  { id: 'mat-6', title: { 'pt-br': 'Ambiente Cozinha Planejada' }, type: 'image', category: 'Inspiração', tags: ['Cozinha', 'Decoração'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-04-01T11:20:00Z', assets: { 'pt-br': { url: 'https://via.placeholder.com/800x600', status: 'published' } } },
  { id: 'mat-7', title: { 'pt-br': 'Fachada Moderna' }, type: 'image', category: 'Inspiração', tags: ['Fachada', 'Arquitetura'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-04-05T13:10:00Z', assets: { 'pt-br': { url: 'https://via.placeholder.com/800x600', status: 'published' } } },
  { id: 'mat-8', title: { 'pt-br': 'Especificações Técnicas - Linha Premium' }, type: 'pdf', category: 'Técnico', tags: ['Premium', 'Especificações'], allowedRoles: ['consultant'], active: true, createdAt: '2024-02-28T10:00:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } } },
  { id: 'mat-9', title: { 'pt-br': 'Logo Kit (Vetores)' }, type: 'image', category: 'Marketing', tags: ['Branding', 'Logo'], allowedRoles: ['distributor'], active: true, createdAt: '2024-01-10T09:00:00Z', assets: { 'pt-br': { url: 'https://via.placeholder.com/500x500', status: 'published' } } },
  { id: 'mat-10', title: { 'pt-br': 'Vídeo Institucional 2024', 'en-us': 'Institutional Video 2024' }, type: 'video', category: 'Institucional', tags: ['Marca', 'História'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-01-01T12:00:00Z', assets: { 'pt-br': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' }, 'en-us': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' } } },
  { id: 'mat-11', title: { 'pt-br': 'Guia de Cores 2025' }, type: 'pdf', category: 'Design', tags: ['Tendências', 'Cores'], allowedRoles: ['consultant', 'distributor'], active: true, createdAt: '2024-05-15T14:00:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } } },
  { id: 'mat-12', title: { 'pt-br': 'Post Instagram - Promoção' }, type: 'image', category: 'Marketing', tags: ['Social Media', 'Promo'], allowedRoles: ['distributor'], active: true, createdAt: '2024-06-01T10:30:00Z', assets: { 'pt-br': { url: 'https://via.placeholder.com/1080x1080', status: 'published' } } },
  { id: 'mat-13', title: { 'pt-br': 'Webinar: Tendências de Mercado' }, type: 'video', category: 'Treinamento', tags: ['Mercado', 'Estratégia'], allowedRoles: ['consultant', 'distributor'], active: true, createdAt: '2024-06-10T16:00:00Z', assets: { 'pt-br': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' } } },
  { id: 'mat-14', title: { 'pt-br': 'Certificado de Garantia' }, type: 'pdf', category: 'Legal', tags: ['Garantia', 'Jurídico'], allowedRoles: ['client'], active: true, createdAt: '2024-01-20T08:30:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } } },
];

const localCollections: Collection[] = [
  { id: 'col-1', title: { 'pt-br': 'Onboarding Consultores', 'en-us': 'Consultant Onboarding' }, description: { 'pt-br': 'Tudo que você precisa saber para começar.', 'en-us': 'Everything you need to know to start.' }, coverImage: 'https://via.placeholder.com/400x200', allowedRoles: ['consultant'], active: true, createdAt: '2024-01-10T10:00:00Z' },
  { id: 'col-2', title: { 'pt-br': 'Lançamentos 2024', 'en-us': '2024 Releases' }, description: { 'pt-br': 'Conheça nossa nova linha de produtos.', 'en-us': 'Meet our new product line.' }, coverImage: 'https://via.placeholder.com/400x200', allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-02-15T14:00:00Z' },
  { id: 'col-3', title: { 'pt-br': 'Kit Marketing Digital', 'en-us': 'Digital Marketing Kit' }, description: { 'pt-br': 'Materiais prontos para redes sociais.', 'en-us': 'Ready-to-use social media assets.' }, coverImage: 'https://via.placeholder.com/400x200', allowedRoles: ['distributor'], active: true, createdAt: '2024-03-01T09:00:00Z' }
];

const localCollectionItems = [
  { id: 'ci-1', collectionId: 'col-1', materialId: 'mat-10', orderIndex: 1 },
  { id: 'ci-2', collectionId: 'col-1', materialId: 'mat-1', orderIndex: 2 },
  { id: 'ci-3', collectionId: 'col-1', materialId: 'mat-5', orderIndex: 3 },
  { id: 'ci-4', collectionId: 'col-2', materialId: 'mat-1', orderIndex: 1 },
  { id: 'ci-5', collectionId: 'col-2', materialId: 'mat-6', orderIndex: 2 },
  { id: 'ci-6', collectionId: 'col-3', materialId: 'mat-3', orderIndex: 1 },
  { id: 'ci-7', collectionId: 'col-3', materialId: 'mat-9', orderIndex: 2 },
  { id: 'ci-8', collectionId: 'col-3', materialId: 'mat-12', orderIndex: 3 },
];

const localAccessLogs: any[] = [
  { id: 'log-1', material_id: 'mat-1', user_id: 'mock-client', language: 'pt-br', timestamp: '2024-06-15T10:00:00Z', materials: { title: { 'pt-br': 'Catálogo Geral 2024' } }, profiles: { name: 'Cliente Exemplo', role: 'client' } },
  { id: 'log-2', material_id: 'mat-3', user_id: 'mock-distrib', language: 'pt-br', timestamp: '2024-06-15T11:30:00Z', materials: { title: { 'pt-br': 'Campanha Verão 2025' } }, profiles: { name: 'Distribuidor Parceiro', role: 'distributor' } },
  { id: 'log-3', material_id: 'mat-5', user_id: 'mock-consult', language: 'pt-br', timestamp: '2024-06-14T09:00:00Z', materials: { title: { 'pt-br': 'Treinamento: Superando Objeções' } }, profiles: { name: 'Consultor de Vendas', role: 'consultant' } },
  { id: 'log-4', material_id: 'mat-1', user_id: 'mock-distrib', language: 'pt-br', timestamp: '2024-06-14T14:00:00Z', materials: { title: { 'pt-br': 'Catálogo Geral 2024' } }, profiles: { name: 'Distribuidor Parceiro', role: 'distributor' } },
  { id: 'log-5', material_id: 'mat-10', user_id: 'mock-admin', language: 'pt-br', timestamp: '2024-06-13T16:20:00Z', materials: { title: { 'pt-br': 'Vídeo Institucional 2024' } }, profiles: { name: 'Super Admin (Mock)', role: 'super_admin' } },
  { id: 'log-6', material_id: 'mat-6', user_id: 'mock-client', language: 'pt-br', timestamp: '2024-06-13T10:15:00Z', materials: { title: { 'pt-br': 'Ambiente Cozinha Planejada' } }, profiles: { name: 'Cliente Exemplo', role: 'client' } },
  { id: 'log-7', material_id: 'mat-2', user_id: 'mock-consult', language: 'pt-br', timestamp: '2024-06-12T11:00:00Z', materials: { title: { 'pt-br': 'Manual de Instalação' } }, profiles: { name: 'Consultor de Vendas', role: 'consultant' } },
  { id: 'log-8', material_id: 'mat-4', user_id: 'mock-distrib', language: 'pt-br', timestamp: '2024-06-12T09:45:00Z', materials: { title: { 'pt-br': 'Tabela de Preços Q1 2025' } }, profiles: { name: 'Distribuidor Parceiro', role: 'distributor' } },
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
    createdAt: data.created_at,
    tags: data.tags || [],
    category: data.category
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
    if (isMockMode) return localUsers;

    const { data, error } = await supabase.from('profiles').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapProfileFromDb);
  },

  getMaterials: async (role: Role): Promise<Material[]> => {
    if (isMockMode) {
      if (role === 'super_admin') return localMaterials;
      return localMaterials.filter(m => m.active && (m.allowedRoles.includes(role) || m.allowedRoles.length === 0));
    }

    let query = supabase.from('materials').select(`*, material_assets (*)`).order('created_at', { ascending: false });

    if (role !== 'super_admin') {
      query = query.eq('active', true).contains('allowed_roles', [role]);
    }

    const { data, error } = await query;
    if (error) {
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
    if (isMockMode) {
      return localAccessLogs.map(log => ({
        id: log.id,
        materialId: log.material_id,
        materialTitle: log.materials.title['pt-br'],
        userId: log.user_id,
        userName: log.profiles.name,
        userRole: log.profiles.role,
        language: log.language,
        timestamp: log.timestamp
      }));
    }

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

  login: async () => { },
  register: async () => { },
  loginMock: async () => { },

  // --- COLLECTIONS (Fase 3.1) ---

  getCollections: async (role: Role): Promise<Collection[]> => {
    if (isMockMode) {
      if (role === 'super_admin') return localCollections;
      return localCollections.filter(c => c.active && (c.allowedRoles.includes(role) || c.allowedRoles.length === 0));
    }

    let query = supabase.from('collections').select('*').order('created_at', { ascending: false });

    if (role !== 'super_admin') {
      query = query.eq('active', true).contains('allowed_roles', [role]);
    }

    const { data, error } = await query;
    if (error) {
      if (error.code === '42P01') return [];
      throw error;
    }
    return data || [];
  },

  getCollectionById: async (id: string): Promise<Collection | null> => {
    if (isMockMode) {
      return localCollections.find(c => c.id === id) || null;
    }

    const { data, error } = await supabase.from('collections').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  createCollection: async (collection: Omit<Collection, 'id' | 'createdAt'>): Promise<Collection> => {
    const { data, error } = await supabase.from('collections').insert({
      title: collection.title,
      description: collection.description,
      cover_image: collection.coverImage,
      allowed_roles: collection.allowedRoles,
      active: collection.active
    }).select().single();

    if (error) throw error;
    return data;
  },

  updateCollection: async (collection: Collection): Promise<void> => {
    const { error } = await supabase.from('collections').update({
      title: collection.title,
      description: collection.description,
      cover_image: collection.coverImage,
      allowed_roles: collection.allowedRoles,
      active: collection.active
    }).eq('id', collection.id);

    if (error) throw error;
  },

  deleteCollection: async (id: string): Promise<void> => {
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw error;
  },

  // Collection Items Management
  getCollectionItems: async (collectionId: string): Promise<{ item: CollectionItem, material: Material | null }[]> => {
    if (isMockMode) {
      const items = localCollectionItems
        .filter(i => i.collectionId === collectionId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      return items.map(item => ({
        item,
        material: localMaterials.find(m => m.id === item.materialId) || null
      }));
    }

    const { data, error } = await supabase
      .from('collection_items')
      .select(`*, materials (*)`)
      .eq('collection_id', collectionId)
      .order('order_index');

    if (error) {
      if (error.code === '42P01') return [];
      throw error;
    }

    return (data || []).map((row: any) => ({
      item: {
        id: row.id,
        collectionId: row.collection_id,
        materialId: row.material_id,
        orderIndex: row.order_index
      },
      material: row.materials ? mapMaterialFromDb(row.materials) : null
    }));
  },

  addMaterialToCollection: async (collectionId: string, materialId: string): Promise<void> => {
    const { data: maxData } = await supabase.from('collection_items')
      .select('order_index')
      .eq('collection_id', collectionId)
      .order('order_index', { ascending: false })
      .limit(1);

    const newIndex = (maxData?.[0]?.order_index || 0) + 1;

    const { error } = await supabase.from('collection_items').insert({
      collection_id: collectionId,
      material_id: materialId,
      order_index: newIndex
    });

    if (error) throw error;
  },

  removeMaterialFromCollection: async (itemId: string): Promise<void> => {
    const { error } = await supabase.from('collection_items').delete().eq('id', itemId);
    if (error) throw error;
  }
};