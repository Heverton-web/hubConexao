import React from 'react';
import { Material, Language } from '../types';
import { FileText, Image as ImageIcon, Video, Eye, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MaterialCardProps {
  material: Material;
  onView: (material: Material, lang: Language) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onView }) => {
  const { t, language } = useLanguage();

  const getIcon = () => {
    switch (material.type) {
      case 'pdf': return <FileText size={24} className="text-red-500 group-hover:scale-110 transition-transform duration-300" />;
      case 'image': return <ImageIcon size={24} className="text-blue-500 group-hover:scale-110 transition-transform duration-300" />;
      case 'video': return <Video size={24} className="text-purple-500 group-hover:scale-110 transition-transform duration-300" />;
    }
  };

  const getLabel = () => {
     switch (material.type) {
      case 'pdf': return t('material.type.pdf');
      case 'image': return t('material.type.image');
      case 'video': return t('material.type.video');
    }
  }

  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];

  return (
    // Removido border-border para visual clean
    <div className="group relative bg-surface/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-1">
      
      {/* Decorative Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-page/80 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
            {getIcon()}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-page/50 rounded-lg text-muted">
            {getLabel()}
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-3 line-clamp-2 min-h-[3.5rem] text-main group-hover:text-accent transition-colors" title={displayTitle}>
          {displayTitle}
        </h3>
        
        <div className="mt-4 pt-4 border-t border-border/10">
          <p className="text-[10px] text-muted mb-3 uppercase tracking-wider font-bold opacity-70">Disponibilidade</p>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => {
              const hasAsset = !!material.assets[lang];
              return (
                <button
                  key={lang}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent clicks if any
                    if (hasAsset) onView(material, lang);
                  }}
                  disabled={!hasAsset}
                  className={`
                    px-2.5 py-1.5 text-xs rounded-lg transition-all duration-300 flex items-center gap-1.5 font-medium
                    ${hasAsset 
                      ? 'bg-accent/5 text-accent hover:bg-accent hover:text-white hover:shadow-lg hover:shadow-accent/20 cursor-pointer transform hover:scale-105' 
                      : 'bg-page/30 text-muted/40 cursor-not-allowed grayscale'}
                  `}
                >
                  {lang.toUpperCase().split('-')[0]}
                  {hasAsset ? <Eye size={12} /> : <Lock size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Action Indicator */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
};