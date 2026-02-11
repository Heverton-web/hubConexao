import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Material, Language, MaterialType, Role, MaterialAsset } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, FileText, Image as ImageIcon, Video, Check, Globe, Users, Shield, Link as LinkIcon, Youtube, AlertCircle, Play } from 'lucide-react';

// --- Helper Component (Extracted) ---

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
      relative flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200
      ${currentType === value 
        ? 'bg-accent/5 text-accent shadow-sm ring-2 ring-accent' 
        : 'bg-surface text-muted hover:bg-page hover:text-main'}
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

// --- Video Preview Helper ---

const VideoPreview = ({ url }: { url: string }) => {
  if (!url) return null;

  // Simple Embed extraction for preview (Logic similar to ViewerModal but simplified)
  let embedUrl = '';
  const cleanUrl = url.trim();
  
  const youtubeMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
     embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  } else if (cleanUrl.includes('drive.google.com')) {
      const driveIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (driveIdMatch && driveIdMatch[1]) {
          embedUrl = `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
      }
  } else if (cleanUrl.match(/\.(mp4|webm|ogg)$/i)) {
      // Direct file
      return (
        <div className="mt-4 rounded-xl overflow-hidden bg-black aspect-video relative shadow-lg">
             <video src={cleanUrl} controls className="w-full h-full object-contain" />
        </div>
      );
  }

  if (embedUrl) {
      return (
        <div className="mt-4 rounded-xl overflow-hidden bg-black aspect-video relative shadow-lg group">
             <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Preview" />
             <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md pointer-events-none">
                Preview
             </div>
        </div>
      );
  }

  return (
    <div className="mt-4 rounded-xl bg-page p-4 flex items-center justify-center text-muted gap-2 text-sm">
        <AlertCircle size={16} />
        Não foi possível gerar preview para este link, mas ele será salvo.
    </div>
  );
};

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
  const [error, setError] = useState<string | null>(null);

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

  // Smart Input Handler
  const handleUrlPasteOrChange = (lang: Language, value: string) => {
    let finalValue = value;

    // 1. Detect iframe paste and extract src
    if (value.includes('<iframe') && value.includes('src=')) {
        const srcMatch = value.match(/src=["'](.*?)["']/);
        if (srcMatch && srcMatch[1]) {
            finalValue = srcMatch[1];
        }
    }

    setAssets(prev => {
      const current = prev[lang] || { url: '', status: 'published' };
      return { ...prev, [lang]: { ...current, url: finalValue } };
    });
  };

  const handleSubtitleChange = (lang: Language, value: string) => {
    setAssets(prev => {
      const current = prev[lang] || { url: '', status: 'published' };
      return { ...prev, [lang]: { ...current, subtitleUrl: value } };
    });
  };

  const toggleRole = (role: Role) => {
    setAllowedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedAssets: Partial<Record<Language, MaterialAsset>> = {};
    const cleanedTitles: Partial<Record<Language, string>> = {};
    let hasAtLeastOneValidVersion = false;

    languages.forEach(lang => {
        const url = assets[lang]?.url?.trim();
        const title = titles[lang]?.trim();

        if (url && title) {
            hasAtLeastOneValidVersion = true;
            cleanedAssets[lang] = {
                url: url,
                subtitleUrl: assets[lang]?.subtitleUrl?.trim(),
                status: assets[lang]?.status || 'published'
            };
            cleanedTitles[lang] = title;
        }
    });

    if (!hasAtLeastOneValidVersion) {
        setError('Preencha o Título e a URL para pelo menos um idioma.');
        return;
    }

    if (allowedRoles.length === 0) {
        setError('Selecione pelo menos um perfil de acesso.');
        return;
    }

    const payload = {
      ...(initialData || {}),
      title: cleanedTitles,
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
    if (type === 'video') return "Cole o link do YouTube, Drive ou MP4 aqui...";
    if (type === 'image') return t('url.placeholder.image');
    return t('url.placeholder.pdf');
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="bg-surface rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-surface z-10 shrink-0">
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

        {/* Error Banner */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          
          {/* Left Column: Global Settings */}
          <div className="w-full md:w-1/3 bg-page p-6 overflow-y-auto">
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
                        w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm
                        ${allowedRoles.includes(role) 
                          ? 'bg-surface text-accent shadow-sm ring-1 ring-accent' 
                          : 'bg-surface text-muted/80 hover:text-main hover:bg-white/50'}
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
                    cursor-pointer p-4 rounded-xl flex items-center justify-between transition-colors
                    ${active 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-surface text-muted'}
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
            <div className="flex px-6 pt-4 gap-6 overflow-x-auto shrink-0">
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
                      pb-4 px-1 relative font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 outline-none
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
            <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-page/30">
              <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
                
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-main mb-1.5 block">
                      {t('title')} <span className="text-red-500">*</span>
                    </span>
                    <input 
                      type="text" 
                      placeholder={`Ex: Catálogo 2024 (${activeTab})`}
                      className="w-full p-3 rounded-lg bg-surface text-main placeholder-muted focus:ring-2 focus:ring-accent outline-none transition-all shadow-sm"
                      value={titles[activeTab] || ''}
                      onChange={e => handleTitleChange(activeTab, e.target.value)}
                    />
                  </label>

                  <div className="relative">
                     <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-border/20"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-page/30 text-xs text-muted uppercase tracking-wider font-semibold">
                         {type === 'video' ? 'Link do Vídeo' : 'Arquivo'}
                      </span>
                    </div>
                  </div>

                  <label className="block group">
                    <span className="text-sm font-semibold text-main mb-1.5 flex items-center justify-between">
                       <span>URL <span className="text-red-500">*</span></span>
                       {type === 'video' && (
                           <span className="text-[10px] font-normal bg-accent/10 text-accent px-2 py-0.5 rounded">
                               Aceita Embed Codes e Links
                           </span>
                       )}
                    </span>
                    <div className="relative">
                        <input 
                          type="text" 
                          placeholder={getUrlPlaceholder()}
                          className="w-full p-3 pl-10 rounded-lg bg-surface text-main placeholder-muted focus:ring-2 focus:ring-accent outline-none transition-all font-mono text-sm shadow-sm"
                          value={assets[activeTab]?.url || ''}
                          onChange={(e) => handleUrlPasteOrChange(activeTab, e.target.value)}
                        />
                        <LinkIcon className="absolute left-3 top-3 text-muted group-focus-within:text-accent transition-colors" size={18} />
                    </div>
                  </label>

                  {/* VIDEO PREVIEW SECTION */}
                  {type === 'video' && assets[activeTab]?.url && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <VideoPreview url={assets[activeTab]!.url!} />
                      </div>
                  )}

                  {type === 'video' && (
                    <label className="block animate-fade-in pt-2">
                      <span className="text-sm font-semibold text-main mb-1.5 block">
                        {t('asset.subtitle')} <span className="text-xs font-normal text-muted">(Opcional)</span>
                      </span>
                      <input 
                        type="text" 
                        placeholder="https://exemplo.com/legenda.vtt"
                        className="w-full p-3 rounded-lg bg-surface text-main placeholder-muted focus:ring-2 focus:ring-accent outline-none transition-all font-mono text-sm shadow-sm"
                        value={assets[activeTab]?.subtitleUrl || ''}
                        onChange={(e) => handleSubtitleChange(activeTab, e.target.value)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface flex justify-end gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-muted hover:bg-page font-medium transition-colors"
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
    </div>,
    document.body
  );
};