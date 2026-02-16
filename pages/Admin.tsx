import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { mockDb } from '../lib/mockDb';
import { Material, Language, ColorScheme, UserProfile, Role, UserStatus, MaterialType, AccessLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { Plus, Trash2, Edit, Eye, EyeOff, Settings, Palette, Type, Image as ImageIcon, Save, Monitor, Moon, Sun, Users, Share2, CheckCircle, XCircle, Ban, MessageCircle, Copy, Link as LinkIcon, Webhook, ChevronRight, Search, Filter, FileText, Video, ExternalLink, AlertCircle, Check, X, BarChart2, TrendingUp, Calendar, Clock, Trophy } from 'lucide-react';
import { MaterialFormModal } from '../components/MaterialFormModal';
import { ViewerModal } from '../components/ViewerModal';
import { UserCommunicationModal } from '../components/UserCommunicationModal';
import { UserEditModal } from '../components/UserEditModal';
import { ConfirmModal } from '../components/ConfirmModal';

// --- External Helper Components (Defined outside Admin to prevent remounting/focus loss) ---

const ColorInput = ({ label, value, onChange, hint }: { label: string, value: string, onChange: (val: string) => void, hint: string }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase text-muted tracking-wide">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative">
        <input 
          type="color" 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-9 w-9 rounded cursor-pointer border-0 p-0 shadow-sm overflow-hidden"
        />
      </div>
      <input 
        type="text" 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm text-main font-mono uppercase focus:ring-2 focus:ring-accent outline-none"
      />
    </div>
    <p className="text-[10px] text-muted">{hint}</p>
  </div>
);

const ThemeEditorSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="space-y-3 mb-6">
      <h4 className="text-xs font-bold uppercase text-muted tracking-wider pb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
          {children}
      </div>
  </div>
);

const LivePreview = ({ themeName, scheme }: { themeName: string, scheme: ColorScheme }) => (
  <div 
    className="rounded-xl overflow-hidden shadow-lg relative transition-all duration-300"
    style={{ backgroundColor: scheme.background }}
  >
    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/20 text-white text-[10px] font-bold uppercase backdrop-blur-sm z-10">
      Preview {themeName}
    </div>
    
    {/* Fake Header */}
    <div className="p-3 flex items-center justify-between shadow-sm" style={{ backgroundColor: scheme.surface }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: scheme.accent }}>A</div>
        <div className="h-2 w-16 rounded opacity-80" style={{ backgroundColor: scheme.textMain }}></div>
      </div>
    </div>

    {/* Fake Content */}
    <div className="p-4 space-y-3">
       <div className="flex gap-2 mb-2">
           <div className="h-4 px-2 rounded-full text-[10px] flex items-center font-bold" style={{ color: scheme.success, backgroundColor: scheme.success + '20' }}>Ativo</div>
           <div className="h-4 px-2 rounded-full text-[10px] flex items-center font-bold" style={{ color: scheme.warning, backgroundColor: scheme.warning + '20' }}>Pendente</div>
       </div>

       {/* Fake Card */}
       <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: scheme.surface }}>
         <div className="flex gap-3 mb-2">
           <div className="w-8 h-8 rounded opacity-10" style={{ backgroundColor: scheme.textMain }}></div>
           <div className="flex-1 space-y-1">
             <div className="h-2 w-3/4 rounded opacity-80" style={{ backgroundColor: scheme.textMain }}></div>
             <div className="h-2 w-1/2 rounded opacity-50" style={{ backgroundColor: scheme.textMuted }}></div>
           </div>
         </div>
         <div className="flex gap-2 mt-3 justify-end">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ color: scheme.error }}><X size={12} /></div>
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ color: scheme.success }}><Check size={12} /></div>
         </div>
       </div>
    </div>
  </div>
);

// --- Analytics Modal ---

const AnalyticsDetailModal = ({ material, logs, onClose, lang }: { material: Material, logs: AccessLog[], onClose: () => void, lang: Language }) => {
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="px-6 py-4 flex justify-between items-center bg-surface shadow-sm z-10">
                    <div>
                        <h3 className="font-bold text-lg text-main">Histórico de Acesso</h3>
                        <p className="text-xs text-muted max-w-md truncate">{material.title[lang] || material.title['pt-br']}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center text-muted">
                            <Clock size={32} className="mx-auto mb-2 opacity-50" />
                            Nenhum acesso registrado.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-page text-xs uppercase text-muted font-semibold sticky top-0">
                                <tr>
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4">Perfil</th>
                                    <th className="p-4">Idioma</th>
                                    <th className="p-4 text-right">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-page transition-colors text-main">
                                        <td className="p-4 font-medium">{log.userName}</td>
                                        <td className="p-4">
                                            <span className="text-[10px] uppercase font-bold bg-page px-2 py-1 rounded text-muted">
                                                {log.userRole}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[10px] uppercase font-bold bg-accent/10 text-accent px-2 py-1 rounded">
                                                {log.language}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-muted tabular-nums">
                                            {new Date(log.timestamp).toLocaleString(lang)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Main Admin Component ---

export const Admin: React.FC = () => {
  const { t, language } = useLanguage();
  const { config, updateConfig } = useBrand();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'materials' | 'users' | 'settings' | 'analytics'>('materials');
  // Settings Sub-tab State
  const [settingsTab, setSettingsTab] = useState<'identity' | 'integrations' | 'themes' | 'invites'>('identity');

  // Materials State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language } | null>(null);
  
  // Material Filters
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState<MaterialType | 'all'>('all');
  const [materialStatusFilter, setMaterialStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userComm, setUserComm] = useState<UserProfile | null>(null);
  const [userEditing, setUserEditing] = useState<UserProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // User Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<Role | 'all'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatus | 'all'>('all');

  // Analytics State
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [analyticsDetail, setAnalyticsDetail] = useState<{ material: Material, logs: AccessLog[] } | null>(null);
  
  // Analytics Filters
  const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState<MaterialType | 'all'>('all');
  const [analyticsRoleFilter, setAnalyticsRoleFilter] = useState<Role | 'all'>('all');


  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'material' | 'user', id: string } | null>(null);

  // Settings State
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    if (activeTab === 'materials') loadMaterials();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'analytics') loadAnalytics();
  }, [activeTab]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const loadMaterials = () => {
    mockDb.getMaterials('super_admin').then(setMaterials);
  };

  const loadUsers = () => {
    mockDb.getUsers().then(setUsers);
  };

  const loadAnalytics = async () => {
      const logs = await mockDb.getAccessLogs();
      const mats = await mockDb.getMaterials('super_admin');
      setAccessLogs(logs);
      setMaterials(mats);
  };

  // --- Material Handlers ---
  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleSaveMaterial = async (materialData: any) => {
    try {
        if (materialData.id) {
            await mockDb.updateMaterial(materialData);
        } else {
            await mockDb.createMaterial(materialData);
        }
        loadMaterials();
    } catch (e: any) {
        alert("Erro ao salvar material: " + (e.message || e.details || JSON.stringify(e)));
    }
  };

  const handleToggleActive = async (material: Material) => {
    try {
        await mockDb.updateMaterial({ ...material, active: !material.active });
        loadMaterials();
    } catch (e: any) {
        alert("Erro ao atualizar status: " + e.message);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
        if (itemToDelete.type === 'material') {
            await mockDb.deleteMaterial(itemToDelete.id);
            loadMaterials();
        } else {
            await mockDb.deleteUser(itemToDelete.id);
            loadUsers();
        }
    } catch (e: any) {
        alert("Erro ao excluir: " + e.message);
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteMaterial = (id: string) => {
    setItemToDelete({ type: 'material', id });
    setIsConfirmOpen(true);
  };

  const handleView = (material: Material) => {
    const langs: Language[] = ['pt-br', 'en-us', 'es-es'];
    const availableLang = langs.find(l => material.assets[l]?.url);
    if (availableLang) {
      setViewingMaterial({ mat: material, lang: availableLang });
    } else {
      alert(t('no.materials'));
    }
  };

  // Material Filtering Logic
  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      const displayTitle = (mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '').toLowerCase();
      const matchesSearch = displayTitle.includes(materialSearch.toLowerCase());
      const matchesType = materialTypeFilter === 'all' || mat.type === materialTypeFilter;
      const matchesStatus = materialStatusFilter === 'all' 
        ? true 
        : materialStatusFilter === 'active' ? mat.active 
        : !mat.active;

      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
        // Default sort by title A-Z
        const titleA = (a.title[language] || a.title['pt-br'] || '').toLowerCase();
        const titleB = (b.title[language] || b.title['pt-br'] || '').toLowerCase();
        return titleA.localeCompare(titleB);
    });
  }, [materials, materialSearch, materialTypeFilter, materialStatusFilter, language]);

  // --- User Handlers ---
  const handleUserStatus = async (userId: string, status: UserStatus) => {
    try {
        await mockDb.updateUserStatus(userId, status);
        loadUsers();
    } catch (e: any) {
        alert("Erro ao atualizar status do usuário: " + e.message);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setItemToDelete({ type: 'user', id: userId });
    setIsConfirmOpen(true);
  };
  
  const handleSaveUser = async (updatedUser: UserProfile) => {
    try {
        await mockDb.updateUser(updatedUser);
        loadUsers();
    } catch (e: any) {
        alert("Erro ao atualizar usuário: " + e.message);
    }
  };

  const handleCopyLink = (url: string, role: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(role);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // User Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
        if (user.role === 'super_admin') return false; // Hide super admin
        
        const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                              user.email.toLowerCase().includes(userSearch.toLowerCase());
        const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
        const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // --- Analytics Logic ---

  // 1. First, filter the raw logs based on selected UI filters
  const filteredLogs = useMemo(() => {
      return accessLogs.filter(log => {
          // Check Role Filter
          if (analyticsRoleFilter !== 'all' && log.userRole !== analyticsRoleFilter) return false;
          
          // Check Type Filter (requires finding the material)
          if (analyticsTypeFilter !== 'all') {
              const mat = materials.find(m => m.id === log.materialId);
              if (mat?.type !== analyticsTypeFilter) return false;
          }
          
          return true;
      });
  }, [accessLogs, analyticsRoleFilter, analyticsTypeFilter, materials]);

  // 2. Compute Aggregated Metrics (for Table and KPI) based on FILTERED logs
  const aggregatedMetrics = useMemo(() => {
    const map = new Map<string, { views: number, uniqueUsers: Set<string>, lastAccess: string | null }>();
    
    // Init all materials with 0 (only if they match type filter, otherwise don't show in table)
    materials.forEach(m => {
        if (analyticsTypeFilter === 'all' || m.type === analyticsTypeFilter) {
            map.set(m.id, { views: 0, uniqueUsers: new Set(), lastAccess: null });
        }
    });

    filteredLogs.forEach(log => {
        const stats = map.get(log.materialId);
        if (stats) {
            stats.views++;
            stats.uniqueUsers.add(log.userId);
            if (!stats.lastAccess || new Date(log.timestamp) > new Date(stats.lastAccess)) {
                stats.lastAccess = log.timestamp;
            }
        }
    });

    return Array.from(map.entries()).map(([id, stats]) => {
        const mat = materials.find(m => m.id === id);
        return {
            id,
            material: mat,
            views: stats.views,
            uniqueUsers: stats.uniqueUsers.size,
            lastAccess: stats.lastAccess
        };
    })
    .filter(item => item.material) // Safety check
    .sort((a, b) => b.views - a.views); // Sort by popularity
  }, [filteredLogs, materials, analyticsTypeFilter]);

  // 3. Compute Ranking: Top 5 Users (based on FILTERED logs)
  const activeUsersRanking = useMemo(() => {
      const userCounts: Record<string, { name: string, role: Role, count: number }> = {};
      
      filteredLogs.forEach(log => {
         if (!userCounts[log.userId]) {
             userCounts[log.userId] = { name: log.userName, role: log.userRole, count: 0 };
         }
         userCounts[log.userId].count++;
      });

      return Object.values(userCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
  }, [filteredLogs]);

  const openAnalyticsDetail = (materialId: string) => {
      const mat = materials.find(m => m.id === materialId);
      // Detail modal shows specific logs for that material, but we should respect global filters too?
      // Usually, drill-down shows everything for that context, but let's apply the current role filter if active.
      const logs = filteredLogs.filter(l => l.materialId === materialId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (mat) {
          setAnalyticsDetail({ material: mat, logs });
      }
  };

  // --- Settings Handlers ---
  const handleSaveSettings = async () => {
    try {
        await updateConfig(localConfig);
        alert('Configurações salvas e aplicadas!');
    } catch (e: any) {
        alert("Erro ao salvar configurações: " + e.message);
    }
  };

  // Render Helpers (Functions instead of components to avoid unmount on re-render)
  
  const renderTabButton = (id: typeof activeTab, label: string, Icon: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-main'}`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const renderSettingsSidebarItem = (id: typeof settingsTab, label: string, Icon: any) => (
    <button
      onClick={() => setSettingsTab(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1
        ${settingsTab === id 
          ? 'bg-accent text-white shadow-lg shadow-accent/20' 
          : 'text-muted hover:bg-page hover:text-main'}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </div>
      {settingsTab === id && <ChevronRight size={16} className="opacity-75" />}
    </button>
  );

  return (
    <div className="space-y-6">
      
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-main">{t('admin.title')}</h2>
          <p className="text-sm text-muted">Gerencie materiais, usuários e a aparência da plataforma.</p>
        </div>
        
        <div className="flex bg-page rounded-lg p-1">
          {renderTabButton('materials', t('tab.materials'), ImageIcon)}
          {renderTabButton('users', t('tab.users'), Users)}
          {renderTabButton('analytics', t('tab.analytics'), BarChart2)}
          {renderTabButton('settings', t('tab.settings'), Settings)}
        </div>
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="animate-fade-in">
          
          {/* Filters Toolbar */}
          <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6">
             <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-2.5 text-muted" size={18} />
               <input 
                 type="text" 
                 placeholder={t('search.placeholder')} 
                 className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2 focus:ring-accent text-main"
                 value={materialSearch}
                 onChange={e => setMaterialSearch(e.target.value)}
               />
             </div>
             <div className="flex w-full md:w-auto gap-3">
               <select 
                 className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                 value={materialTypeFilter}
                 onChange={e => setMaterialTypeFilter(e.target.value as any)}
               >
                 <option value="all">{t('filter.all')}</option>
                 <option value="pdf">{t('material.type.pdf')}</option>
                 <option value="image">{t('material.type.image')}</option>
                 <option value="video">{t('material.type.video')}</option>
               </select>
               <select 
                 className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                 value={materialStatusFilter}
                 onChange={e => setMaterialStatusFilter(e.target.value as any)}
               >
                 <option value="all">{t('user.filter.status.all')}</option>
                 <option value="active">{t('active')}</option>
                 <option value="inactive">{t('inactive')}</option>
               </select>
            </div>
             <button 
              onClick={handleOpenCreate}
              className="bg-accent hover:bg-opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-accent/20 transition-all hover:scale-105 whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="hidden md:inline">{t('add.material')}</span>
            </button>
          </div>

          <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {/* Removed divide-y and border from table for clean look */}
              <table className="w-full text-left">
                <thead className="bg-page text-xs uppercase text-muted font-semibold">
                  <tr>
                    <th className="p-4">{t('title')}</th>
                    <th className="p-4">{t('type')}</th>
                    <th className="p-4 text-center">{t('status')}</th>
                    <th className="p-4">{t('permissions')}</th>
                    <th className="p-4">Assets</th>
                    <th className="p-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredMaterials.map(mat => {
                    const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                    return (
                      <tr key={mat.id} className="hover:bg-page transition-colors text-main">
                        <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                        <td className="p-4 capitalize opacity-75">{mat.type}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            mat.active 
                              ? 'bg-success/10 text-success' 
                              : 'bg-page text-muted'
                          }`}>
                            {mat.active ? t('active') : t('inactive')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex -space-x-1">
                            {mat.allowedRoles.map(r => (
                              <div key={r} className="w-6 h-6 rounded-full bg-page flex items-center justify-center text-[10px] uppercase text-muted font-bold shadow-sm" title={t(`role.${r}`)}>
                                {r[0]}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {Object.keys(mat.assets).map(lang => (
                              <span key={lang} className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded uppercase font-semibold">
                                {lang.split('-')[0]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleView(mat)} className="p-2 text-muted hover:text-accent rounded-lg"><Eye size={18} /></button>
                            <button onClick={() => handleToggleActive(mat)} className={`p-2 rounded-lg ${mat.active ? 'text-muted hover:text-error' : 'text-muted hover:text-success'}`}>{mat.active ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                            <button onClick={() => handleOpenEdit(mat)} className="p-2 text-accent hover:bg-accent/10 rounded-lg"><Edit size={18} /></button>
                            <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 text-error hover:bg-error/10 rounded-lg"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMaterials.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-muted">Nenhum material encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-muted font-bold uppercase text-xs mr-auto">
                    <Filter size={16} /> Filtros de Métricas
                </div>
                <select 
                    className="w-full md:w-auto p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main focus:ring-2 focus:ring-accent"
                    value={analyticsTypeFilter}
                    onChange={e => setAnalyticsTypeFilter(e.target.value as any)}
                >
                    <option value="all">{t('filter.all')}</option>
                    <option value="pdf">{t('material.type.pdf')}</option>
                    <option value="image">{t('material.type.image')}</option>
                    <option value="video">{t('material.type.video')}</option>
                </select>
                <select 
                    className="w-full md:w-auto p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main focus:ring-2 focus:ring-accent"
                    value={analyticsRoleFilter}
                    onChange={e => setAnalyticsRoleFilter(e.target.value as any)}
                >
                    <option value="all">{t('user.filter.all')}</option>
                    <option value="client">{t('role.client')}</option>
                    <option value="distributor">{t('role.distributor')}</option>
                    <option value="consultant">{t('role.consultant')}</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Eye size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">{t('analytics.total.views')}</p>
                        <p className="text-2xl font-bold text-main">{filteredLogs.length}</p>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">{t('analytics.unique.users')}</p>
                        <p className="text-2xl font-bold text-main">{new Set(filteredLogs.map(l => l.userId)).size}</p>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">{t('analytics.top.material')}</p>
                        <p className="text-lg font-bold text-main truncate max-w-[200px]" title={aggregatedMetrics[0]?.material?.title[language] || 'N/A'}>
                            {aggregatedMetrics[0]?.material ? (aggregatedMetrics[0].material.title[language] || aggregatedMetrics[0].material.title['pt-br']) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* RANKINGS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Top 5 Materials */}
                <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-page/30 flex justify-between items-center">
                         <h3 className="font-bold text-main flex items-center gap-2">
                             <Trophy size={18} className="text-yellow-500" />
                             {t('analytics.rank.materials')}
                         </h3>
                    </div>
                    <div className="p-4 space-y-3">
                         {aggregatedMetrics.slice(0, 5).map((item, index) => {
                             const mat = item.material;
                             if(!mat) return null;
                             const title = mat.title[language] || mat.title['pt-br'];
                             const percentage = Math.round((item.views / filteredLogs.length) * 100) || 0;

                             return (
                                 <div key={item.id} className="relative">
                                     <div className="flex justify-between text-sm mb-1">
                                         <span className="font-medium text-main truncate pr-2 flex items-center gap-2">
                                             <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold 
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                                  index === 1 ? 'bg-gray-100 text-gray-700' : 
                                                  index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-page text-muted'}`}>
                                                 {index + 1}
                                             </span>
                                             {title}
                                         </span>
                                         <span className="font-bold text-accent">{item.views}</span>
                                     </div>
                                     <div className="w-full bg-page rounded-full h-1.5 overflow-hidden">
                                         <div className="bg-accent h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                     </div>
                                 </div>
                             )
                         })}
                         {aggregatedMetrics.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
                    </div>
                </div>

                {/* Top 5 Active Users */}
                <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                     <div className="px-6 py-4 bg-page/30 flex justify-between items-center">
                         <h3 className="font-bold text-main flex items-center gap-2">
                             <Users size={18} className="text-blue-500" />
                             {t('analytics.rank.users')}
                         </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {activeUsersRanking.map((user, index) => (
                             <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-page transition-colors">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                                         {user.name.charAt(0)}
                                     </div>
                                     <div>
                                         <p className="text-sm font-medium text-main">{user.name}</p>
                                         <p className="text-[10px] uppercase text-muted font-bold">{t(`role.${user.role}`)}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-sm font-bold text-main">{user.count}</p>
                                     <p className="text-[10px] text-muted">acessos</p>
                                 </div>
                             </div>
                        ))}
                        {activeUsersRanking.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
                    </div>
                </div>
            </div>

            {/* Metrics Table */}
             <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4">
                    <h3 className="font-bold text-main">Desempenho Geral</h3>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-page text-xs uppercase text-muted font-semibold">
                    <tr>
                        <th className="p-4">{t('title')}</th>
                        <th className="p-4">{t('type')}</th>
                        <th className="p-4 text-center">{t('analytics.col.views')}</th>
                        <th className="p-4 text-center">{t('analytics.col.users')}</th>
                        <th className="p-4 text-right">{t('analytics.col.last_access')}</th>
                        <th className="p-4 text-right">Detalhes</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    {aggregatedMetrics.map(item => {
                        const mat = item.material;
                        if (!mat) return null;
                        const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                        
                        return (
                        <tr key={item.id} className="hover:bg-page transition-colors text-main">
                            <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                            <td className="p-4 capitalize opacity-75">{mat.type}</td>
                            <td className="p-4 text-center font-bold">{item.views}</td>
                            <td className="p-4 text-center">{item.uniqueUsers}</td>
                            <td className="p-4 text-right text-muted tabular-nums">
                                {item.lastAccess ? new Date(item.lastAccess).toLocaleDateString(language) : '-'}
                            </td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => openAnalyticsDetail(item.id)}
                                    className="p-2 bg-page hover:bg-accent/10 text-muted hover:text-accent rounded-lg transition-colors"
                                >
                                    <BarChart2 size={16} />
                                </button>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="animate-fade-in space-y-6">
          
          {/* Filters Toolbar */}
          <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-2.5 text-muted" size={18} />
               <input 
                 type="text" 
                 placeholder="Buscar por nome ou email..." 
                 className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2 focus:ring-accent text-main"
                 value={userSearch}
                 onChange={e => setUserSearch(e.target.value)}
               />
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <select 
                 className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                 value={userRoleFilter}
                 onChange={e => setUserRoleFilter(e.target.value as any)}
               >
                 <option value="all">{t('user.filter.all')}</option>
                 <option value="client">{t('role.client')}</option>
                 <option value="distributor">{t('role.distributor')}</option>
                 <option value="consultant">{t('role.consultant')}</option>
               </select>
               <select 
                 className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                 value={userStatusFilter}
                 onChange={e => setUserStatusFilter(e.target.value as any)}
               >
                 <option value="all">{t('user.filter.status.all')}</option>
                 <option value="pending">{t('user.status.pending')}</option>
                 <option value="active">{t('user.status.active')}</option>
                 <option value="inactive">{t('user.status.inactive')}</option>
                 <option value="rejected">{t('user.status.rejected')}</option>
               </select>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-page text-xs uppercase text-muted font-semibold">
                  <tr>
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Contatos</th>
                    <th className="p-4">Perfil</th>
                    <th className="p-4">{t('permissions')}</th>
                    <th className="p-4 text-center">{t('status')}</th>
                    <th className="p-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-page transition-colors text-main">
                      <td className="p-4">
                        <div className="font-bold text-main">{user.name}</div>
                        <div className="text-xs text-muted">{user.cro ? `CRO: ${user.cro}` : 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1"><span className="text-muted">E:</span> {user.email}</div>
                          <div className="flex items-center gap-1"><span className="text-muted">W:</span> {user.whatsapp}</div>
                        </div>
                      </td>
                      <td className="p-4">
                         <span className="text-xs font-bold uppercase tracking-wide bg-page px-2 py-1 rounded text-muted">
                           {t(`role.${user.role}`)}
                         </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {(!user.allowedTypes || user.allowedTypes.length === 0) ? (
                            <span className="text-[10px] uppercase font-bold bg-page px-2 py-1 rounded text-muted">Todos</span>
                          ) : (
                            user.allowedTypes.map(type => (
                              <div key={type} className="p-1 rounded bg-page text-muted" title={t(`material.type.${type}`)}>
                                {type === 'pdf' && <FileText size={14} />}
                                {type === 'image' && <ImageIcon size={14} />}
                                {type === 'video' && <Video size={14} />}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            user.status === 'active' ? 'bg-success/10 text-success' :
                            user.status === 'pending' ? 'bg-warning/10 text-warning' :
                            user.status === 'rejected' ? 'bg-error/10 text-error' :
                            'bg-page text-muted'
                          }`}>
                            {t(`user.status.${user.status}`)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 items-center">
                          {/* Message Button */}
                          <button 
                            onClick={() => setUserComm(user)}
                            className="p-2 text-accent hover:bg-accent/10 rounded-lg border border-transparent" 
                            title={t('comm.title')}
                          >
                            <MessageCircle size={18} />
                          </button>

                          {/* Quick Actions for Pending */}
                          {user.status === 'pending' && (
                            <>
                              <button onClick={() => handleUserStatus(user.id, 'active')} className="p-2 text-success hover:bg-success/10 rounded-lg" title={t('user.action.approve')}><CheckCircle size={18} /></button>
                              <button onClick={() => handleUserStatus(user.id, 'rejected')} className="p-2 text-error hover:bg-error/10 rounded-lg" title={t('user.action.reject')}><XCircle size={18} /></button>
                            </>
                          )}
                          
                          {/* Edit User (Full Control) */}
                          <button onClick={() => setUserEditing(user)} className="p-2 text-accent hover:bg-accent/10 rounded-lg ml-1" title={t('edit')}>
                            <Edit size={18} />
                          </button>

                          {/* Delete */}
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-error hover:bg-error/10 rounded-lg ml-1" title={t('delete')}><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-muted">Nenhum usuário encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab (Updated with Sidebar) */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in pb-12">
           <div className="flex flex-col md:flex-row gap-8">
              
              {/* Sidebar Menu */}
              <aside className="w-full md:w-64 shrink-0">
                 <div className="bg-surface rounded-xl p-2 shadow-sm sticky top-4">
                    <p className="px-4 py-2 text-xs font-bold uppercase text-muted tracking-wider mb-2">Opções</p>
                    {renderSettingsSidebarItem('identity', 'Identidade Visual', Type)}
                    {renderSettingsSidebarItem('integrations', 'Integrações', Webhook)}
                    {renderSettingsSidebarItem('themes', 'Temas', Palette)}
                    {renderSettingsSidebarItem('invites', t('user.invite'), Share2)}
                 </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0 space-y-6">
                 
                 {/* Content Header & Actions */}
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="text-xl font-bold text-main flex items-center gap-2">
                     {settingsTab === 'identity' && <><Type size={24} className="text-accent" /> Identidade Visual</>}
                     {settingsTab === 'integrations' && <><Webhook size={24} className="text-purple-500" /> Integrações</>}
                     {settingsTab === 'themes' && <><Palette size={24} className="text-orange-500" /> Personalização de Temas</>}
                     {settingsTab === 'invites' && <><Share2 size={24} className="text-green-500" /> {t('user.invite')}</>}
                   </h3>
                   {settingsTab !== 'invites' && (
                     <button onClick={handleSaveSettings} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-opacity flex items-center gap-2">
                        <Save size={18} /> Salvar Alterações
                     </button>
                   )}
                 </div>

                 {/* Identity Section */}
                 {settingsTab === 'identity' && (
                    <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-main">Nome da Aplicação</label>
                          <input 
                            type="text" 
                            value={localConfig.appName}
                            onChange={e => setLocalConfig({...localConfig, appName: e.target.value})}
                            className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-black/20 text-main focus:ring-2 focus:ring-accent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-main">URL do Logo</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={localConfig.logoUrl || ''}
                              onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})}
                              className="flex-1 p-2.5 rounded-lg bg-gray-50 dark:bg-black/20 text-main focus:ring-2 focus:ring-accent outline-none"
                            />
                            <div className="w-10 h-10 bg-page rounded-lg flex items-center justify-center shrink-0">
                              {localConfig.logoUrl ? <img src={localConfig.logoUrl} className="w-6 h-6 object-contain" /> : <ImageIcon size={16} className="text-muted" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                 )}

                 {/* Webhook Configuration */}
                 {settingsTab === 'integrations' && (
                    <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                      <div>
                          <label className="block text-sm font-medium mb-1 text-main">URL do Webhook (N8N)</label>
                          <div className="flex gap-2">
                            <div className="p-3 bg-page rounded-l-lg text-muted font-bold text-xs flex items-center">POST</div>
                            <input 
                              type="text" 
                              placeholder="https://n8n.seu-dominio.com/webhook/..."
                              value={localConfig.webhookUrl || ''}
                              onChange={e => setLocalConfig({...localConfig, webhookUrl: e.target.value})}
                              className="flex-1 p-2.5 rounded-r-lg bg-gray-50 dark:bg-black/20 text-main focus:ring-2 focus:ring-accent outline-none font-mono text-sm"
                            />
                          </div>
                          <p className="text-xs text-muted mt-3 leading-relaxed">
                            Esta URL será chamada via POST com um payload JSON sempre que uma mensagem for enviada através da gestão de usuários.
                            O JSON incluirá dados do destinatário, tipo de canal (Email/WhatsApp) e conteúdo da mensagem.
                          </p>
                      </div>
                    </div>
                 )}

                 {/* Theme Editor */}
                 {settingsTab === 'themes' && (
                    <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                      <div className="grid lg:grid-cols-2 gap-8">
                        
                        {/* Light Theme Column */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 text-main font-semibold pb-2 border-b border-border/20">
                            <Sun size={18} className="text-orange-500" /> Tema Light
                          </div>
                          
                          <ThemeEditorSection title="Estrutura Base">
                              <ColorInput 
                                label="Background" 
                                value={localConfig.themeLight.background}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, background: v}})}
                                hint="Fundo geral da página"
                              />
                              <ColorInput 
                                label="Surface" 
                                value={localConfig.themeLight.surface}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, surface: v}})}
                                hint="Cards, modais e headers"
                              />
                              <ColorInput 
                                label="Borders" 
                                value={localConfig.themeLight.border}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, border: v}})}
                                hint="Linhas divisórias"
                              />
                          </ThemeEditorSection>

                          <ThemeEditorSection title="Tipografia">
                              <ColorInput 
                                label="Text Main" 
                                value={localConfig.themeLight.textMain}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, textMain: v}})}
                                hint="Títulos e textos principais"
                              />
                              <ColorInput 
                                label="Text Muted" 
                                value={localConfig.themeLight.textMuted}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, textMuted: v}})}
                                hint="Legendas e ícones secundários"
                              />
                          </ThemeEditorSection>

                          <ThemeEditorSection title="Marca">
                               <ColorInput 
                                label="Accent" 
                                value={localConfig.themeLight.accent}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, accent: v}})}
                                hint="Botões, links e destaques"
                              />
                          </ThemeEditorSection>

                          <ThemeEditorSection title="Feedback & Status">
                               <ColorInput 
                                label="Success" 
                                value={localConfig.themeLight.success}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, success: v}})}
                                hint="Ativo, Aprovado"
                              />
                              <ColorInput 
                                label="Warning" 
                                value={localConfig.themeLight.warning}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, warning: v}})}
                                hint="Pendente, Alerta"
                              />
                              <ColorInput 
                                label="Error" 
                                value={localConfig.themeLight.error}
                                onChange={v => setLocalConfig({...localConfig, themeLight: {...localConfig.themeLight, error: v}})}
                                hint="Inativo, Rejeitado, Perigo"
                              />
                          </ThemeEditorSection>

                          <div className="pt-4">
                            <LivePreview themeName="Light" scheme={localConfig.themeLight} />
                          </div>
                        </div>

                        {/* Dark Theme Column */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 text-main font-semibold pb-2 border-b border-border/20">
                            <Moon size={18} className="text-blue-400" /> Tema Dark
                          </div>

                          <ThemeEditorSection title="Estrutura Base">
                              <ColorInput 
                                label="Background" 
                                value={localConfig.themeDark.background}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, background: v}})}
                                hint="Fundo geral da página"
                              />
                              <ColorInput 
                                label="Surface" 
                                value={localConfig.themeDark.surface}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, surface: v}})}
                                hint="Cards, modais e headers"
                              />
                              <ColorInput 
                                label="Borders" 
                                value={localConfig.themeDark.border}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, border: v}})}
                                hint="Linhas divisórias"
                              />
                          </ThemeEditorSection>

                          <ThemeEditorSection title="Tipografia">
                              <ColorInput 
                                label="Text Main" 
                                value={localConfig.themeDark.textMain}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, textMain: v}})}
                                hint="Títulos e textos principais"
                              />
                              <ColorInput 
                                label="Text Muted" 
                                value={localConfig.themeDark.textMuted}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, textMuted: v}})}
                                hint="Legendas e ícones secundários"
                              />
                          </ThemeEditorSection>

                          <ThemeEditorSection title="Marca">
                               <ColorInput 
                                label="Accent" 
                                value={localConfig.themeDark.accent}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, accent: v}})}
                                hint="Botões, links e destaques"
                              />
                          </ThemeEditorSection>

                          <ThemeEditorSection title="Feedback & Status">
                               <ColorInput 
                                label="Success" 
                                value={localConfig.themeDark.success}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, success: v}})}
                                hint="Ativo, Aprovado"
                              />
                              <ColorInput 
                                label="Warning" 
                                value={localConfig.themeDark.warning}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, warning: v}})}
                                hint="Pendente, Alerta"
                              />
                              <ColorInput 
                                label="Error" 
                                value={localConfig.themeDark.error}
                                onChange={v => setLocalConfig({...localConfig, themeDark: {...localConfig.themeDark, error: v}})}
                                hint="Inativo, Rejeitado, Perigo"
                              />
                          </ThemeEditorSection>

                          <div className="pt-4">
                            <LivePreview themeName="Dark" scheme={localConfig.themeDark} />
                          </div>
                        </div>
                      </div>
                    </div>
                 )}

                 {/* Invites Section */}
                 {settingsTab === 'invites' && (
                    <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                      <p className="text-sm text-muted mb-6">Compartilhe estes links para que novos usuários se cadastrem diretamente com o perfil pré-selecionado.</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {(['client', 'distributor', 'consultant'] as Role[]).map(role => {
                          const fullUrl = `${window.location.origin}/?role=${role}`;
                          return (
                            <div key={role} className="bg-page p-4 rounded-lg flex flex-col">
                              <span className="text-sm font-semibold text-main mb-2 capitalize">{t(`role.${role}`)}</span>
                              <div className="mt-auto pt-2 flex gap-2">
                                <input 
                                  readOnly 
                                  value={fullUrl}
                                  className="bg-surface p-2 rounded text-xs text-muted truncate flex-1 font-mono outline-none"
                                />
                                <button 
                                  onClick={() => window.open(fullUrl, '_blank')}
                                  className="p-2 rounded bg-surface hover:bg-muted/10 text-muted hover:text-main transition-colors"
                                  title="Visualizar (Nova Aba)"
                                >
                                  <ExternalLink size={14} />
                                </button>
                                <button 
                                  onClick={() => handleCopyLink(fullUrl, role)}
                                  className={`p-2 rounded text-white transition-colors flex items-center gap-1 text-xs font-bold ${copiedLink === role ? 'bg-success' : 'bg-accent hover:opacity-90'}`}
                                  title={t('user.invite.copy')}
                                >
                                  {copiedLink === role ? <CheckCircle size={14} /> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {isFormOpen && (
        <MaterialFormModal 
          initialData={editingMaterial}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveMaterial}
        />
      )}

      {viewingMaterial && (
        <ViewerModal 
          material={viewingMaterial.mat} 
          language={viewingMaterial.lang} 
          onClose={() => setViewingMaterial(null)} 
        />
      )}

      {userComm && (
        <UserCommunicationModal 
          user={userComm}
          onClose={() => setUserComm(null)}
        />
      )}

      {userEditing && (
        <UserEditModal 
            user={userEditing}
            onClose={() => setUserEditing(null)}
            onSave={handleSaveUser}
        />
      )}
      
      {analyticsDetail && analyticsDetail.material && (
          <AnalyticsDetailModal 
            material={analyticsDetail.material}
            logs={analyticsDetail.logs}
            onClose={() => setAnalyticsDetail(null)}
            lang={language}
          />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t('confirm.delete.title')}
        message={t('confirm.delete.message')}
        onConfirm={confirmDelete}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};