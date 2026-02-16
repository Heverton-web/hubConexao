import React from 'react';
import { Material, Language } from '../types';
import { FileText, Image as ImageIcon, Video, Eye, Lock, PlayCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MaterialCardProps {
  material: Material;
  onView: (material: Material, lang: Language) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onView }) => {
  const { t, language } = useLanguage();

  const getIcon = () => {
    switch (material.type) {
      case 'pdf': return <FileText size={28} className="text-red-500 drop-shadow-lg" />;
      case 'image': return <ImageIcon size={28} className="text-blue-500 drop-shadow-lg" />;
      case 'video': return <Video size={28} className="text-purple-500 drop-shadow-lg" />;
    }
  };

  const getLabel = () => {
     switch (material.type) {
      case 'pdf': return t('material.type.pdf');
      case 'image': return t('material.type.image');
      case 'video': return t('material.type.video');
    }
  }

  const getGradient = () => {
      switch (material.type) {
        case 'pdf': return 'from-red-500/20 to-orange-500/5';
        case 'image': return 'from-blue-500/20 to-cyan-500/5';
        case 'video': return 'from-purple-500/20 to-pink-500/5';
        default: return 'from-accent/20 to-transparent';
      }
  }

  const getBorderColor = () => {
     switch (material.type) {
        case 'pdf': return 'group-hover:border-red-500/50 group-hover:shadow-red-500/20';
        case 'image': return 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/20';
        case 'video': return 'group-hover:border-purple-500/50 group-hover:shadow-purple-500/20';
        default: return 'group-hover:border-accent/50 group-hover:shadow-accent/20';
     }
  }

  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];

  return (
    <div className={`group relative bg-surface/40 dark:bg-surface/20 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${getBorderColor()}`}>
      
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden transition-opacity duration-700">
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 animate-shimmer" style={{ left: '-150%' }} />
      </div>

      <div className="p-6 relative z-10 flex flex-col h-full">
        {/* Header Icon */}
        <div className="flex justify-between items-start mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-3.5 bg-surface/80 dark:bg-black/40 rounded-2xl shadow-sm border border-white/10 group-hover:scale-110 transition-transform duration-500">
                {getIcon()}
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-surface/50 border border-white/5 rounded-lg text-muted backdrop-blur-sm group-hover:bg-surface group-hover:text-main transition-colors">
            {getLabel()}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight text-main group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-main group-hover:to-muted transition-all duration-300 min-h-[3rem]" title={displayTitle}>
          {displayTitle}
        </h3>
        
        <div className="mt-auto pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
             <p className="text-[10px] text-muted uppercase tracking-wider font-bold opacity-70">Versões</p>
             {/* Arrow visual hint */}
             <div className="text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                <ChevronRight size={16} />
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {languages.map(lang => {
              const hasAsset = !!material.assets[lang];
              return (
                <button
                  key={lang}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasAsset) onView(material, lang);
                  }}
                  disabled={!hasAsset}
                  className={`
                    relative overflow-hidden px-3 py-1.5 text-xs rounded-lg transition-all duration-300 flex items-center gap-1.5 font-bold group/btn
                    ${hasAsset 
                      ? 'bg-page text-main hover:text-white border border-transparent hover:border-accent/30 hover:shadow-[0_0_15px_-3px_rgba(var(--color-accent),0.4)]' 
                      : 'bg-page/30 text-muted/30 cursor-not-allowed border border-transparent'}
                  `}
                > 
                  {/* Button Background Fill Animation */}
                  {hasAsset && <div className="absolute inset-0 bg-accent translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0"></div>}
                  
                  <span className="relative z-10 flex items-center gap-1">
                      {lang.toUpperCase().split('-')[0]}
                      {hasAsset ? <Eye size={10} /> : <Lock size={10} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};