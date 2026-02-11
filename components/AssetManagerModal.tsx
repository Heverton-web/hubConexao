import React, { useState } from 'react';
import { Material, Language, MaterialAsset } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save } from 'lucide-react';

interface AssetManagerModalProps {
  material: Material;
  onClose: () => void;
  onSave: (updatedMaterial: Material) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({ material, onClose, onSave }) => {
  const { t, language } = useLanguage();
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];
  
  // Local state to hold edits before saving
  const [assets, setAssets] = useState<Partial<Record<Language, MaterialAsset>>>(material.assets);

  const handleChange = (lang: Language, field: keyof MaterialAsset, value: string) => {
    setAssets(prev => {
      const currentLangAsset = prev[lang] || { url: '' };
      
      return {
        ...prev,
        [lang]: {
          ...currentLangAsset,
          [field]: value
        }
      };
    });
  };

  const handleSave = () => {
    const cleanedAssets: Partial<Record<Language, MaterialAsset>> = {};
    
    // Only keep assets that have a URL
    Object.entries(assets).forEach(([key, asset]) => {
      const lang = key as Language;
      const materialAsset = asset as MaterialAsset | undefined;
      
      if (materialAsset?.url && materialAsset.url.trim() !== '') {
        cleanedAssets[lang] = materialAsset;
      }
    });

    onSave({
      ...material,
      assets: cleanedAssets
    });
  };

  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-muted/10">
        <div className="p-4 border-b border-muted/10 flex justify-between items-center bg-surface rounded-t-xl">
          <h3 className="font-bold text-lg text-main">{t('edit.assets.title')} <span className="text-accent">{displayTitle}</span></h3>
          <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface">
          <p className="text-sm text-muted italic mb-4">{t('empty.url.hint')}</p>

          {languages.map(lang => (
            <div key={lang} className="bg-page p-4 rounded-lg border border-muted/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase px-2 py-1 bg-surface rounded text-muted border border-muted/10">
                  {lang}
                </span>
                {material.type === 'video' && <span className="text-xs text-purple-500 font-medium">Video</span>}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted">{t('asset.url')}</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full text-sm p-2 rounded border border-muted/20 bg-surface text-main placeholder-muted focus:ring-2 focus:ring-accent outline-none"
                    value={assets[lang]?.url || ''}
                    onChange={(e) => handleChange(lang, 'url', e.target.value)}
                  />
                </div>

                {material.type === 'video' && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted">{t('asset.subtitle')}</label>
                    <input 
                      type="text" 
                      placeholder="https://... (vtt/srt)"
                      className="w-full text-sm p-2 rounded border border-muted/20 bg-surface text-main placeholder-muted focus:ring-2 focus:ring-accent outline-none"
                      value={assets[lang]?.subtitleUrl || ''}
                      onChange={(e) => handleChange(lang, 'subtitleUrl', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-muted/10 bg-page rounded-b-xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded text-muted hover:bg-muted/10 hover:text-main transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded bg-accent text-white hover:opacity-90 flex items-center gap-2 shadow-sm"
          >
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};