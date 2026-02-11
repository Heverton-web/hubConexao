import React, { useState, useEffect } from 'react';
import { Material, Language, MaterialType, Role, MaterialAsset } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, FileText, Image as ImageIcon, Video, Check, Globe, Users, Shield, Link as LinkIcon } from 'lucide-react';

// --- Helper Component (Extracted to fix positioning and performance) ---

interface TypeCardProps {
  value: MaterialType;
  icon: any;
  label: string;
  currentType: MaterialType;
  onSelect: (val: MaterialType) => void;
}

const TypeCard = ({ value, icon: Icon, label, currentType, onSelect }: TypeCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`
      relative flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
      ${currentType === value 
        ? 'border-accent bg-accent/5 text-accent shadow-sm' 
        : 'border-border bg-surface text-muted hover:border-muted'}
    `}
  >
    <Icon size={24} className="mb-2" />
    <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    {currentType === value && (
      <div className="absolute top-2 right-2 text-accent">
        <Check size={16} />
      </div>
    )}
  </button>
);

// --- Main Component ---

interface MaterialFormModalProps {
  initialData?: Material | null;
  onClose: () => void;
  onSave: (material: any) => Promise<void>;
}

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ initialData, onClose, onSave }) => {
  const { t } = useLanguage();
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];
  const allRoles: Role[] = ['client', 'distributor', 'consultant'];

  // Form State
  const [titles, setTitles] = useState<Partial<Record<Language, string>>>({ 'pt-br': '' });
  const [type, setType] = useState<MaterialType>('pdf');
  const [allowedRoles, setAllowedRoles] = useState<Role[]>(['client']);
  const [active, setActive] = useState(true);
  const [assets, setAssets] = useState<Partial<Record<Language, MaterialAsset>>>({});
  
  // UI State
  const [activeTab, setActiveTab] = useState<Language>('pt-br');

  // Init with data if editing
  useEffect(() => {
    if (initialData) {
      setTitles(initialData.title);
      setType(initialData.type);
      setAllowedRoles(initialData.allowedRoles);
      setActive(initialData.active);
      setAssets(initialData.assets);
    }
  }, [initialData]);

  const handleTitleChange = (lang: Language, value: string) => {
    setTitles(prev => ({ ...prev, [lang]: value }));
  };

  const handleAssetChange = (lang: Language, field: keyof MaterialAsset, value: string) => {
    setAssets(prev => {
      const current = prev[lang] || { url: '' };
      return { ...prev, [lang]: { ...current, [field]: value } };
    });
  };

  const toggleRole = (role: Role) => {
    setAllowedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedAssets: Partial<Record<Language, MaterialAsset>> = {};
    Object.entries(assets).forEach(([key, val]) => {
      const lang = key as Language;
      const asset = val as MaterialAsset;
      if (asset.url && asset.url.trim()) {
        // Trim URLs to ensure embed detection works correctly
        cleanedAssets[lang] = {
          ...asset,
          url: asset.url.trim(),
          subtitleUrl: asset.subtitleUrl?.trim()
        };
      }
    });

    const payload = {
      ...(initialData || {}),
      title: titles,
      type,
      allowedRoles,
      active,
      assets: cleanedAssets
    };

    await onSave(payload);
    onClose();
  };

  const hasContent = (lang: Language) => {
    return (titles[lang]?.length || 0) > 0 || (assets[lang]?.url?.length || 0) > 0;
  };

  const getUrlPlaceholder = () => {
    if (type === 'video') return t('url.placeholder.video');
    if (type === 'image') return t('url.placeholder.image');
    return t('url.placeholder.pdf');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-surface rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface z-10 shrink-0">
          <div>
            <h3 className="font-bold text-xl text-main">
              {initialData ? t('edit.material') : t('add.material')}
            </h3>
            <p className="text-sm text-muted">Preencha as informações globais e o conteúdo por idioma.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-page rounded-full transition-colors text-muted hover:text-main">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          
          {/* Left Column: Global Settings */}
          <div className="w-full md:w-1/3 bg-page p-6 border-r border-border overflow-y-auto">
            <div className="space-y-6">
              
              {/* Type Selection */}
              <div>
                <label className="text-xs font-bold uppercase text-muted mb-3 block tracking-wider">Tipo de Material</label>
                <div className="grid grid-cols-3 gap-2">
                  <TypeCard value="pdf" icon={FileText} label="PDF" currentType={type} onSelect={setType} />
                  <TypeCard value="image" icon={ImageIcon} label="IMG" currentType={type} onSelect={setType} />
                  <TypeCard value="video" icon={Video} label="Video" currentType={type} onSelect={setType} />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="text-xs font-bold uppercase text-muted mb-3 block flex items-center gap-2 tracking-wider">
                  <Users size={14} /> {t('permissions')}
                </label>
                <div className="space-y-2">
                  {allRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm
                        ${allowedRoles.includes(role) 
                          ? 'bg-surface border-accent text-accent shadow-sm ring-1 ring-accent' 
                          : 'bg-surface border-border text-muted/80 hover:text-main hover:border-muted'}
                      `}
                    >
                      <span className="font-medium">{t(`role.${role}`)}</span>
                      {allowedRoles.includes(role) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold uppercase text-muted mb-3 block flex items-center gap-2 tracking-wider">
                  <Shield size={14} /> {t('status')}
                </label>
                <div 
                  onClick={() => setActive(!active)}
                  className={`
                    cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-colors
                    ${active 
                      ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' 
                      : 'bg-surface border-border text-muted'}
                  `}
                >
                  <span className="font-medium">{active ? t('active') : t('inactive')}</span>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-muted/30'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? 'left-5' : 'left-1'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Localized Content */}
          <div className="flex-1 flex flex-col bg-surface min-h-0">
            
            {/* Language Tabs */}
            <div className="flex border-b border-border px-6 pt-4 gap-6 overflow-x-auto shrink-0">
              {languages.map(lang => {
                const isCompleted = hasContent(lang);
                const label = lang === 'pt-br' ? 'Português' : lang === 'en-us' ? 'English' : 'Español';
                const flag = lang === 'pt-br' ? '🇧🇷' : lang === 'en-us' ? '🇺🇸' : '🇪🇸';
                
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTab(lang)}
                    className={`
                      pb-4 px-1 relative font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2
                      ${activeTab === lang 
                        ? 'text-accent' 
                        : 'text-muted hover:text-main'}
                    `}
                  >
                    <span className="text-base">{flag}</span> {label}
                    {isCompleted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1" title="Conteúdo inserido"></span>
                    )}
                    {activeTab === lang && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto min-h-0">
              <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                
                <div className="bg-accent/10 p-4 rounded-lg flex items-start gap-3 border border-accent/20">
                   <Globe className="text-accent shrink-0 mt-0.5" size={18} />
                   <p className="text-sm text-main">
                     Você está editando a versão em <strong>{activeTab === 'pt-br' ? 'Português' : activeTab === 'en-us' ? 'Inglês' : 'Espanhol'}</strong>. 
                     Certifique-se de preencher o título e a URL do arquivo.
                   </p>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-main mb-1.5 block">
                      {t('title')} <span className="text-red-500">*</span>
                    </span>
                    <input 
                      type="text" 
                      placeholder={`Ex: Catálogo 2024 (${activeTab})`}
                      className="w-full p-3 rounded-lg border border-border bg-page text-main placeholder-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                      value={titles[activeTab] || ''}
                      onChange={e => handleTitleChange(activeTab, e.target.value)}
                    />
                  </label>

                  <div className="relative">
                     <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-surface text-xs text-muted uppercase tracking-wider">Arquivos</span>
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-main mb-1.5 block">
                      {t('asset.url')} <span className="text-red-500">*</span>
                    </span>
                    <div className="relative">
                        <input 
                          type="text" 
                          placeholder={getUrlPlaceholder()}
                          className="w-full p-3 pl-10 rounded-lg border border-border bg-page text-main placeholder-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all font-mono text-sm"
                          value={assets[activeTab]?.url || ''}
                          onChange={(e) => handleAssetChange(activeTab, 'url', e.target.value)}
                        />
                        <LinkIcon className="absolute left-3 top-3 text-muted" size={18} />
                    </div>
                    <div className="mt-2 text-xs text-muted flex gap-2 items-start">
                       <Globe size={12} className="mt-0.5 shrink-0" />
                       <span className="opacity-80">{t('url.help.text')} {t('empty.url.hint')}</span>
                    </div>
                  </label>

                  {type === 'video' && (
                    <label className="block animate-fade-in">
                      <span className="text-sm font-semibold text-main mb-1.5 block">
                        {t('asset.subtitle')} <span className="text-xs font-normal text-muted">(Opcional)</span>
                      </span>
                      <input 
                        type="text" 
                        placeholder="https://exemplo.com/legenda.vtt"
                        className="w-full p-3 rounded-lg border border-border bg-page text-main placeholder-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all font-mono text-sm"
                        value={assets[activeTab]?.subtitleUrl || ''}
                        onChange={(e) => handleAssetChange(activeTab, 'subtitleUrl', e.target.value)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-page flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-muted hover:bg-muted/10 font-medium transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg bg-accent text-white hover:opacity-90 font-medium flex items-center gap-2 shadow-lg shadow-accent/20 transition-transform active:scale-95"
              >
                <Save size={18} />
                {t('save')}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};