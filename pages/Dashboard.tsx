import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDb } from '../lib/mockDb';
import { Material, Language, MaterialType } from '../types';
import { MaterialCard } from '../components/MaterialCard';
import { ViewerModal } from '../components/ViewerModal';
import { Search, Grid, FileText, Image as ImageIcon, Video, Filter, ChevronRight, Layers, Sparkles } from 'lucide-react';

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

  // 1. Filter Logic
  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      // Role & Permission Check
      if (!mat.allowedRoles.includes(user?.role as any)) return false;
      if (user?.allowedTypes && user.allowedTypes.length > 0) {
        if (!user.allowedTypes.includes(mat.type)) return false;
      }

      // Search & Type Check
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, filterType, language, user]);

  // 2. Counts Calculation for Badges
  const counts = useMemo(() => {
      const base = materials.filter(mat => {
          if (!mat.allowedRoles.includes(user?.role as any)) return false;
          if (user?.allowedTypes && user.allowedTypes.length > 0 && !user.allowedTypes.includes(mat.type)) return false;
          return true;
      });
      return {
          all: base.length,
          pdf: base.filter(m => m.type === 'pdf').length,
          image: base.filter(m => m.type === 'image').length,
          video: base.filter(m => m.type === 'video').length
      };
  }, [materials, user]);

  const handleViewMaterial = (mat: Material, lang: Language) => {
      if(user) {
        mockDb.logAccess(mat.id, user.id, lang);
      }
      setViewingMaterial({ mat, lang });
  };

  // --- Components ---

  const MenuCategory = ({ type, icon: Icon, label, count, active }: { type: MaterialType | 'all', icon: any, label: string, count: number, active: boolean }) => (
    <button
      onClick={() => setFilterType(type)}
      className={`
        relative w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all duration-300 overflow-hidden
        ${active 
          ? 'bg-gradient-to-r from-accent/10 to-transparent text-accent shadow-sm' 
          : 'hover:bg-surface/50 text-muted hover:text-main'}
      `}
    >
      {/* Active Indicator Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-accent transition-transform duration-300 ${active ? 'scale-y-100' : 'scale-y-0'}`} />

      <div className="flex items-center gap-3 z-10">
        <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-page/50 group-hover:bg-white group-hover:shadow-sm'}`}>
          <Icon size={18} />
        </div>
        <span className={`font-medium text-sm ${active ? 'font-bold' : ''}`}>{label}</span>
      </div>

      <div className="flex items-center gap-2">
         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors
            ${active 
                ? 'bg-accent/20 text-accent' 
                : 'bg-page text-muted'}
         `}>
             {count}
         </span>
         {active && <ChevronRight size={14} className="animate-slide-up" />}
      </div>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">
      
      {/* --- SIDEBAR (Desktop) / TOPBAR (Mobile) --- */}
      {/* z-30 para ficar abaixo do Header (z-40) */}
      <aside className="w-full md:w-72 shrink-0 z-30">
        <div className="sticky top-24 space-y-6">
           
           {/* Mobile Title (Hidden on Desktop) */}
           <div className="md:hidden flex items-center gap-2 text-muted px-1">
              <Filter size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{t('filter.title')}</span>
           </div>

           {/* The Menu Container */}
           {/* Suavizado border-white/10 para border-border/50 e shadow */}
           <div className="bg-surface/60 backdrop-blur-xl p-3 rounded-2xl shadow-lg shadow-black/5 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 no-scrollbar">
              
              <div className="hidden md:block px-2 py-2 mb-2">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14} /> Biblioteca
                  </h3>
              </div>

              {/* Items */}
              <div className="min-w-[160px] md:min-w-0 flex-1">
                 <MenuCategory 
                    type="all" 
                    icon={Grid} 
                    label={t('filter.all')} 
                    count={counts.all} 
                    active={filterType === 'all'} 
                 />
              </div>

              <div className="w-px md:w-full md:h-px bg-border/40 mx-2 md:mx-0 md:my-2 shrink-0"></div>

              <div className="min-w-[160px] md:min-w-0 flex-1">
                 <MenuCategory 
                    type="pdf" 
                    icon={FileText} 
                    label={t('filter.pdf')} 
                    count={counts.pdf} 
                    active={filterType === 'pdf'} 
                 />
              </div>

              <div className="min-w-[160px] md:min-w-0 flex-1">
                 <MenuCategory 
                    type="image" 
                    icon={ImageIcon} 
                    label={t('filter.image')} 
                    count={counts.image} 
                    active={filterType === 'image'} 
                 />
              </div>

              <div className="min-w-[160px] md:min-w-0 flex-1">
                 <MenuCategory 
                    type="video" 
                    icon={Video} 
                    label={t('filter.video')} 
                    count={counts.video} 
                    active={filterType === 'video'} 
                 />
              </div>

              {/* Promo / Tip Box (Desktop Only) */}
              <div className="hidden md:block mt-6 pt-6 px-2">
                  <div className="bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-xl p-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-accent/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-colors"></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-2 text-accent mb-2">
                              <Sparkles size={16} />
                              <span className="text-xs font-bold uppercase">Dica Pro</span>
                          </div>
                          <p className="text-xs text-muted leading-relaxed">
                             Use a busca no topo para encontrar materiais por palavras-chave específicas dentro dos títulos.
                          </p>
                      </div>
                  </div>
              </div>

           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 min-w-0 z-0">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-surface/40 p-6 rounded-3xl backdrop-blur-md shadow-sm relative overflow-hidden">
          {/* Decorative Bg */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10">
             <h2 className="text-3xl font-bold text-main tracking-tight mb-2">{t('dashboard.title')}</h2>
             <p className="text-sm text-muted max-w-lg leading-relaxed">
                Bem-vindo ao seu hub de conteúdo. Selecione uma categoria ao lado ou use a busca para encontrar o que precisa.
             </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full xl:w-80 group z-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-accent transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 dark:bg-black/40 focus:bg-surface shadow-inner focus:shadow-xl focus:shadow-accent/10 focus:ring-2 focus:ring-accent/50 text-sm text-main placeholder-muted/70 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Results Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/30 backdrop-blur-sm rounded-3xl animate-fade-in">
            <div className="w-24 h-24 bg-page/50 rounded-full flex items-center justify-center mb-6 text-muted shadow-inner">
              <Filter size={40} className="opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-main mb-2">Nenhum resultado</h3>
            <p className="text-muted text-sm max-w-xs text-center">{t('no.materials')}</p>
            
            {(searchTerm || filterType !== 'all') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                className="mt-8 px-8 py-2.5 rounded-full bg-main text-page font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {filteredMaterials.map((mat, index) => (
              <div 
                key={mat.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
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