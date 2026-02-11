import { Material, UserProfile, Role, SystemConfig, UserStatus } from '../types';

// Mock System Config
let systemConfig: SystemConfig = {
  appName: 'MaterialShare Pro',
  webhookUrl: '', // Default empty
  themeLight: {
    background: '#f8fafc', // slate-50
    surface: '#ffffff',    // white
    textMain: '#0f172a',   // slate-900
    textMuted: '#64748b',  // slate-500
    border: '#e2e8f0',     // slate-200
    accent: '#3b82f6',     // blue-500
    success: '#22c55e',    // green-500
    warning: '#eab308',    // yellow-500
    error: '#ef4444'       // red-500
  },
  themeDark: {
    background: '#0b1120', // slate-950
    surface: '#1e293b',    // slate-800
    textMain: '#f8fafc',   // slate-50
    textMuted: '#94a3b8',  // slate-400
    border: '#334155',     // slate-700
    accent: '#60a5fa',     // blue-400
    success: '#4ade80',    // green-400 (Mais brilhante para dark)
    warning: '#facc15',    // yellow-400
    error: '#f87171'       // red-400
  }
};

// Mock Users (One for each role)
let users: UserProfile[] = [
  {
    id: '1',
    name: 'Super Admin User',
    email: 'admin@demo.com',
    role: 'super_admin',
    whatsapp: '5511999999999',
    status: 'active',
    preferences: { theme: 'dark', language: 'pt-br' }
  },
  {
    id: '2',
    name: 'Dr. Cliente Final',
    email: 'client@demo.com',
    role: 'client',
    whatsapp: '5511888888888',
    cro: '12345/SP',
    status: 'active',
    preferences: { theme: 'light', language: 'pt-br' }
  },
  {
    id: '3',
    name: 'Distribuidor Global',
    email: 'distributor@demo.com',
    role: 'distributor',
    whatsapp: '5511777777777',
    status: 'pending', // Pending approval
    preferences: { theme: 'light', language: 'es-es' }
  },
  {
    id: '4',
    name: 'Consultor de Vendas',
    email: 'consultant@demo.com',
    role: 'consultant',
    whatsapp: '5511666666666',
    status: 'inactive',
    preferences: { theme: 'dark', language: 'en-us' }
  }
];

// Mock Materials (Comprehensive list)
let materials: Material[] = [
  // --- TEST MATERIAL (GOOGLE DRIVE) ---
  {
    id: 'test-drive-video',
    title: {
      'pt-br': 'TESTE: Vídeo Google Drive',
      'en-us': 'TEST: Google Drive Video',
      'es-es': 'PRUEBA: Video Google Drive'
    },
    type: 'video',
    allowedRoles: ['client', 'distributor', 'consultant', 'super_admin'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: 'https://drive.google.com/file/d/1PKZQcvke0GVqTu2m8y1HepIa2G-cZqfv/view?usp=sharing' },
      'en-us': { url: 'https://drive.google.com/file/d/1PKZQcvke0GVqTu2m8y1HepIa2G-cZqfv/view?usp=sharing' },
      'es-es': { url: 'https://drive.google.com/file/d/1PKZQcvke0GVqTu2m8y1HepIa2G-cZqfv/view?usp=sharing' }
    }
  },

  // --- UNIVERSAL MATERIALS (All Roles) ---
  {
    id: 'm1',
    title: {
      'pt-br': 'Vídeo Institucional 2024',
      'en-us': 'Corporate Video 2024',
      'es-es': 'Video Corporativo 2024'
    },
    type: 'video',
    allowedRoles: ['client', 'distributor', 'consultant'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      'en-us': { url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      'es-es': { url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    }
  },
  {
    id: 'm2',
    title: {
      'pt-br': 'Manual de Garantia e Uso',
      'en-us': 'Warranty and Usage Manual',
      'es-es': 'Manual de Garantía'
    },
    type: 'pdf',
    allowedRoles: ['client', 'distributor', 'consultant'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      'en-us': { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      // Missing ES-ES intentional
    }
  },

  // --- CLIENT FOCUSED ---
  {
    id: 'm3',
    title: {
      'pt-br': 'Catálogo de Produtos - Linha Premium',
      'en-us': 'Product Catalog - Premium Line',
      'es-es': 'Catálogo de Productos - Línea Premium'
    },
    type: 'pdf',
    allowedRoles: ['client', 'consultant'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: '#' },
      'en-us': { url: '#' },
      'es-es': { url: '#' }
    }
  },
  {
    id: 'm4',
    title: {
      'pt-br': 'Lançamento Verão - Banner Promocional',
      'en-us': 'Summer Launch - Promo Banner',
      'es-es': 'Lanzamiento Verano - Banner'
    },
    type: 'image',
    allowedRoles: ['client'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: 'https://via.placeholder.com/800x600/0ea5e9/ffffff?text=Verao+BR' },
      'en-us': { url: 'https://via.placeholder.com/800x600/0ea5e9/ffffff?text=Summer+US' }
    }
  },

  // --- DISTRIBUTOR FOCUSED ---
  {
    id: 'm5',
    title: {
      'pt-br': 'Tabela de Preços Atacado (Sigiloso)',
      'en-us': 'Wholesale Price List (Confidential)',
      'es-es': 'Lista de Precios Mayorista'
    },
    type: 'pdf',
    allowedRoles: ['distributor'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: '#' },
      'en-us': { url: '#' },
      'es-es': { url: '#' }
    }
  },
  {
    id: 'm6',
    title: {
      'pt-br': 'Kit de Marketing para Redes Sociais',
      'en-us': 'Social Media Marketing Kit',
      'es-es': 'Kit de Marketing Redes Sociales'
    },
    type: 'image',
    allowedRoles: ['distributor', 'consultant'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: 'https://via.placeholder.com/1080x1080/6366f1/ffffff?text=Post+Instagram' },
      'es-es': { url: 'https://via.placeholder.com/1080x1080/6366f1/ffffff?text=Post+Instagram+ES' }
    }
  },

  // --- CONSULTANT FOCUSED ---
  {
    id: 'm7',
    title: {
      'pt-br': 'Treinamento: Técnicas de Vendas Avançadas',
      'en-us': 'Training: Advanced Sales Techniques',
      'es-es': 'Entrenamiento: Ventas Avanzadas'
    },
    type: 'video',
    allowedRoles: ['consultant'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
      // Only PT-BR available
    }
  },
  {
    id: 'm8',
    title: {
      'pt-br': 'Script de Abordagem ao Cliente',
      'en-us': 'Customer Approach Script',
      'es-es': 'Guión de Aproximación al Cliente'
    },
    type: 'pdf',
    allowedRoles: ['consultant', 'distributor'],
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: '#' },
      'en-us': { url: '#' },
      'es-es': { url: '#' }
    }
  },

  // --- ADMIN / INACTIVE ---
  {
    id: 'm9',
    title: {
      'pt-br': 'Campanha Natal 2025 (Rascunho)',
      'en-us': 'Christmas Campaign 2025 (Draft)',
      'es-es': 'Campaña Navidad 2025 (Borrador)'
    },
    type: 'image',
    allowedRoles: ['client', 'distributor'],
    active: false, // Inactive
    createdAt: new Date().toISOString(),
    assets: {
      'pt-br': { url: 'https://via.placeholder.com/800x400/ef4444/ffffff?text=Draft' }
    }
  },
  {
    id: 'm10',
    title: {
      'pt-br': 'Relatório Financeiro Interno',
      'en-us': 'Internal Financial Report',
      'es-es': 'Informe Financiero Interno'
    },
    type: 'pdf',
    allowedRoles: ['super_admin'], // Only Admin sees this in filtering logic naturally, but explicitly setting roles
    active: true,
    createdAt: new Date().toISOString(),
    assets: {
      'en-us': { url: '#' }
    }
  }
];

// Simulation Methods
export const mockDb = {
  getSystemConfig: async () => {
    return new Promise<SystemConfig>((resolve) => {
      setTimeout(() => resolve({ ...systemConfig }), 200);
    });
  },

  updateSystemConfig: async (config: SystemConfig) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        systemConfig = config;
        resolve();
      }, 500);
    });
  },

  login: async (email: string) => {
    return new Promise<UserProfile | null>((resolve) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email);
        resolve(user || null);
      }, 500);
    });
  },

  register: async (data: Omit<UserProfile, 'id' | 'preferences' | 'status'>) => {
    return new Promise<UserProfile>((resolve) => {
      setTimeout(() => {
        const newUser: UserProfile = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending', // Default to pending
          preferences: { theme: 'light', language: 'pt-br' }
        };
        users.push(newUser);
        resolve(newUser);
      }, 500);
    });
  },

  // Users Management
  getUsers: async () => {
    return new Promise<UserProfile[]>((resolve) => {
      setTimeout(() => resolve([...users]), 300);
    });
  },

  updateUserStatus: async (userId: string, status: UserStatus) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
          users[index].status = status;
        }
        resolve();
      }, 300);
    });
  },

  updateUser: async (updatedUser: UserProfile) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const index = users.findIndex(u => u.id === updatedUser.id);
            if(index !== -1) {
                users[index] = updatedUser;
            }
            resolve();
        }, 300);
    });
  },

  deleteUser: async (userId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        users = users.filter(u => u.id !== userId);
        resolve();
      }, 300);
    });
  },

  getMaterials: async (role: Role) => {
    return new Promise<Material[]>((resolve) => {
      setTimeout(() => {
        if (role === 'super_admin') {
          // Admin sees everything
          resolve(materials);
        } else {
          // Users see only allowed AND active materials
          resolve(materials.filter(m => m.active && m.allowedRoles.includes(role)));
        }
      }, 300);
    });
  },

  // Admin only
  createMaterial: async (material: Omit<Material, 'id' | 'createdAt'>) => {
    return new Promise<Material>((resolve) => {
      setTimeout(() => {
        const newMaterial: Material = {
          ...material,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        materials.unshift(newMaterial); // Add to top
        resolve(newMaterial);
      }, 400);
    });
  },

  updateMaterial: async (material: Material) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const index = materials.findIndex(m => m.id === material.id);
        if (index !== -1) {
          materials[index] = material;
        }
        resolve();
      }, 300);
    });
  },

  deleteMaterial: async (id: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        materials = materials.filter(m => m.id !== id);
        resolve();
      }, 300);
    });
  }
};