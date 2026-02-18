import React, { useEffect, useState } from 'react';
import { mockDb } from '../lib/mockDb';
import { Material, UserProfile, AccessLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Image as ImageIcon, Users, BarChart2, Settings, Layers } from 'lucide-react';

// Sub-components (extracted from the original monolithic Admin)
import { MaterialsTab } from './admin/MaterialsTab';
import { UsersTab } from './admin/UsersTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { SettingsTab } from './admin/SettingsTab';
import { CollectionsTab } from './admin/CollectionsTab';


type AdminTab = 'materials' | 'collections' | 'users' | 'analytics' | 'settings';

export const Admin: React.FC = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<AdminTab>('materials');

  // Shared Data
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMaterials = async () => { setMaterials(await mockDb.getMaterials('super_admin')); };
  const loadUsers = async () => { setUsers(await mockDb.getUsers()); };
  const loadLogs = async () => { setAccessLogs(await mockDb.getAccessLogs()); };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 800));

      await Promise.all([
        loadMaterials(),
        loadUsers(),
        loadLogs()
      ]);

      setIsLoading(false);
    };
    loadData();
  }, []);

  const renderTabButton = (id: AdminTab, label: string, Icon: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 group
        ${activeTab === id
          ? 'bg-accent/10 text-accent border border-accent/20'
          : 'text-white/20 hover:text-white/60 hover:bg-white/[0.02] border border-transparent'
        }`}
    >
      <Icon size={14} className={activeTab === id ? "animate-pulse" : ""} />
      <span className="hidden lg:inline">{label}</span>
      {activeTab === id && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_10px_rgba(0,209,255,1)]"></div>
      )}
    </button>
  );

  return (
    <div className="space-y-12 animate-reveal">
      {/* Admin Header Aura */}
      <div className="aura-glass p-8 md:p-10 rounded-[2.5rem] border-white/[0.03] flex flex-col xl:flex-row justify-between items-center gap-8">
        <div className="text-center xl:text-left">
          <h2 className="text-4xl heading-aura text-white mb-3">Central de Comando</h2>
          <p className="text-[13px] text-white/20 font-medium tracking-wide">Gerencie recursos, usuários e visualize métricas da plataforma.</p>
        </div>

        <div className="flex flex-wrap justify-center bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] p-1.5 backdrop-blur-3xl shadow-2xl">
          {renderTabButton('materials', t('tab.materials'), ImageIcon)}
          {renderTabButton('collections', t('tab.collections'), Layers)}
          {renderTabButton('users', t('tab.users'), Users)}
          {renderTabButton('analytics', t('tab.analytics'), BarChart2)}
          {renderTabButton('settings', t('tab.settings'), Settings)}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="relative z-10">
        {activeTab === 'materials' && <MaterialsTab materials={materials} onReload={loadMaterials} isLoading={isLoading} />}
        {activeTab === 'collections' && <CollectionsTab isLoading={isLoading} />}
        {activeTab === 'users' && <UsersTab users={users} onReload={loadUsers} isLoading={isLoading} />}
        {activeTab === 'analytics' && <AnalyticsTab materials={materials} accessLogs={accessLogs} isLoading={isLoading} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};