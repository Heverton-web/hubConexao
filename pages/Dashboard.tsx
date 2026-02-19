import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDb } from '../lib/mockDb';
import { Material, Language, MaterialType, Collection } from '../types';
import { MaterialCard } from '../components/MaterialCard';
import { CollectionCard } from '../components/CollectionCard';
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
      group relative w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-500 ease-out
      ${active
        ? 'bg-accent/5 text-white'
        : 'bg-transparent text-white/40 hover:text-white hover:bg-white/[0.02]'}
    `}
  >
    <div className="flex items-center gap-3 relative z-10">
      <div className={`p-2 rounded-lg transition-all duration-300 ${active ? 'text-accent' : 'text-white/20 group-hover:text-white'}`}>
        <Icon size={16} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </div>

    <div className="relative z-10">
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all duration-300
          ${active
          ? 'bg-accent/20 text-accent'
          : 'bg-white/[0.05] text-white/20 group-hover:text-white/40'}
       `}>
        {count}
      </span>
    </div>
  </button>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language } | null>(null);

  const [showTrails, setShowTrails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MaterialType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dashboardShortcuts: Shortcut[] = useMemo(() => [
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
  ], []);

  useKeyboardShortcuts(dashboardShortcuts);

  useEffect(() => {
    if (user) {
      setLoading(true);
      setTimeout(() => {
        mockDb.getMaterials(user.role).then(data => {
          setMaterials(data);
          setLoading(false);
        });
      }, 800);
    }
  }, [user]);

  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (user) {
      mockDb.getCollections(user.role).then(data => {
        setCollections(data);
        if (showTrails) setLoading(false);
      });
    }
  }, [user, showTrails]);

  const filteredData = useMemo(() => {
    if (showTrails) {
      return collections.filter(c => {
        const title = c.title[language] || c.title['pt-br'] || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return materials.filter(mat => {
      if (!mat.allowedRoles.includes(user?.role as any)) return false;
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;
      const matchesCategory = filterCategory === 'all' || mat.category === filterCategory;
      const matchesTag = filterTag === 'all' || (mat.tags && mat.tags.includes(filterTag));

      return matchesSearch && matchesType && matchesCategory && matchesTag;
    });
  }, [materials, collections, searchTerm, filterType, filterCategory, filterTag, language, user, showTrails]);

  const {
    currentData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    jumpToPage,
    startIndex,
    endIndex
  } = usePagination({ data: filteredData as any[], itemsPerPage: 9 });

  const counts = useMemo(() => {
    const base = materials.filter(mat => mat.allowedRoles.includes(user?.role as any));
    return {
      all: base.length,
      pdf: base.filter(m => m.type === 'pdf').length,
      image: base.filter(m => m.type === 'image').length,
      video: base.filter(m => m.type === 'video').length
    };
  }, [materials, user]);

  const handleViewMaterial = (mat: Material, lang: Language) => {
    if (user) mockDb.logAccess(mat.id, user.id, lang);
    setViewingMaterial({ mat, lang });
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 relative">

      {/* Sidebar Aura */}
      <aside className="w-full md:w-64 shrink-0 z-30">
        <div className="sticky top-32 space-y-8">

          <div className="aura-glass rounded-[1.5rem] p-4 space-y-2">
            <div className="px-4 py-2 mb-2">
              <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
                <Layers size={12} /> {t('library')}
              </h3>
            </div>

            <MenuCategory type="all" icon={Grid} label={t('filter.all')} count={counts.all} active={!showTrails && filterType === 'all'} onClick={() => { setShowTrails(false); setFilterType('all'); }} />

            <button
              onClick={() => setShowTrails(true)}
              className={`
                group relative w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-500 ease-out
                ${showTrails
                  ? 'bg-accent/5 text-white'
                  : 'bg-transparent text-white/40 hover:text-white hover:bg-white/[0.02]'}
              `}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-2 rounded-lg transition-all duration-300 ${showTrails ? 'text-accent' : 'text-white/20 group-hover:text-white'}`}>
                  <Layers size={16} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">{t('tab.collections')}</span>
              </div>
              <div className="relative z-10">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all duration-300
                    ${showTrails
                    ? 'bg-accent/20 text-accent'
                    : 'bg-white/[0.05] text-white/20 group-hover:text-white/40'}
                `}>
                  {collections.length}
                </span>
              </div>
            </button>

            <MenuCategory type="pdf" icon={FileText} label={t('filter.pdf')} count={counts.pdf} active={!showTrails && filterType === 'pdf'} onClick={(t) => { setShowTrails(false); setFilterType(t); }} />
            <MenuCategory type="image" icon={ImageIcon} label={t('filter.image')} count={counts.image} active={!showTrails && filterType === 'image'} onClick={(t) => { setShowTrails(false); setFilterType(t); }} />
            <MenuCategory type="video" icon={Video} label={t('filter.video')} count={counts.video} active={!showTrails && filterType === 'video'} onClick={(t) => { setShowTrails(false); setFilterType(t); }} />
          </div>

          {/* Tips Card */}
          <div className="aura-glass p-6 rounded-[1.5rem] bg-accent/[0.01]">
            <div className="flex items-center gap-2 text-accent mb-3">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('tips.pro.title')}</span>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: t('tips.pro.desc') }} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">

        {/* Hero Header */}
        <div className="mb-12 aura-glass p-10 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] group-hover:bg-accent/10 transition-all duration-1000"></div>

          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
            <div>
              <h2 className="text-4xl md:text-5xl heading-aura text-white mb-4">{t('dashboard.title')}</h2>
              <p className="text-[15px] text-white/30 max-w-lg leading-relaxed font-medium">
                Sua central inteligente de materiais e recursos premium sincronizada em tempo real.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full xl:w-96 group/search">
              <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl opacity-0 group-focus-within/search:opacity-20 transition-all duration-500"></div>
              <div className="relative bg-white/[0.01] rounded-2xl flex items-center shadow-inner transition-all duration-300 group-focus-within/search:bg-white/[0.02]">
                <div className="pl-5 text-white/20 group-focus-within/search:text-accent transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  className="w-full bg-transparent border-none py-4 px-4 text-white placeholder-white/10 focus:ring-0 text-[13px] font-bold outline-none uppercase tracking-widest"
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="pr-5 hidden sm:block">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-white/10 font-black">
                    /
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 aura-glass rounded-[2.5rem] text-center">
            <Filter size={32} className="mx-auto text-white/5 mb-4" />
            <h3 className="text-lg font-bold text-white/40 mb-2">{t('no.results.title')}</h3>
            <p className="text-[12px] text-white/20">{t('no.materials')}</p>
          </div>
        ) : (
          <div className="space-y-10 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {currentData.map((item: any) => (
                <div key={item.id} className="animate-reveal">
                  {showTrails ? (
                    <CollectionCard collection={item} onClick={(c) => navigate(`/collections/${c.id}`)} />
                  ) : (
                    <MaterialCard material={item} onView={handleViewMaterial} />
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 aura-glass rounded-[1.5rem]">
                <span className="text-[11px] text-white/20 font-bold uppercase tracking-widest">
                  {startIndex + 1}-{endIndex} <span className="mx-2">/</span> {filteredData.length}
                </span>

                <div className="flex items-center gap-2">
                  <button onClick={prevPage} disabled={currentPage === 1} className="p-2 text-white/20 hover:text-white disabled:opacity-5 transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => jumpToPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-accent/5 text-accent shadow-sm' : 'text-white/20 hover:text-white'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={nextPage} disabled={currentPage === totalPages} className="p-2 text-white/20 hover:text-white disabled:opacity-5 transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {viewingMaterial && (
        <ViewerModal material={viewingMaterial.mat} language={viewingMaterial.lang} onClose={() => setViewingMaterial(null)} />
      )}
    </div>
  );
};
