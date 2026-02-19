import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Material, Language, MaterialType, Role, MaterialAsset } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, FileText, Image as ImageIcon, Video, Check, Users, Shield, Link as LinkIcon, AlertCircle, Tag, Star, Globe, Clipboard, ExternalLink } from 'lucide-react';
import { TagInput } from './TagInput';
import { detectUrl, PROVIDERS, UrlDetectionResult } from '../lib/urlDetector';

// --- Provider Badge ---
const ProviderBadge = ({ provider, small = false }: { provider: string; small?: boolean }) => {
  const info = PROVIDERS.find(p => p.id === provider);
  if (!info) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg ${small ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'}`}
      style={{ background: `${info.color}15`, color: info.color }}
    >
      <span>{info.icon}</span> {info.label}
    </span>
  );
};

// --- Type Card ---
const TypeCard = ({ value, icon: Icon, label, currentType, onSelect }: {
  value: MaterialType; icon: any; label: string; currentType: MaterialType; onSelect: (val: MaterialType) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 border ${currentType === value
      ? 'bg-accent/[0.06] text-accent border-transparent'
      : 'bg-white/[0.01] text-white/30 border-transparent hover:text-white/50 hover:bg-white/[0.02]'
      }`}
  >
    <Icon size={20} />
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    {currentType === value && <Check size={12} className="text-accent" />}
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
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [points, setPoints] = useState(50);

  // URL Input State
  const [urlInput, setUrlInput] = useState('');
  const [detection, setDetection] = useState<UrlDetectionResult | null>(null);
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
      setTags(initialData.tags || []);
      setCategory(initialData.category || '');
      setPoints(initialData.points || 50);
      // Set URL from primary language
      const primaryAsset = initialData.assets['pt-br'] || initialData.assets['en-us'] || initialData.assets['es-es'];
      if (primaryAsset?.url) {
        setUrlInput(primaryAsset.url);
        const det = detectUrl(primaryAsset.url);
        setDetection(det);
      }
    }
  }, [initialData]);

  // URL Change Handler — detect source
  const handleUrlChange = (value: string) => {
    // Handle iframe paste
    let cleanValue = value;
    if (value.includes('<iframe') && value.includes('src=')) {
      const srcMatch = value.match(/src=["'](.*?)["']/);
      if (srcMatch?.[1]) cleanValue = srcMatch[1];
    }
    setUrlInput(cleanValue);

    const det = detectUrl(cleanValue);
    setDetection(det);

    if (det) {
      // Auto-select type
      setType(det.materialType);

      // Auto-fill URL for active tab
      setAssets(prev => ({
        ...prev,
        [activeTab]: { url: cleanValue, status: 'published' as const }
      }));
    }
  };

  // Paste handler
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) handleUrlChange(text);
    } catch { /* clipboard not available */ }
  };

  // Per-language URL override
  const handleLangUrlChange = (lang: Language, url: string) => {
    setAssets(prev => ({
      ...prev,
      [lang]: { url, status: 'published' as const }
    }));
  };

  const toggleRole = (role: Role) => {
    setAllowedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Build assets from URL input (use main URL if per-lang not set)
    const finalAssets: Partial<Record<Language, MaterialAsset>> = {};
    const finalTitles: Partial<Record<Language, string>> = {};
    let hasValid = false;

    languages.forEach(lang => {
      const langUrl = assets[lang]?.url?.trim() || urlInput.trim();
      const langTitle = titles[lang]?.trim();

      if (langUrl && langTitle) {
        hasValid = true;
        finalAssets[lang] = {
          url: langUrl,
          subtitleUrl: assets[lang]?.subtitleUrl,
          status: assets[lang]?.status || 'published'
        };
        finalTitles[lang] = langTitle;
      }
    });

    if (!hasValid) {
      setError('Preencha o Título e a URL para pelo menos um idioma.');
      return;
    }

    if (allowedRoles.length === 0) {
      setError('Selecione pelo menos um perfil de acesso.');
      return;
    }

    const payload = {
      ...(initialData || {}),
      title: finalTitles,
      type,
      allowedRoles,
      active,
      assets: finalAssets,
      tags,
      category,
      points
    };

    await onSave(payload);
    onClose();
  };

  const typeIcons = { pdf: FileText, image: ImageIcon, video: Video };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="bg-surface rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slide-up border border-white/[0.01]">

        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-2xl text-white heading-aura">
              {initialData ? t('edit.material') : t('add.material')}
            </h3>
            <p className="text-[11px] text-white/30 mt-1 font-medium tracking-wide">Cole o link do material para começar</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/[0.03] hover:bg-error/20 hover:text-error rounded-xl text-white/30 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-error/10 px-8 py-3 flex items-center gap-2 text-sm text-error font-medium animate-reveal">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 space-y-7 min-h-0">

          {/* === SECTION 1: URL Input === */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block flex items-center gap-2">
              <LinkIcon size={12} /> URL do Material
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Cole o link aqui — YouTube, Google Drive, Instagram, TikTok..."
                className="w-full bg-white/[0.015] border border-white/[0.01] rounded-2xl px-5 py-4 pr-24 text-white placeholder-white/10 hover:bg-white/[0.025] focus:bg-white/[0.03] outline-none transition-all text-sm"
                value={urlInput}
                onChange={e => handleUrlChange(e.target.value)}
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-accent/10 text-white/30 hover:text-accent transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Clipboard size={11} /> Colar
                </button>
              </div>
            </div>

            {/* Compatible Sources (only show when no URL) */}
            {!urlInput && (
              <div className="flex flex-wrap gap-2 mt-4">
                {PROVIDERS.map(p => (
                  <span key={p.id} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.02] text-white/20 flex items-center gap-1.5">
                    <span>{p.icon}</span> {p.label}
                  </span>
                ))}
              </div>
            )}

            {/* Detection Result */}
            {detection && urlInput && (
              <div className="mt-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl p-4 animate-reveal">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ProviderBadge provider={detection.provider} />
                    <span className="text-[10px] text-success font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check size={10} /> Detectado
                    </span>
                  </div>
                  <a href={urlInput} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Thumbnail preview for YouTube */}
                {detection.thumbnailUrl && detection.provider === 'youtube' && (
                  <div className="relative rounded-xl overflow-hidden aspect-video max-h-40 mb-3">
                    <img src={detection.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Video size={20} className="text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-white/30 font-medium">Tipo detectado:</span>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                    {React.createElement(typeIcons[detection.materialType], { size: 12 })}
                    {detection.materialType}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* === SECTION 2: Type Override === */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block">Tipo do Material</label>
            <div className="grid grid-cols-3 gap-3">
              <TypeCard value="pdf" icon={FileText} label="PDF" currentType={type} onSelect={setType} />
              <TypeCard value="image" icon={ImageIcon} label="Imagem" currentType={type} onSelect={setType} />
              <TypeCard value="video" icon={Video} label="Vídeo" currentType={type} onSelect={setType} />
            </div>
          </div>

          {/* === SECTION 3: Title per language === */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block flex items-center gap-2">
              <Globe size={12} /> Título por Idioma
            </label>

            {/* Language Tabs */}
            <div className="flex gap-4 mb-4">
              {languages.map(lang => {
                const flag = lang === 'pt-br' ? '🇧🇷' : lang === 'en-us' ? '🇺🇸' : '🇪🇸';
                const label = lang === 'pt-br' ? 'Português' : lang === 'en-us' ? 'English' : 'Español';
                const hasContent = !!(titles[lang]?.trim());
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTab(lang)}
                    className={`relative pb-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === lang ? 'text-accent' : 'text-white/30 hover:text-white/60'}`}
                  >
                    <span>{flag}</span> {label}
                    {hasContent && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
                    {activeTab === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                  </button>
                );
              })}
            </div>

            {/* Title Input */}
            <input
              type="text"
              placeholder={`Título do material (${activeTab})`}
              className="w-full bg-white/[0.015] border border-white/[0.01] rounded-xl px-5 py-3.5 text-white placeholder-white/10 hover:bg-white/[0.025] focus:bg-white/[0.03] outline-none transition-all text-sm"
              value={titles[activeTab] || ''}
              onChange={e => setTitles(prev => ({ ...prev, [activeTab]: e.target.value }))}
            />

            {/* Per-language URL override (collapsible) */}
            {activeTab !== 'pt-br' && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder={`URL diferente para ${activeTab} (opcional — usa a URL principal se vazio)`}
                  className="w-full bg-white/[0.01] border border-transparent rounded-xl px-5 py-3 text-white/60 placeholder-white/10 hover:bg-white/[0.02] focus:bg-white/[0.03] outline-none transition-all text-xs font-mono"
                  value={assets[activeTab]?.url || ''}
                  onChange={e => handleLangUrlChange(activeTab, e.target.value)}
                />
              </div>
            )}
          </div>

          {/* === SECTION 4: Category & Tags === */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block">Categoria</label>
              <input
                type="text"
                list="categories"
                placeholder="Ex: Marketing, Vendas..."
                className="w-full bg-white/[0.015] border border-white/[0.01] rounded-xl px-4 py-3 text-sm text-white placeholder-white/10 hover:bg-white/[0.025] focus:bg-white/[0.03] outline-none transition-all"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
              <datalist id="categories">
                <option value="Marketing" />
                <option value="Produtos" />
                <option value="Vendas" />
                <option value="Institucional" />
                <option value="Treinamento" />
              </datalist>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block flex items-center gap-2">
                <Star size={12} /> Pontos XP
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                step={10}
                className="w-full bg-white/[0.015] border border-white/[0.01] rounded-xl px-4 py-3 text-sm text-white placeholder-white/10 hover:bg-white/[0.025] focus:bg-white/[0.03] outline-none transition-all appearance-none"
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block flex items-center gap-2">
              <Tag size={12} /> Tags
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* === SECTION 5: Permissions & Status === */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block flex items-center gap-2">
                <Users size={12} /> Permissões
              </label>
              <div className="space-y-2">
                {allRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm border ${allowedRoles.includes(role)
                      ? 'bg-accent/[0.06] text-accent border-transparent'
                      : 'bg-white/[0.01] text-white/30 border-transparent hover:text-white/50 hover:bg-white/[0.02]'
                      }`}
                  >
                    <span className="font-medium">{t(`role.${role}`)}</span>
                    {allowedRoles.includes(role) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 block flex items-center gap-2">
                <Shield size={12} /> Status
              </label>
              <div
                onClick={() => setActive(!active)}
                className={`cursor-pointer p-4 rounded-xl flex items-center justify-between transition-all border ${active
                  ? 'bg-success/[0.06] text-success border-transparent'
                  : 'bg-white/[0.01] text-white/30 border-transparent hover:bg-white/[0.02]'
                  }`}
              >
                <span className="font-medium text-sm">{active ? t('active') : t('inactive')}</span>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-success' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? 'left-5' : 'left-1'}`} />
                </div>
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-8 py-5 flex justify-end gap-3 shrink-0 border-t border-white/[0.03]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.05] font-medium transition-all text-sm"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-accent text-white hover:opacity-90 font-bold flex items-center gap-2 shadow-lg shadow-accent/20 transition-all active:scale-95 text-sm"
          >
            <Save size={16} />
            {t('save')}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};