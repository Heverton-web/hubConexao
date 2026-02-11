
export type Role = 'client' | 'distributor' | 'consultant' | 'super_admin';
export type Language = 'pt-br' | 'en-us' | 'es-es';
export type MaterialType = 'image' | 'pdf' | 'video';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'rejected';

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
}

export interface MaterialAsset {
  url: string;
  subtitleUrl?: string;
}

export interface Material {
  id: string;
  title: Partial<Record<Language, string>>;
  type: MaterialType;
  allowedRoles: Role[];
  assets: Partial<Record<Language, MaterialAsset>>;
  active: boolean;
  createdAt: string;
}

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
