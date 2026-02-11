import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDb } from '../lib/mockDb';
import { Material, Language, MaterialType } from '../types';
import { MaterialCard } from '../components/MaterialCard';
import { ViewerModal } from '../components/ViewerModal';
import { Search, Grid, FileText, Image as ImageIcon, Video, Filter } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language } | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MaterialType | 'all'>('all');

  useEffect(() => {
    if (user) {
      mockDb.getMaterials(user.role).then(setMaterials);
    }
  }, [user]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      // 1. Role Check (Done by mockDb, but good to be safe)
      if (!mat.allowedRoles.includes(user?.role as any)) return false;

      // 2. Custom User Permissions (allowedTypes)
      // If user.allowedTypes is defined and not empty, check if material type is included.
      if (user?.allowedTypes && user.allowedTypes.length > 0) {
        if (!user.allowedTypes.includes(mat.type)) return false;
      }

      // 3. UI Filters (Search & Type Toggle)
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, filterType, language, user]);

  const FilterButton = ({ type, icon: Icon, label }: { type: MaterialType | 'all', icon: any, label: string }) => (
    <button
      onClick={() => setFilterType(type)}
      className={`
        w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all
        ${filterType === type 
          ? 'bg-accent text-white shadow-lg shadow-accent/30' 
          : 'bg-surface text-muted hover:bg-muted/10 hover:text-main'}
      `}
    >
      <Icon size={18} />
      <span className="font-medium text-sm">{label}</span>
      {filterType === type && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar / Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-surface p-1 rounded-xl md:bg-transparent md:p-0 md:rounded-none">
           <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 px-2 hidden md:block">
            {t('filter.title')}
          </h3>
          <div className="flex overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0">
            <FilterButton type="all" icon={Grid} label={t('filter.all')} />
            <FilterButton type="pdf" icon={FileText} label={t('filter.pdf')} />
            <FilterButton type="image" icon={ImageIcon} label={t('filter.image')} />
            <FilterButton type="video" icon={Video} label={t('filter.video')} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-main">{t('dashboard.title')}</h2>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-surface shadow-sm focus:ring-2 focus:ring-accent text-sm text-main placeholder-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-xl border border-dashed border-muted/20">
            <div className="mx-auto w-16 h-16 bg-page rounded-full flex items-center justify-center mb-4 text-muted">
              <Filter size={32} />
            </div>
            <p className="text-muted">{t('no.materials')}</p>
            {(searchTerm || filterType !== 'all') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                className="mt-4 text-accent text-sm font-medium hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredMaterials.map(mat => (
              <MaterialCard 
                key={mat.id} 
                material={mat} 
                onView={(m, l) => setViewingMaterial({ mat: m, lang: l })} 
              />
            ))}
          </div>
        )}
      </div>

      {viewingMaterial && (
        <ViewerModal 
          material={viewingMaterial.mat} 
          language={viewingMaterial.lang} 
          onClose={() => setViewingMaterial(null)} 
        />
      )}
    </div>
  );
};