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
      // 1. Role Check
      if (!mat.allowedRoles.includes(user?.role as any)) return false;

      // 2. Custom User Permissions
      if (user?.allowedTypes && user.allowedTypes.length > 0) {
        if (!user.allowedTypes.includes(mat.type)) return false;
      }

      // 3. UI Filters
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, filterType, language, user]);

  const handleViewMaterial = (mat: Material, lang: Language) => {
      if(user) {
        mockDb.logAccess(mat.id, user.id, lang);
      }
      setViewingMaterial({ mat, lang });
  };

  const FilterButton = ({ type, icon: Icon, label }: { type: MaterialType | 'all', icon: any, label: string }) => (
    <button
      onClick={() => setFilterType(type)}
      className={`
        w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 group
        ${filterType === type 
          ? 'bg-accent text-white shadow-lg shadow-accent/30 translate-x-1' 
          : 'bg-surface/50 text-muted hover:bg-surface hover:text-main hover:translate-x-1'}
      `}
    >
      <div className={`p-1.5 rounded-lg ${filterType === type ? 'bg-white/20' : 'bg-page group-hover:bg-accent/10 group-hover:text-accent transition-colors'}`}>
        <Icon size={18} />
      </div>
      <span className="font-medium text-sm">{label}</span>
      {filterType === type && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar / Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-surface/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 md:bg-transparent md:p-0 md:rounded-none md:border-none sticky top-24">
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
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div>
             <h2 className="text-2xl font-bold text-main tracking-tight">{t('dashboard.title')}</h2>
             <p className="text-xs text-muted mt-1">Explore os conteúdos disponíveis para o seu perfil.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-accent transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-page/50 focus:bg-surface shadow-inner focus:shadow-lg focus:shadow-accent/5 focus:ring-2 focus:ring-accent/50 text-sm text-main placeholder-muted outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="text-center py-20 bg-surface/30 backdrop-blur-sm rounded-2xl border border-dashed border-muted/20 animate-fade-in">
            <div className="mx-auto w-20 h-20 bg-page/50 rounded-full flex items-center justify-center mb-4 text-muted border border-border">
              <Filter size={32} />
            </div>
            <p className="text-lg font-medium text-main mb-1">Nada encontrado</p>
            <p className="text-muted text-sm">{t('no.materials')}</p>
            {(searchTerm || filterType !== 'all') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                className="mt-6 px-6 py-2 rounded-full bg-accent/10 text-accent font-bold hover:bg-accent hover:text-white transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((mat, index) => (
              <div 
                key={mat.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MaterialCard 
                  material={mat} 
                  onView={handleViewMaterial} 
                />
              </div>
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