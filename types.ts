
export type Role = 'client' | 'distributor' | 'consultant' | 'super_admin';
export type Language = 'pt-br' | 'en-us' | 'es-es';
export type MaterialType = 'image' | 'pdf' | 'video';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type TranslationStatus = 'draft' | 'review' | 'published';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  whatsapp: string;
  cro?: string;
  status: UserStatus;
  allowedTypes?: MaterialType[]; // Se undefined ou vazio, permite todos. Se preenchido, restringe.
  preferences: {
    theme: 'light' | 'dark';
    language: Language;
  };
  points?: number;
  rank?: string;
}

export interface MaterialAsset {
  url: string;
  subtitleUrl?: string;
  status: TranslationStatus;
}

export interface Material {
  id: string;
  title: Partial<Record<Language, string>>;
  type: MaterialType;
  allowedRoles: Role[];
  assets: Partial<Record<Language, MaterialAsset>>;
  tags: string[];
  category?: string;
  active: boolean;
  createdAt: string;
  points?: number;
}

// --- Novas Interfaces para Trilhas e Progresso (Fase 1) ---

export interface Collection {
  id: string;
  title: Partial<Record<Language, string>>;
  description?: Partial<Record<Language, string>>;
  coverImage?: string;
  allowedRoles: Role[];
  active: boolean;
  createdAt: string;
  stats?: {
    video: number;
    pdf: number;
    image: number;
  };
  points?: number;
  progress?: number; // 0 to 100
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  materialId: string;
  orderIndex: number;
}

export interface UserProgress {
  userId: string;
  materialId: string;
  status: 'started' | 'completed';
  completedAt: string;
}

// ---------------------------------------------------------

export interface AccessLog {
  id: string;
  materialId: string;
  materialTitle: string; // Denormalized for simpler display
  userId: string;
  userName: string;
  userRole: Role;
  language: Language;
  timestamp: string;
}

export interface ColorScheme {
  background: string; // Cor de fundo da página
  surface: string;    // Cor de cards, modais, header
  textMain: string;   // Texto principal
  textMuted: string;  // Texto secundário/ícones
  border: string;     // Cor de bordas e divisores
  accent: string;     // Cor da marca (botões, links)
  success: string;    // Status Ativo, Sucesso
  warning: string;    // Status Pendente, Alerta
  error: string;      // Status Erro, Excluir, Inativo
}

export interface SystemConfig {
  appName: string;
  logoUrl?: string;
  webhookUrl?: string; // New field for N8N integration
  themeLight: ColorScheme;
  themeDark: ColorScheme;
}