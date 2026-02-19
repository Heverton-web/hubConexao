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
      case 'pdf': return <FileText size={22} className="text-error" />;
      case 'image': return <ImageIcon size={22} className="text-accent" />;
      case 'video': return <Video size={22} className="text-success" />;
    }
  };

  const getLabel = () => {
    switch (material.type) {
      case 'pdf': return t('material.type.pdf');
      case 'image': return t('material.type.image');
      case 'video': return t('material.type.video');
    }
    return '';
  }

  const getAccentColor = () => {
    switch (material.type) {
      case 'pdf': return 'rgba(255, 77, 77, 0.4)'; // Error Red
      case 'image': return 'rgba(0, 209, 255, 0.4)'; // Accent Cyan
      case 'video': return 'rgba(0, 245, 160, 0.4)'; // Success Mint
      default: return 'rgba(0, 209, 255, 0.4)';
    }
  }

  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];

  return (
    <div className="group aura-glass rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2">

      {/* Type Specific Glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-full"
        style={{ backgroundColor: getAccentColor() }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header Icon */}
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-white/[0.01] rounded-xl group-hover:bg-accent/[0.03] transition-all duration-500">
            {getIcon()}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/[0.01] rounded-lg text-white/40 group-hover:text-white transition-all">
            {getLabel()}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg heading-aura mb-4 line-clamp-2 leading-tight text-white/90 group-hover:text-white transition-all min-h-[3rem]" title={displayTitle}>
          {displayTitle}
        </h3>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Distribuição</p>
            <ChevronRight size={14} className="text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
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
                    px-4 py-2 text-[10px] rounded-xl transition-all duration-300 flex items-center gap-2 font-bold uppercase tracking-widest
                    ${hasAsset
                      ? 'bg-white/[0.01] text-white/60 hover:text-white hover:bg-accent/[0.03]'
                      : 'bg-transparent text-white/10 cursor-not-allowed'}
                  `}
                >
                  <span>{lang.toUpperCase().split('-')[0]}</span>
                  {hasAsset ? <Eye size={12} className="opacity-40" /> : <Lock size={12} className="opacity-20" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
