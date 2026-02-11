import React from 'react';
import { Material, Language } from '../types';
import { FileText, Image as ImageIcon, Video, Eye, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MaterialCardProps {
  material: Material;
  onView: (material: Material, lang: Language) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onView }) => {
  const { t, language } = useLanguage();

  const getIcon = () => {
    switch (material.type) {
      case 'pdf': return <FileText size={32} className="text-red-500" />;
      case 'image': return <ImageIcon size={32} className="text-blue-500" />;
      case 'video': return <Video size={32} className="text-purple-500" />;
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
    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-page rounded-lg border border-border">
            {getIcon()}
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-page rounded-full text-muted border border-border">
            {getLabel()}
          </span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem] text-main" title={displayTitle}>
          {displayTitle}
        </h3>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted mb-2 uppercase tracking-wider font-semibold">Versões Disponíveis</p>
          <div className="flex gap-2">
            {languages.map(lang => {
              const hasAsset = !!material.assets[lang];
              return (
                <button
                  key={lang}
                  onClick={() => hasAsset && onView(material, lang)}
                  disabled={!hasAsset}
                  className={`
                    px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1
                    ${hasAsset 
                      ? 'border-accent text-accent hover:bg-accent hover:text-white cursor-pointer' 
                      : 'border-border text-muted/40 cursor-not-allowed'}
                  `}
                >
                  {lang.toUpperCase().split('-')[0]}
                  {hasAsset ? <Eye size={10} /> : <Lock size={10} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};