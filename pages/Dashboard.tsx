import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDb } from '../lib/mockDb';
import { Material, Language, MaterialType } from '../types';
import { MaterialCard } from '../components/MaterialCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { ViewerModal } from '../components/ViewerModal';
import { Search, Grid, FileText, Image as ImageIcon, Video, Filter, ChevronRight, ChevronLeft, Layers, Sparkles, Command, Tag, Folder } from 'lucide-react';
import { useKeyboardShortcuts, Shortcut } from '../hooks/useKeyboardShortcuts';
import { usePagination } from '../hooks/usePagination';

// Modern Pill Menu Item
const MenuCategory = ({ type, icon: Icon, label, count, active, onClick }: { type: MaterialType | 'all', icon: any, label: string, count: number, active: boolean, onClick: (type: MaterialType | 'all') => void }) => (
  <button
    onClick={() => onClick(type)}
    className={`
      group relative w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between transition-all duration-500 ease-out overflow-hidden
      ${active
        ? 'bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg shadow-accent/30 translate-x-2'
        : 'bg-transparent text-muted hover:bg-surface hover:text-main'}
    `}
  >
    {/* Dynamic Background on Hover (Inactive) */}
    {!active && <div className="absolute inset-0 bg-surface/0 group-hover:bg-surface/50 transition-colors duration-300"></div>}

    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white/20 text-white' : 'bg-surface border border-border group-hover:scale-110 group-hover:border-accent/30'}`}>
        <Icon size={18} />
      </div>
      <span className={`text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </div>

    <div className="flex items-center gap-2 relative z-10">
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-300
          ${active
          ? 'bg-white/20 text-white backdrop-blur-sm'
          : 'bg-surface border border-border group-hover:border-accent/30'}
       `}>
        {count}
      </span>
    </div>
  </button>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language } | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MaterialType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dashboardShortcuts: Shortcut[] = [
    {
      id: 'focus-search',
      combo: { key: 'k', ctrl: true },
      action: (e) => {
        e.preventDefault();
        searchInputRef.current?.focus();
      },
      description: 'Buscar materiais',
      global: true
    },
    {
      id: 'clear-filters',
      combo: { key: 'Escape' },
      action: () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterCategory('all');
        setFilterTag('all');
        searchInputRef.current?.blur();
      },
      description: 'Limpar filtros e busca'
    },
    { id: 'filter-all', combo: { key: '1', alt: true }, action: () => setFilterType('all'), description: 'Filtrar: Todos' },
    { id: 'filter-pdf', combo: { key: '2', alt: true }, action: () => setFilterType('pdf'), description: 'Filtrar: PDFs' },
    { id: 'filter-img', combo: { key: '3', alt: true }, action: () => setFilterType('image'), description: 'Filtrar: Imagens' },
    { id: 'filter-vid', combo: { key: '4', alt: true }, action: () => setFilterType('video'), description: 'Filtrar: Vídeos' }
  ];

  useKeyboardShortcuts(dashboardShortcuts);

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Simulate network delay for premium feel
      setTimeout(() => {
        mockDb.getMaterials(user.role).then(data => {
          setMaterials(data);
          setLoading(false);
        });
      }, 800);
    }
  }, [user]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      if (!mat.allowedRoles.includes(user?.role as any)) return false;
      if (user?.allowedTypes && user.allowedTypes.length > 0) {
        if (!user.allowedTypes.includes(mat.type)) return false;
      }
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;
      const matchesCategory = filterCategory === 'all' || mat.category === filterCategory;
      const matchesTag = filterTag === 'all' || (mat.tags && mat.tags.includes(filterTag));

      return matchesSearch && matchesType && matchesCategory && matchesTag;
    });
  }, [materials, searchTerm, filterType, filterCategory, filterTag, language, user]);

  // Pagination
  const {
    currentData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    jumpToPage,
    startIndex,
    endIndex
  } = usePagination({ data: filteredMaterials, itemsPerPage: 9 });

  // Scroll to top of grid when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const availableCategories = useMemo(() => {
    const cats = new Set(materials.map(m => m.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [materials]);

  const availableTags = useMemo(() => {
    const tags = new Set(materials.flatMap(m => m.tags || []));
    return Array.from(tags);
  }, [materials]);

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
    if (user) {
      mockDb.logAccess(mat.id, user.id, lang);
    }
    setViewingMaterial({ mat, lang });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">

      {/* --- MODERN SIDEBAR --- */}
      <aside className="w-full md:w-72 shrink-0 z-30">
        <div className="sticky top-28 space-y-6 animate-slide-up">

          <div className="md:hidden flex items-center gap-2 text-muted px-1 mb-2">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{t('filter.title')}</span>
          </div>

          {/* Floating Glass Panel */}
          <div className="bg-surface/30 backdrop-blur-xl border border-white/10 p-3 rounded-3xl flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 no-scrollbar shadow-xl shadow-black/5">

            <div className="hidden md:flex items-center justify-between px-4 py-3 mb-2">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} className="text-accent" /> {t('library')}
              </h3>
            </div>

            <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="all" icon={Grid} label={t('filter.all')} count={counts.all} active={filterType === 'all'} onClick={setFilterType} /></div>
            <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="pdf" icon={FileText} label={t('filter.pdf')} count={counts.pdf} active={filterType === 'pdf'} onClick={setFilterType} /></div>
            <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="image" icon={ImageIcon} label={t('filter.image')} count={counts.image} active={filterType === 'image'} onClick={setFilterType} /></div>
            <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="video" icon={Video} label={t('filter.video')} count={counts.video} active={filterType === 'video'} onClick={setFilterType} /></div>

            {availableCategories.length > 0 && (
              <>
                <div className="hidden md:flex items-center justify-between px-4 py-3 mt-4 mb-2 border-t border-border/50">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                    <Folder size={14} className="text-accent" /> {t('category.label')}
                  </h3>
                </div>
                <select
                  className="w-full bg-surface border border-border rounded-lg p-2 text-sm text-main mb-4 outline-none focus:ring-2 focus:ring-accent"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                >
                  <option value="all">{t('filter.category.all')}</option>
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </>
            )}

            {availableTags.length > 0 && (
              <>
                <div className="hidden md:flex items-center justify-between px-4 py-3 mb-2 border-t border-border/50">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                    <Tag size={14} className="text-accent" /> {t('filter.tag.popular')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 px-2">
                  {availableTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(filterTag === tag ? 'all' : tag)}
                      className={`text-[10px] px-2 py-1 rounded-md border transition-all
                                    ${filterTag === tag
                          ? 'bg-accent text-white border-accent'
                          : 'bg-surface text-muted border-border hover:border-accent/50'}
                                `}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Dynamic Promo Box */}
            <div className="hidden md:block mt-4 pt-4 px-2 border-t border-white/5">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 group transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/40">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 mb-2">
                    <Sparkles size={16} className="animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wide">{t('tips.pro.title')}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: t('tips.pro.desc') }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 min-w-0 z-0">

        {/* Dynamic Hero Header */}
        <div className="mb-10 relative group rounded-[2rem] overflow-hidden animate-fade-in">
          {/* Background Mesh Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-purple-500/10 to-transparent opacity-60 dark:opacity-40 transition-opacity duration-500 group-hover:opacity-80"></div>
          <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow"></div>

          <div className="relative z-10 p-8 md:p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 backdrop-blur-sm">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-main tracking-tight mb-3 drop-shadow-sm">{t('dashboard.title')}</h2>
              <p className="text-base text-muted max-w-lg leading-relaxed font-medium">
                Explore, visualize e baixe todos os materiais disponíveis para o seu perfil.
              </p>
            </div>

            {/* Modern Search Input */}
            <div className="relative w-full xl:w-96 group/search">
              <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-lg opacity-0 group-focus-within/search:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-surface/60 dark:bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center shadow-inner transition-all duration-300 group-focus-within/search:shadow-lg group-focus-within/search:shadow-accent/10 group-focus-within/search:border-accent/40 group-focus-within/search:scale-[1.02]">
                <div className="pl-5 text-muted group-focus-within/search:text-accent transition-colors">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  className="w-full bg-transparent border-none py-4 px-4 text-main placeholder-muted/60 focus:ring-0 text-sm font-medium outline-none"
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="pr-4 hidden sm:block">
                  <div className="h-6 w-6 rounded flex items-center justify-center bg-white/10 border border-white/10 text-[10px] text-muted font-bold font-mono group-focus-within/search:text-main transition-colors">
                    /
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid with Staggered Animation */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface/20 backdrop-blur-sm border border-white/5 rounded-[2rem] animate-fade-in text-center px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-surface to-page rounded-full flex items-center justify-center mb-6 text-muted shadow-lg shadow-black/5 ring-4 ring-surface">
              <Filter size={32} className="opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-main mb-2">{t('no.results.title')}</h3>
            <p className="text-muted text-sm max-w-xs">{t('no.materials')}</p>

            {(searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterTag !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterCategory('all'); setFilterTag('all'); }}
                className="mt-8 px-8 py-3 rounded-xl bg-main text-page font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95"
              >
                {t('filter.clear')}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentData.map((mat, index) => (
                <div
                  key={mat.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <MaterialCard
                    material={mat}
                    onView={handleViewMaterial}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-surface/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 animate-fade-in">
                <span className="text-sm text-muted font-medium ml-2">
                  {t('pagination.showing')} <strong className="text-main">{startIndex + 1}-{endIndex}</strong> {t('pagination.of')} <strong className="text-main">{filteredMaterials.length}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-main"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                      }
                      // Clamp
                      if (pageNum > totalPages) return null;
                      if (pageNum < 1) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => jumpToPage(pageNum)}
                          className={`
                            w-8 h-8 rounded-lg text-sm font-bold transition-all
                            ${currentPage === pageNum
                              ? 'bg-accent text-white shadow-lg shadow-accent/25 scale-105'
                              : 'text-muted hover:bg-white/10 hover:text-main'}
                          `}
                        >
                          {pageNum}
                        </button>
                      );
                    }).filter(Boolean)}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-main"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
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