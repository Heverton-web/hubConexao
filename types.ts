
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

  // Custom Design Colors (Aura 2026)
  lume: string;       // Cor Champagne do botão premium
  lumeText: string;   // Cor do texto no botão Lume
  phantom: string;    // Efeito de sombra/glow secundário
  glow: string;       // Cor de brilho neon principal

  // Status
  success: string;    // Status Ativo, Sucesso
  warning: string;    // Status Pendente, Alerta
  error: string;      // Status Erro, Excluir, Inativo

  // Advanced Effects
  glass: string;      // Cor de fundo do vidro (rgba)
  shadow: string;     // Sombra de elevação global
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface EffectsConfig {
  glassBlur: number;        // Blur do vidro em px
  glassSaturate: number;    // Saturação do vidro em %
  glassOpacity: number;     // Opacidade do fundo do vidro (0-1)
  grainOpacity: number;     // Opacidade do grão de filme (0-1)
  mouseGlowIntensity: number; // Intensidade do brilho que segue o mouse (0-1)
  hoverLift: number;        // Distância de levitação no hover em px
  revealDuration: number;   // Duração da animação de entrada em segundos
  glowIntensity: number;    // Intensidade geral do brilho neon (shadow blur)
}

export interface ElementStyle {
  radius: string;
  borderWidth: string;
  borderColor: string;
  bg: string;
  text: string;
  hoverBg: string;
  hoverText: string;
  hoverBorder: string;
  shadow: string;
}

export interface ElementsConfig {
  button: ElementStyle;
  input: ElementStyle;
  container: ElementStyle;
  modal: ElementStyle;
  toast: ElementStyle;
  icon: {
    color: string;
    hoverColor: string;
  };
}

export interface SystemConfig {
  appName: string;
  logoUrl?: string; // URL do logo da empresa
  webhookUrl?: string; // n8n
  whatsappApiKey?: string;
  whatsappInstance?: string;
  registrationRoles?: Role[]; // Perfis habilitados para cadastro público
  theme: ColorScheme;
  effects: EffectsConfig;
  elements: ElementsConfig;
}