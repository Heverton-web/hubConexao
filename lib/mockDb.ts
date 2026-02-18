import { supabase } from './supabaseClient';
import { Material, UserProfile, Role, SystemConfig, UserStatus, AccessLog, Language, Collection, CollectionItem, MaterialAsset, ApiKey } from '../types';

// --- MOCK DATA STORE ---
let isMockMode = true;

const RANKS = [
  { name: 'Iniciante', minPoints: 0 },
  { name: 'Bronze', minPoints: 500 },
  { name: 'Prata', minPoints: 1500 },
  { name: 'Ouro', minPoints: 3000 },
  { name: 'Esmeralda', minPoints: 5000 },
  { name: 'Master', minPoints: 10000 },
];

const localUsers: UserProfile[] = [
  { id: 'mock-admin', name: 'Super Admin (Mock)', email: 'admin@demo.com', role: 'super_admin', whatsapp: '11999999999', status: 'active', preferences: { theme: 'light', language: 'pt-br' }, points: 5000, rank: 'Esmeralda' },
  { id: 'mock-client', name: 'Cliente Exemplo', email: 'client@demo.com', role: 'client', whatsapp: '11988888888', cro: '12345', status: 'active', allowedTypes: ['pdf', 'image', 'video'], preferences: { theme: 'light', language: 'pt-br' }, points: 120, rank: 'Iniciante' },
  { id: 'mock-distrib', name: 'Distribuidor Parceiro', email: 'distributor@demo.com', role: 'distributor', whatsapp: '11977777777', status: 'active', preferences: { theme: 'light', language: 'pt-br' }, points: 1500, rank: 'Prata' },
  { id: 'mock-consult', name: 'Consultor de Vendas', email: 'consultant@demo.com', role: 'consultant', whatsapp: '11966666666', status: 'active', preferences: { theme: 'light', language: 'pt-br' }, points: 3200, rank: 'Ouro' }
];

const localMaterials: Material[] = [
  { id: 'mat-1', title: { 'pt-br': 'Catálogo Geral 2024' }, type: 'pdf', category: 'Catálogos', tags: ['2024', 'Lançamento'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-01-15T10:00:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } }, points: 50 },
  { id: 'mat-2', title: { 'pt-br': 'Manual de Instalação' }, type: 'pdf', category: 'Técnico', tags: ['Instalação'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-02-10T14:30:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } }, points: 100 },
  { id: 'mat-3', title: { 'pt-br': 'Campanha Verão 2025' }, type: 'video', category: 'Marketing', tags: ['Verão'], allowedRoles: ['distributor', 'consultant'], active: true, createdAt: '2024-03-05T09:15:00Z', assets: { 'pt-br': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' } }, points: 150 },
  { id: 'mat-4', title: { 'pt-br': 'Tabela de Preços Q1' }, type: 'pdf', category: 'Comercial', tags: ['Preços'], allowedRoles: ['distributor', 'super_admin'], active: true, createdAt: '2024-01-02T08:00:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } }, points: 50 },
  { id: 'mat-5', title: { 'pt-br': 'Treinamento: Objeções' }, type: 'video', category: 'Treinamento', tags: ['Vendas'], allowedRoles: ['consultant'], active: true, createdAt: '2024-03-20T16:45:00Z', assets: { 'pt-br': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' } }, points: 200 },
  { id: 'mat-6', title: { 'pt-br': 'Ambiente Cozinha' }, type: 'image', category: 'Inspiração', tags: ['Cozinha'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-04-01T11:20:00Z', assets: { 'pt-br': { url: 'https://via.placeholder.com/800x600', status: 'published' } }, points: 30 },
  { id: 'mat-7', title: { 'pt-br': 'Fachada Moderna' }, type: 'image', category: 'Inspiração', tags: ['Fachada'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-04-05T13:10:00Z', assets: { 'pt-br': { url: 'https://via.placeholder.com/800x600', status: 'published' } }, points: 30 },
  { id: 'mat-8', title: { 'pt-br': 'Especificações Técnicas' }, type: 'pdf', category: 'Técnico', tags: ['Premium'], allowedRoles: ['consultant'], active: true, createdAt: '2024-02-28T10:00:00Z', assets: { 'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' } }, points: 100 },
  { id: 'mat-9', title: { 'pt-br': 'Logo Kit' }, type: 'image', category: 'Marketing', tags: ['Branding'], allowedRoles: ['distributor'], active: true, createdAt: '2024-01-10T09:00:00Z', assets: { 'pt-br': { url: 'https://via.placeholder.com/500x500', status: 'published' } }, points: 30 },
  { id: 'mat-10', title: { 'pt-br': 'Institucional 2024' }, type: 'video', category: 'Institucional', tags: ['Marca'], allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-01-01T12:00:00Z', assets: { 'pt-br': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' } }, points: 150 },
];

const localCollections: Collection[] = [
  { id: 'col-1', title: { 'pt-br': 'Onboarding Consultores', 'en-us': 'Consultant Onboarding' }, description: { 'pt-br': 'Tudo que você precisa saber para começar.', 'en-us': 'Everything you need to know to start.' }, coverImage: 'https://via.placeholder.com/400x200', allowedRoles: ['consultant'], active: true, createdAt: '2024-01-10T10:00:00Z', points: 500, progress: 65 },
  { id: 'col-2', title: { 'pt-br': 'Lançamentos 2024', 'en-us': '2024 Releases' }, description: { 'pt-br': 'Conheça nossa nova linha de produtos.', 'en-us': 'Meet our new product line.' }, coverImage: 'https://via.placeholder.com/400x200', allowedRoles: ['client', 'distributor', 'consultant'], active: true, createdAt: '2024-02-15T14:00:00Z', points: 350, progress: 10 },
  { id: 'col-3', title: { 'pt-br': 'Kit Marketing Digital', 'en-us': 'Digital Marketing Kit' }, description: { 'pt-br': 'Materiais prontos para redes sociais.', 'en-us': 'Ready-to-use social media assets.' }, coverImage: 'https://via.placeholder.com/400x200', allowedRoles: ['distributor'], active: true, createdAt: '2024-03-01T09:00:00Z', points: 1200, progress: 100 }
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

const localAccessLogs: any[] = [];

const localApiKeys: ApiKey[] = [
  { id: 'key-1', name: 'Integração Protheus', key: 'sk_live_conexao_123456789', createdAt: '2024-06-20T10:00:00Z' }
];

let localSystemConfig: SystemConfig = {
  appName: 'Hub Conexão',
  logoUrl: '',
  webhookUrl: 'https://n8n.suaempresa.com/webhook/conexao-hub',
  whatsappApiKey: '',
  whatsappInstance: '',
  themeLight: { background: '#f8fafc', surface: '#ffffff', textMain: '#0f172a', textMuted: '#64748b', border: '#e2e8f0', accent: '#3b82f6', success: '#10b981', warning: '#f59e0b', error: '#ef4444' },
  themeDark: { background: '#0f172a', surface: '#1e293b', textMain: '#f8fafc', textMuted: '#94a3b8', border: 'transparent', accent: '#6366f1', success: '#22c55e', warning: '#eab308', error: '#ef4444' }
};

// --- HELPERS ---
const mapProfileFromDb = (data: any): UserProfile => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role,
  whatsapp: data.whatsapp,
  cro: data.cro,
  status: data.status,
  allowedTypes: data.allowed_types,
  preferences: data.preferences || { theme: 'light', language: 'pt-br' },
  points: data.points || 0,
  rank: data.rank || 'Iniciante'
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
    category: data.category,
    points: data.points || 50
  };
};

const calculateRank = (points: number) => {
  const rank = [...RANKS].reverse().find(r => points >= r.minPoints);
  return rank ? rank.name : 'Iniciante';
};

const calculateCollectionStats = (collectionId: string) => {
  const items = localCollectionItems.filter(i => i.collectionId === collectionId);
  const stats = { video: 0, pdf: 0, image: 0 };
  items.forEach(item => {
    const mat = localMaterials.find(m => m.id === item.materialId);
    if (mat) {
      stats[mat.type]++;
    }
  });
  return stats;
};

// --- EXPORTED DB OBJECT ---
export const mockDb = {
  enableMockMode: () => { isMockMode = true; },
  disableMockMode: () => { isMockMode = false; },

  // --- SYSTEM CONFIG ---
  getSystemConfig: async (): Promise<SystemConfig> => {
    if (isMockMode) return localSystemConfig;
    const { data, error } = await supabase.from('system_config').select('*').eq('id', 1).single();
    if (error || !data) return localSystemConfig;
    return {
      appName: data.app_name,
      logoUrl: data.logo_url,
      webhookUrl: data.webhook_url,
      whatsappApiKey: data.whatsapp_api_key,
      whatsappInstance: data.whatsapp_instance,
      themeLight: data.theme_light,
      themeDark: data.theme_dark
    };
  },

  updateSystemConfig: async (config: SystemConfig): Promise<void> => {
    if (isMockMode) {
      localSystemConfig = config;
      return;
    }
    const { error } = await supabase.from('system_config').upsert({
      id: 1,
      app_name: config.appName,
      logo_url: config.logoUrl,
      webhook_url: config.webhookUrl,
      whatsapp_api_key: config.whatsappApiKey,
      whatsapp_instance: config.whatsappInstance,
      theme_light: config.themeLight,
      theme_dark: config.themeDark,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  // --- API KEYS ---
  getApiKeys: async (): Promise<ApiKey[]> => {
    if (isMockMode) return localApiKeys;
    const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(k => ({
      id: k.id,
      name: k.name,
      key: k.key,
      createdAt: k.created_at,
      lastUsedAt: k.last_used_at
    }));
  },

  createApiKey: async (name: string): Promise<ApiKey> => {
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    if (isMockMode) {
      const entry: ApiKey = { id: Math.random().toString(36).substring(7), name, key: newKey, createdAt: new Date().toISOString() };
      localApiKeys.push(entry);
      return entry;
    }
    const { data, error } = await supabase.from('api_keys').insert({ name, key: newKey }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      key: data.key,
      createdAt: data.created_at
    };
  },

  deleteApiKey: async (id: string): Promise<void> => {
    if (isMockMode) {
      const idx = localApiKeys.findIndex(k => k.id === id);
      if (idx > -1) localApiKeys.splice(idx, 1);
      return;
    }
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (error) throw error;
  },

  // --- PROFILES ---
  getUsers: async (): Promise<UserProfile[]> => {
    if (isMockMode) return localUsers;
    const { data, error } = await supabase.from('profiles').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapProfileFromDb);
  },

  getProfileById: async (id: string): Promise<UserProfile | null> => {
    if (isMockMode || id.startsWith('mock-')) return localUsers.find(u => u.id === id) || null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return null;
    return mapProfileFromDb(data);
  },

  updateUser: async (user: UserProfile): Promise<void> => {
    if (isMockMode || user.id.startsWith('mock-')) {
      const idx = localUsers.findIndex(u => u.id === user.id);
      if (idx > -1) localUsers[idx] = user;
      return;
    }
    const { error } = await supabase.from('profiles').update({
      name: user.name,
      email: user.email,
      role: user.role,
      whatsapp: user.whatsapp,
      cro: user.cro,
      status: user.status,
      allowed_types: user.allowedTypes,
      preferences: user.preferences,
      points: user.points,
      rank: user.rank
    }).eq('id', user.id);
    if (error) throw error;
  },

  deleteUser: async (id: string): Promise<void> => {
    if (isMockMode || id.startsWith('mock-')) {
      const idx = localUsers.findIndex(u => u.id === id);
      if (idx > -1) localUsers.splice(idx, 1);
      return;
    }
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  updateUserStatus: async (id: string, status: UserStatus): Promise<void> => {
    if (isMockMode || id.startsWith('mock-')) {
      const user = localUsers.find(u => u.id === id);
      if (user) user.status = status;
      return;
    }
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) throw error;
  },

  // --- MATERIALS ---
  getMaterials: async (role: Role): Promise<Material[]> => {
    if (isMockMode) {
      if (role === 'super_admin') return localMaterials;
      return localMaterials.filter(m => m.active && (m.allowedRoles.includes(role) || m.allowedRoles.length === 0));
    }
    let query = supabase.from('materials').select(`*, material_assets (*)`).order('created_at', { ascending: false });
    if (role !== 'super_admin') query = query.eq('active', true).contains('allowed_roles', [role]);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapMaterialFromDb);
  },

  createMaterial: async (material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> => {
    if (isMockMode) {
      const entry: Material = { ...material, id: `mat-${Date.now()}`, createdAt: new Date().toISOString() };
      localMaterials.push(entry);
      return entry;
    }
    const { data: matData, error: matError } = await supabase.from('materials').insert({
      title: material.title,
      type: material.type,
      allowed_roles: material.allowedRoles,
      category: material.category,
      active: material.active
    }).select().single();
    if (matError) throw matError;
    const assetsToInsert = Object.entries(material.assets).map(([lang, asset]) => ({
      material_id: matData.id,
      language: lang,
      url: asset.url,
      subtitle_url: asset.subtitleUrl,
      status: asset.status
    }));
    if (assetsToInsert.length > 0) await supabase.from('material_assets').insert(assetsToInsert);
    return mapMaterialFromDb({ ...matData, material_assets: assetsToInsert });
  },

  updateMaterial: async (material: Material): Promise<void> => {
    if (isMockMode) {
      const idx = localMaterials.findIndex(m => m.id === material.id);
      if (idx > -1) localMaterials[idx] = material;
      return;
    }
    await supabase.from('materials').update({
      title: material.title,
      type: material.type,
      allowed_roles: material.allowedRoles,
      category: material.category,
      active: material.active
    }).eq('id', material.id);
    await supabase.from('material_assets').delete().eq('material_id', material.id);
    const assetsToInsert = Object.entries(material.assets).map(([lang, asset]) => ({
      material_id: material.id,
      language: lang,
      url: asset.url,
      subtitle_url: asset.subtitleUrl,
      status: asset.status
    }));
    if (assetsToInsert.length > 0) await supabase.from('material_assets').insert(assetsToInsert);
  },

  deleteMaterial: async (id: string): Promise<void> => {
    if (isMockMode) {
      const idx = localMaterials.findIndex(m => m.id === id);
      if (idx > -1) localMaterials.splice(idx, 1);
      return;
    }
    await supabase.from('materials').delete().eq('id', id);
  },

  // --- COLLECTIONS ---
  getCollections: async (role: Role): Promise<Collection[]> => {
    if (isMockMode) {
      const results = role === 'super_admin' ? localCollections : localCollections.filter(c => c.active && (c.allowedRoles.includes(role) || c.allowedRoles.length === 0));
      return results.map(c => ({ ...c, stats: calculateCollectionStats(c.id) }));
    }
    let query = supabase.from('collections').select('*').order('created_at', { ascending: false });
    if (role !== 'super_admin') query = query.eq('active', true).contains('allowed_roles', [role]);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(c => ({ ...c, stats: { video: 0, pdf: 0, image: 0 } })); // Simplified for now
  },

  getCollectionById: async (id: string): Promise<Collection | null> => {
    if (isMockMode) {
      const col = localCollections.find(c => c.id === id);
      return col ? { ...col, stats: calculateCollectionStats(col.id) } : null;
    }
    const { data, error } = await supabase.from('collections').select('*').eq('id', id).single();
    if (error) return null;
    return { ...data, stats: { video: 0, pdf: 0, image: 0 } };
  },

  getCollectionItems: async (collectionId: string): Promise<{ item: CollectionItem, material: Material | null }[]> => {
    if (isMockMode) {
      const items = localCollectionItems
        .filter(i => i.collectionId === collectionId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      return items.map(i => ({
        item: { id: i.id, collectionId: i.collectionId, materialId: i.materialId, orderIndex: i.orderIndex },
        material: localMaterials.find(m => m.id === i.materialId) || null
      }));
    }
    const { data, error } = await supabase.from('collection_items').select(`*, materials (*, material_assets (*))`).eq('collection_id', collectionId).order('order_index');
    if (error) throw error;
    return (data || []).map((i: any) => ({
      item: { id: i.id, collectionId: i.collection_id, materialId: i.material_id, orderIndex: i.order_index },
      material: i.materials ? mapMaterialFromDb(i.materials) : null
    }));
  },

  createCollection: async (collection: Omit<Collection, 'id' | 'createdAt'>): Promise<Collection> => {
    if (isMockMode) {
      const entry: Collection = { ...collection, id: `col-${Date.now()}`, createdAt: new Date().toISOString() };
      localCollections.push(entry);
      return entry;
    }
    const { data, error } = await supabase.from('collections').insert({
      title: collection.title,
      description: collection.description,
      cover_image: collection.coverImage,
      allowed_roles: collection.allowedRoles,
      active: collection.active,
      points: collection.points || 0
    }).select().single();
    if (error) throw error;
    return { ...data, coverImage: data.cover_image, allowedRoles: data.allowed_roles };
  },

  updateCollection: async (collection: Collection): Promise<void> => {
    if (isMockMode) {
      const idx = localCollections.findIndex(c => c.id === collection.id);
      if (idx > -1) localCollections[idx] = collection;
      return;
    }
    const { error } = await supabase.from('collections').update({
      title: collection.title,
      description: collection.description,
      cover_image: collection.coverImage,
      allowed_roles: collection.allowedRoles,
      active: collection.active,
      points: collection.points
    }).eq('id', collection.id);
    if (error) throw error;
  },

  deleteCollection: async (id: string): Promise<void> => {
    if (isMockMode) {
      const idx = localCollections.findIndex(c => c.id === id);
      if (idx > -1) localCollections.splice(idx, 1);
      return;
    }
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw error;
  },

  addMaterialToCollection: async (collectionId: string, materialId: string): Promise<void> => {
    if (isMockMode) {
      const order = localCollectionItems.filter(i => i.collectionId === collectionId).length + 1;
      localCollectionItems.push({ id: `ci-${Date.now()}`, collectionId, materialId, orderIndex: order });
      return;
    }
    const { data: countData } = await supabase.from('collection_items').select('id', { count: 'exact' }).eq('collection_id', collectionId);
    const order = (countData?.length || 0) + 1;
    const { error } = await supabase.from('collection_items').insert({
      collection_id: collectionId,
      material_id: materialId,
      order_index: order
    });
    if (error) throw error;
  },

  removeMaterialFromCollection: async (itemId: string): Promise<void> => {
    if (isMockMode) {
      const idx = localCollectionItems.findIndex(i => i.id === itemId);
      if (idx > -1) localCollectionItems.splice(idx, 1);
      return;
    }
    const { error } = await supabase.from('collection_items').delete().eq('id', itemId);
    if (error) throw error;
  },
  // --- ANALYTICS ---
  logAccess: async (materialId: string, userId: string, language: Language): Promise<void> => {
    if (!isMockMode) await supabase.from('access_logs').insert({ material_id: materialId, user_id: userId, language: language });
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    if (isMockMode) return localAccessLogs;
    const { data, error } = await supabase.from('access_logs').select(`id, material_id, user_id, language, timestamp, materials(title), profiles(name, role)`).order('timestamp', { ascending: false });
    if (error) throw error;
    return data.map((log: any) => ({
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

  // --- GAMIFICATION ---
  completeMaterial: async (userId: string, materialId: string): Promise<void> => {
    const material = localMaterials.find(m => m.id === materialId);
    const pointsToAdd = material?.points || 50;
    if (isMockMode || userId.startsWith('mock-')) {
      const user = localUsers.find(u => u.id === userId);
      if (user) {
        user.points = (user.points || 0) + pointsToAdd;
        user.rank = calculateRank(user.points);
      }
    } else {
      const { data: user } = await supabase.from('profiles').select('points').eq('id', userId).single();
      if (user) {
        const newPoints = (user.points || 0) + pointsToAdd;
        await supabase.from('profiles').update({ points: newPoints, rank: calculateRank(newPoints) }).eq('id', userId);
      }
    }
  }
};
