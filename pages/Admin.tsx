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
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-main'
        }`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-main">{t('admin.title')}</h2>
          <p className="text-sm text-muted">{t('admin.subtitle')}</p>
        </div>
        <div className="flex bg-page rounded-lg p-1">
          {renderTabButton('materials', t('tab.materials'), ImageIcon)}
          {renderTabButton('collections', t('tab.collections'), Layers)}
          {renderTabButton('users', t('tab.users'), Users)}
          {renderTabButton('analytics', t('tab.analytics'), BarChart2)}
          {renderTabButton('settings', t('tab.settings'), Settings)}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'materials' && <MaterialsTab materials={materials} onReload={loadMaterials} isLoading={isLoading} />}
      {activeTab === 'collections' && <CollectionsTab isLoading={isLoading} />}
      {activeTab === 'users' && <UsersTab users={users} onReload={loadUsers} isLoading={isLoading} />}
      {activeTab === 'analytics' && <AnalyticsTab materials={materials} accessLogs={accessLogs} isLoading={isLoading} />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
};