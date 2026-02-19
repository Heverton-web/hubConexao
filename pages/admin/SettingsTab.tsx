import React, { useState } from 'react';
import { SystemConfig, ColorScheme, Role, Language } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useBrand } from '../../contexts/BrandContext';
import { ChevronRight, Sun, Moon, Save, ExternalLink, Copy, CheckCircle, Share2, Image as ImageIcon, X, Check, Eye, EyeOff, Users } from 'lucide-react';

import { Type, Webhook, Palette, Smartphone, Key, ShieldCheck, Trash2, Plus, Clock, Layers, Sliders, Droplet } from 'lucide-react';
import { mockDb } from '../../lib/mockDb';
import { ApiKey } from '../../types';

// --- External Helper Components ---
const AuraColorPicker = ({ label, value, onChange, hint }: { label: string, value: string, onChange: (val: string) => void, hint: string }) => {
    // Helper para extrair opacidade e cor base do valor atual
    const parseColor = (val: string) => {
        if (val.startsWith('rgba')) {
            const match = val.match(/rgba\((.*),\s*(.*)\)/);
            if (match) return { base: match[1].trim(), opacity: parseFloat(match[2]) };
        }
        if (val.startsWith('var')) {
            const match = val.match(/var\((--.*?)\)/);
            if (match) return { base: match[1], opacity: 1 };
        }
        return { base: val, opacity: 1 };
    };

    const { base, opacity } = parseColor(value);
    const [isVarMode, setIsVarMode] = useState(value.includes('var--') || value.includes('rgb-'));

    const systemVars = [
        { label: 'Accent (Neon)', var: 'var(--color-primary-rgb)', hex: '#00D1FF' },
        { label: 'Lume (Champagne)', var: 'var(--color-lume)', hex: '#E8E1D1' },
        { label: 'Success (Verde)', var: 'var(--color-success)', hex: '#00F5A0' },
        { label: 'Surface (Painel)', var: 'var(--color-surface-rgb)', hex: '#121418' },
        { label: 'Muted (Cinza)', var: 'var(--color-muted-rgb)', hex: '#8E9196' }
    ];

    const updateValue = (newBase: string, newOpacity: number) => {
        if (newOpacity >= 1) {
            onChange(newBase);
        } else {
            // Se for variável que já é RGB (como --color-primary-rgb), usa direto
            const cleanBase = newBase.includes('var(') ? newBase.replace('var(', '').replace(')', '') : newBase;
            if (cleanBase.startsWith('--')) {
                onChange(`rgba(var(${cleanBase}), ${newOpacity})`);
            } else {
                // Para HEX, idealmente converteríamos para RGB aqui, mas para o Admin simplificaremos
                // assumindo que o sistema cuida do parse de variáveis. Para HEX diretos com opacidade:
                onChange(`rgba(${newBase}, ${newOpacity})`); // Nota: Isso exige hexToRgb no injetor
            }
        }
    };

    return (
        <div className="aura-glass p-4 rounded-3xl space-y-4 group">
            <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{label}</p>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                    <button
                        onClick={() => setIsVarMode(false)}
                        className={`p-1 rounded ${!isVarMode ? 'bg-accent/20 text-accent' : 'text-white/20'}`}
                    >
                        <Droplet size={10} />
                    </button>
                    <button
                        onClick={() => setIsVarMode(true)}
                        className={`p-1 rounded ${isVarMode ? 'bg-accent/20 text-accent' : 'text-white/20'}`}
                    >
                        <Sliders size={10} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden" style={{ background: value.includes('var') ? 'rgba(var(--color-primary-rgb), 0.5)' : value }}>
                    <input
                        type="color"
                        value={base.startsWith('#') ? base : '#00D1FF'}
                        onChange={e => updateValue(e.target.value, opacity)}
                        disabled={isVarMode}
                        className={`absolute inset-0 opacity-0 cursor-pointer ${isVarMode ? 'hidden' : ''}`}
                    />
                    {isVarMode && <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent"><Sliders size={16} /></div>}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    {isVarMode ? (
                        <select
                            value={base.includes('--') ? `var(${base})` : base}
                            onChange={e => updateValue(e.target.value, opacity)}
                            className="w-full bg-black/30 rounded-lg text-[10px] text-white p-2 outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Selecionar Variável</option>
                            {systemVars.map(v => (
                                <option key={v.var} value={v.var}>{v.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            className="w-full bg-black/30 rounded-lg text-[10px] text-white font-mono p-2 outline-none"
                        />
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-tighter">
                    <span>Opacidade</span>
                    <span>{Math.round(opacity * 100)}%</span>
                </div>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={opacity}
                    onChange={e => updateValue(base, parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent"
                />
            </div>
            <p className="text-[8px] text-white/10 italic leading-tight">{hint}</p>
        </div>
    );
};

const ColorInput = AuraColorPicker; // Alias para compatibilidade rápida

const EffectSlider = ({ label, value, min, max, step, unit = '', onChange, hint }: { label: string, value: number, min: number, max: number, step: number, unit?: string, onChange: (val: number) => void, hint: string }) => (
    <div className="aura-glass p-4 rounded-2xl group transition-all hover:bg-white/[0.03]">
        <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">{label}</p>
            <span className="text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-md">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <p className="text-[8px] text-white/10 mt-3 truncate group-hover:text-white/20 transition-colors uppercase tracking-tighter">{hint}</p>
    </div>
);

const ThemeEditorSection: React.FC<{ title: string, description?: string, children: React.ReactNode, columns?: string }> = ({ title, description, children, columns = 'sm:grid-cols-2 lg:grid-cols-3' }) => (
    <div className="space-y-4">
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-accent/40 tracking-[0.3em] pl-1 border-l-2 border-accent/20 ml-1">{title}</p>
            {description && (
                <p className="text-[9px] text-white/20 pl-4 leading-relaxed italic">{description}</p>
            )}
        </div>
        <div className={`grid gap-4 ${columns}`}>
            {children}
        </div>
    </div>
);

const TextInput = ({ label, value, onChange, hint }: { label: string, value: string, onChange: (val: string) => void, hint: string }) => (
    <div className="aura-glass p-2 rounded-2xl group transition-all hover:bg-white/[0.03]">
        <div className="flex justify-between items-center px-2 py-1">
            <p className="text-[10px] font-black uppercase text-white/30 truncate">{label}</p>
        </div>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-black/20 p-2 rounded-xl text-[10px] text-white font-mono outline-none focus:border-accent/40"
        />
    </div>
);

const LivePreview = ({ themeName, scheme }: { themeName: string, scheme: ColorScheme }) => (
    <div className="rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="px-5 py-3 bg-white/[0.03] text-[9px] font-black uppercase text-white/40 tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
            Aura Live Preview — {themeName}
        </div>
        <div className="p-6" style={{ backgroundColor: scheme.background }}>
            <div className="rounded-2xl p-5 space-y-4 shadow-lg" style={{ backgroundColor: scheme.surface, borderColor: scheme.border, borderWidth: '1px' }}>
                <p className="text-sm font-black tracking-tight" style={{ color: scheme.textMain }}>Interface Prototipada</p>
                <p className="text-xs font-medium opacity-60" style={{ color: scheme.textMain }}>Experiência de usuário fluida e responsiva.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    <div className="text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: scheme.accent }}>Ação</div>
                    <div className="text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest" style={{ color: scheme.success, backgroundColor: scheme.success + '15', border: `1px solid ${scheme.success}30` }}>Online</div>
                </div>
                <div className="flex gap-3 mt-6 justify-end pt-4">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center opacity-40" style={{ color: scheme.textMain }}><X size={14} /></div>
                    <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center" style={{ color: scheme.accent }}><Check size={14} /></div>
                </div>
            </div>
        </div>
    </div>
);

export const SettingsTab: React.FC = () => {
    const { t } = useLanguage();
    const { config, updateConfig } = useBrand();
    const { addToast } = useToast();

    const [localConfig, setLocalConfig] = useState<SystemConfig>(config);
    const [settingsTab, setSettingsTab] = useState<'brand' | 'integrations' | 'api-keys' | 'invites' | 'registration'>('brand');
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [isLoadingKeys, setIsLoadingKeys] = useState(false);

    // Initial load for API keys
    React.useEffect(() => {
        if (settingsTab === 'api-keys') {
            loadApiKeys();
        }
    }, [settingsTab]);

    const loadApiKeys = async () => {
        setIsLoadingKeys(true);
        try {
            const keys = await mockDb.getApiKeys();
            setApiKeys(keys);
        } catch (e) {
            addToast('Erro ao carregar chaves de API', 'error');
        } finally {
            setIsLoadingKeys(false);
        }
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) return;
        try {
            const key = await mockDb.createApiKey(newKeyName);
            setApiKeys([key, ...apiKeys]);
            setNewKeyName('');
            addToast('Chave de API gerada com sucesso!', 'success');
        } catch (e) {
            addToast('Erro ao gerar chave', 'error');
        }
    };

    const handleDeleteKey = async (id: string) => {
        if (!confirm('Tem certeza que deseja revogar esta chave?')) return;
        try {
            await mockDb.deleteApiKey(id);
            setApiKeys(apiKeys.filter(k => k.id !== id));
            addToast('Chave revogada', 'success');
        } catch (e) {
            addToast('Erro ao revogar chave', 'error');
        }
    };

    const handleSaveSettings = async () => {
        try {
            await updateConfig(localConfig);
            addToast('Configurações salvas e aplicadas!', 'success');
        } catch (e: any) {
            addToast('Erro ao salvar configurações: ' + e.message, 'error');
        }
    };

    const handleCopyLink = async (url: string, role: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedLink(role);
            addToast('Link copiado!', 'success');
            setTimeout(() => setCopiedLink(null), 2000);
        } catch {
            addToast('Erro ao copiar link', 'error');
        }
    };

    const renderSettingsSidebarItem = (id: typeof settingsTab, label: string, Icon: any) => (
        <button
            onClick={() => setSettingsTab(id)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 mb-2 group relative overflow-hidden
        ${settingsTab === id
                    ? 'bg-accent/5 text-accent shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.02)]'
                    : 'text-white/20 hover:text-white/60 hover:bg-white/[0.02]'}
      `}
        >
            <div className="flex items-center gap-4 relative z-10">
                <Icon size={18} className={settingsTab === id ? "animate-pulse" : "opacity-50 group-hover:opacity-100 transition-opacity"} />
                {label}
            </div>
            {settingsTab === id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-accent rounded-l-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>
            )}
        </button>
    );

    return (
        <div className="animate-reveal pb-12">
            <div className="flex flex-col xl:flex-row gap-10">
                {/* Sidebar Menu - Aura Glass Sidebar */}
                <aside className="w-full xl:w-80 shrink-0">
                    <div className="aura-glass p-3 rounded-[2.5rem] sticky top-8">
                        <div className="px-5 py-4 mb-2">
                            <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Configurações</p>
                        </div>
                        <div className="space-y-1">
                            {renderSettingsSidebarItem('brand', 'Identidade Visual', Type)}
                            {renderSettingsSidebarItem('integrations', 'Integrações', Webhook)}
                            {renderSettingsSidebarItem('api-keys', 'Chaves de API', Key)}
                            {renderSettingsSidebarItem('invites', 'Convites de Cadastro', Share2)}
                            {renderSettingsSidebarItem('registration', 'Perfis de Registro', Users)}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-8">
                    {/* Header & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/[0.03] flex items-center justify-center text-accent shadow-lg shadow-accent/[0.02]">
                                {settingsTab === 'brand' && <Type size={24} />}
                                {settingsTab === 'integrations' && <Webhook size={24} />}
                                {settingsTab === 'api-keys' && <Key size={24} />}
                                {settingsTab === 'invites' && <Share2 size={24} />}
                                {settingsTab === 'registration' && <Users size={24} />}
                            </div>
                            <div>
                                <h3 className="text-2xl heading-aura text-white">
                                    {settingsTab === 'brand' && 'Identidade Visual'}
                                    {settingsTab === 'integrations' && 'Integrações'}
                                    {settingsTab === 'api-keys' && 'API Hub Connect'}
                                    {settingsTab === 'invites' && 'Convites de Cadastro'}
                                    {settingsTab === 'registration' && 'Perfis de Registro'}
                                </h3>
                                <p className="text-[11px] text-white/20 font-medium tracking-wider uppercase mt-1">Gerenciamento de sistema</p>
                            </div>
                        </div>

                        {settingsTab !== 'api-keys' && settingsTab !== 'invites' && (
                            <button
                                onClick={handleSaveSettings}
                                className="btn-aura-lume px-8 py-3.5 flex items-center gap-3 active:scale-95 transition-transform"
                            >
                                <Save size={18} /> <span>Salvar Alterações</span>
                            </button>
                        )}
                    </div>

                    {settingsTab === 'brand' && (
                        <div className="space-y-12 animate-reveal">
                            {/* 1. Identidade Principal */}
                            <div className="aura-glass p-10 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-2 pl-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Marca & Identidade</h4>
                                </div>
                                <p className="text-[11px] text-white/20 mb-8 pl-1 leading-relaxed max-w-2xl">
                                    Define a presença institucional da plataforma. O nome e o logo são sincronizados globalmente, aparecendo em cabeçalhos, e-mails de sistema e documentos exportados.
                                </p>
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Nome da Aplicação</label>
                                    <input
                                        type="text"
                                        value={localConfig.appName}
                                        onChange={e => setLocalConfig({ ...localConfig, appName: e.target.value })}
                                        className="aura-input w-full"
                                        placeholder="Ex: Hub Conexão"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">URL do Logo</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={localConfig.logoUrl || ''}
                                            onChange={e => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
                                            className="aura-input flex-1"
                                        />
                                        <div className="w-14 h-14 aura-glass rounded-2xl flex items-center justify-center shrink-0">
                                            {localConfig.logoUrl ? <img src={localConfig.logoUrl} className="w-8 h-8 object-contain" /> : <ImageIcon size={20} className="text-white/20" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* 2. Cores do HUB */}
                            <div className="aura-glass p-10 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-2 pl-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Cores do HUB</h4>
                                </div>
                                <p className="text-[11px] text-white/20 mb-10 pl-1 leading-relaxed max-w-2xl">
                                    Arquitetura cromática do ecossistema. As cores de <span className="text-white/40">Estrutura e Bordas</span> definem a profundidade dos elementos e a separação visual entre seções, garantindo foco e clareza na hierarquia de informações.
                                </p>
                                <div className="max-w-4xl mx-auto space-y-12">
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="space-y-12">
                                            <ThemeEditorSection
                                                title="Estrutura & Base"
                                                description="Define a fundação visual. Altera o fundo da página, o preenchimento de modais e as linhas de contorno que separam os conteúdos."
                                                columns="sm:grid-cols-2"
                                            >
                                                <ColorInput label="Background" value={localConfig.theme.background} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, background: v } })} hint="Fundo geral profundo" />
                                                <ColorInput label="Surface" value={localConfig.theme.surface} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, surface: v } })} hint="Modais e containers" />
                                                <ColorInput label="Borders" value={localConfig.theme.border} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, border: v } })} hint="Contornos 2%" />
                                                <ColorInput label="Glass BG" value={localConfig.theme.glass} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, glass: v } })} hint="Fundo do vidro (rgba)" />
                                            </ThemeEditorSection>

                                            <ThemeEditorSection
                                                title="Tipografia Premium"
                                                description="Gerencia a legibilidade. Altera a cor de títulos (Main) e labels secundárias (Muted) em todo o sistema."
                                                columns="sm:grid-cols-2"
                                            >
                                                <ColorInput label="Text Main" value={localConfig.theme.textMain} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, textMain: v } })} hint="Títulos e informações" />
                                                <ColorInput label="Text Muted" value={localConfig.theme.textMuted} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, textMuted: v } })} hint="Subtítulos e labels" />
                                            </ThemeEditorSection>
                                        </div>

                                        <div className="space-y-12">
                                            <ThemeEditorSection
                                                title="Identidade (Neon)"
                                                description="Altera a cor principal de destaque e o brilho que emana dos elementos ativos e botões de ação."
                                                columns="sm:grid-cols-2"
                                            >
                                                <ColorInput label="Accent" value={localConfig.theme.accent} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, accent: v } })} hint="Cor de ação principal" />
                                                <ColorInput label="Glow Neon" value={localConfig.theme.glow} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, glow: v } })} hint="Raio de luz neon" />
                                            </ThemeEditorSection>

                                            <ThemeEditorSection
                                                title="Aura Lume"
                                                description="Estilo exclusivo HUB. Define as tonalidades de dourado/champagne usadas em botões de status premium e menus de destaque."
                                                columns="sm:grid-cols-2"
                                            >
                                                <ColorInput label="Lume Primary" value={localConfig.theme.lume} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, lume: v } })} hint="Botão Champagne" />
                                                <ColorInput label="Lume Text" value={localConfig.theme.lumeText} onChange={v => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, lumeText: v } })} hint="Texto sobre Champagne" />
                                            </ThemeEditorSection>
                                        </div>
                                    </div>
                                    <LivePreview themeName="Arquitetura de Cores" scheme={localConfig.theme} />
                                </div>
                            </div>

                            {/* 3. Arquitetura de Efeitos */}
                            <div className="aura-glass p-10 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-2 pl-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Arquitetura de Efeitos</h4>
                                </div>
                                <p className="text-[11px] text-white/20 mb-10 pl-1 leading-relaxed max-w-2xl">
                                    Controla a física e o dinamismo da interface. O <span className="text-white/40">Backdrop Blur e Hover Lift</span> criam uma experiência tátil e moderna, tornando a navegação mais viva e respondendo fisicamente aos comandos do usuário.
                                </p>
                                <div className="max-w-4xl mx-auto space-y-12">
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="space-y-10">
                                            <ThemeEditorSection
                                                title="Física Óptica (Glass)"
                                                description="Simula propriedades de vidro. Ajusta o grau de desfoque e saturação das cores que passam por trás dos painéis translúcidos."
                                                columns="sm:grid-cols-1"
                                            >
                                                <EffectSlider label="Backdrop Blur" value={localConfig.effects.glassBlur} min={0} max={100} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, effects: { ...localConfig.effects, glassBlur: v } })} hint="Desfoque do fundo" />
                                                <EffectSlider label="Color Saturation" value={localConfig.effects.glassSaturate} min={100} max={300} step={5} unit="%" onChange={v => setLocalConfig({ ...localConfig, effects: { ...localConfig.effects, glassSaturate: v } })} hint="Vivacidade" />
                                            </ThemeEditorSection>

                                            <ThemeEditorSection
                                                title="Interação (Física)"
                                                description="Altera como o sistema reage ao toque. Define a altura do levante (lift) e a velocidade de surgimento das animações."
                                                columns="sm:grid-cols-1"
                                            >
                                                <EffectSlider label="Hover Lift" value={localConfig.effects.hoverLift} min={0} max={20} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, effects: { ...localConfig.effects, hoverLift: v } })} hint="Levitação ao passar mouse" />
                                                <EffectSlider label="Reveal Duration" value={localConfig.effects.revealDuration} min={0.2} max={2.5} step={0.1} unit="s" onChange={v => setLocalConfig({ ...localConfig, effects: { ...localConfig.effects, revealDuration: v } })} hint="Tempo de animação" />
                                            </ThemeEditorSection>
                                        </div>

                                        <div className="space-y-10">
                                            <ThemeEditorSection
                                                title="Atmosfera & Mood"
                                                description="Cria o clima da interface. Altera a força do brilho neon global e a densidade da textura orgânica (grain) do fundo."
                                                columns="sm:grid-cols-1"
                                            >
                                                <EffectSlider label="Glow Intensity" value={localConfig.effects.glowIntensity} min={0} max={60} step={2} unit="px" onChange={v => setLocalConfig({ ...localConfig, effects: { ...localConfig.effects, glowIntensity: v } })} hint="Raio neon principal" />
                                                <EffectSlider label="Film Grain" value={localConfig.effects.grainOpacity} min={0} max={0.15} step={0.005} onChange={v => setLocalConfig({ ...localConfig, effects: { ...localConfig.effects, grainOpacity: v } })} hint="Ruído orgânico" />
                                            </ThemeEditorSection>

                                            <div className="aura-glass p-8 rounded-3xl flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
                                                <div className="w-full p-4 rounded-xl aura-glass transition-all duration-aura group-hover:-translate-y-2">
                                                    <p className="text-[9px] font-black tracking-widest text-accent mb-2 uppercase">Preview</p>
                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-accent w-2/3 animate-shimmer-fast"></div>
                                                    </div>
                                                </div>
                                                <p className="text-[8px] text-white/20 uppercase tracking-widest">Teste Lift & Glow</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Design de Elementos */}
                            <div className="aura-glass p-10 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-2 pl-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Design de Elementos</h4>
                                </div>
                                <p className="text-[11px] text-white/20 mb-10 pl-1 leading-relaxed max-w-2xl">
                                    Padronização anatômica de botões, inputs e containers. Ajustar o <span className="text-white/40">Radius</span> aqui altera globalmente a estética da plataforma, de um visual técnico e rígido para um estilo orgânico e suave.
                                </p>
                                <div className="max-w-5xl mx-auto space-y-16">
                                    {/* Buttons & Cards */}
                                    <div className="grid lg:grid-cols-2 gap-12">
                                        <div className="space-y-12">
                                            <ThemeEditorSection
                                                title="Botões & Interação"
                                                description="Define a curvatura e a cor de preenchimento padrão de todos os botões clicáveis da plataforma."
                                                columns="sm:grid-cols-2"
                                            >
                                                <EffectSlider label="Radius" value={parseInt(localConfig.elements.button.radius)} min={0} max={50} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, button: { ...localConfig.elements.button, radius: `${v}px` } } })} hint="Arredondamento" />
                                                <EffectSlider label="Borda" value={parseInt(localConfig.elements.button.borderWidth)} min={0} max={5} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, button: { ...localConfig.elements.button, borderWidth: `${v}px` } } })} hint="Espessura do contorno" />
                                                <ColorInput label="Base Background" value={localConfig.elements.button.bg} onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, button: { ...localConfig.elements.button, bg: v } } })} hint="Cor base" />
                                            </ThemeEditorSection>

                                            <ThemeEditorSection
                                                title="Cards & Containers"
                                                description="Altera o arredondamento dos painéis de conteúdo e a cor sutil das suas bordas de separação."
                                                columns="sm:grid-cols-2"
                                            >
                                                <EffectSlider label="Card Radius" value={parseInt(localConfig.elements.container.radius)} min={0} max={60} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, container: { ...localConfig.elements.container, radius: `${v}px` } } })} hint="Bordas dos cards" />
                                                <EffectSlider label="Borda Card" value={parseInt(localConfig.elements.container.borderWidth)} min={0} max={10} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, container: { ...localConfig.elements.container, borderWidth: `${v}px` } } })} hint="Espessura das divisórias" />
                                                <ColorInput label="Border Color" value={localConfig.elements.container.borderColor} onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, container: { ...localConfig.elements.container, borderColor: v } } })} hint="Contorno principal" />
                                            </ThemeEditorSection>
                                        </div>

                                        <div className="space-y-12">
                                            <ThemeEditorSection
                                                title="Inputs & Formulários"
                                                description="Personaliza a aparência de campos de texto e seletores, garantindo harmonia visual com o restante dos elementos."
                                                columns="sm:grid-cols-2"
                                            >
                                                <EffectSlider label="Radius" value={parseInt(localConfig.elements.input.radius)} min={0} max={30} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, input: { ...localConfig.elements.input, radius: `${v}px` } } })} hint="Bordas dos campos" />
                                                <EffectSlider label="Borda Input" value={parseInt(localConfig.elements.input.borderWidth)} min={0} max={5} step={1} unit="px" onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, input: { ...localConfig.elements.input, borderWidth: `${v}px` } } })} hint="Espessura da linha" />
                                                <ColorInput label="Base Color" value={localConfig.elements.input.bg} onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, input: { ...localConfig.elements.input, bg: v } } })} hint="Cor do fundo" />
                                            </ThemeEditorSection>

                                            <ThemeEditorSection
                                                title="Ícones & Navegação"
                                                description="Controla as cores dos glifos e ícones em estados de repouso e quando o usuário passa o mouse."
                                                columns="sm:grid-cols-2"
                                            >
                                                <AuraColorPicker label="Cor Padrão" value={localConfig.elements.icon.color} onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, icon: { ...localConfig.elements.icon, color: v } } })} hint="Ícones inativos" />
                                                <AuraColorPicker label="Cor Hover" value={localConfig.elements.icon.hoverColor} onChange={v => setLocalConfig({ ...localConfig, elements: { ...localConfig.elements, icon: { ...localConfig.elements.icon, hoverColor: v } } })} hint="Destaque ao interagir" />
                                            </ThemeEditorSection>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'integrations' && (
                        <div className="space-y-8 animate-reveal">
                            {/* n8n Webhook */}
                            <div className="aura-glass p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/[0.03] flex items-center justify-center text-purple-400">
                                        <Webhook size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white tracking-wide">Automação (n8n / Zapier)</h4>
                                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Webhooks de sincronização</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">URL do Webhook Master</label>
                                    <div className="flex gap-0 group">
                                        <div className="px-5 bg-white/[0.01] rounded-l-2xl text-accent font-black text-[10px] flex items-center tracking-widest opacity-80">POST</div>
                                        <input
                                            type="text"
                                            placeholder="https://n8n.seu-dominio.com/webhook/..."
                                            value={localConfig.webhookUrl || ''}
                                            onChange={e => setLocalConfig({ ...localConfig, webhookUrl: e.target.value })}
                                            className="aura-input flex-1 rounded-l-none"
                                        />
                                    </div>
                                    <p className="text-[11px] text-white/20 italic mt-4 leading-relaxed pl-1">
                                        * O Hub enviará notificações de eventos para processamento externo no seu ERP.
                                    </p>
                                </div>
                            </div>

                            {/* WhatsApp Integration */}
                            <div className="aura-glass p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/[0.03] flex items-center justify-center text-green-400">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white tracking-wide">Evolution API</h4>
                                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Notificações WhatsApp</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">API Key</label>
                                        <input
                                            type="password"
                                            value={localConfig.whatsappApiKey || ''}
                                            onChange={e => setLocalConfig({ ...localConfig, whatsappApiKey: e.target.value })}
                                            className="aura-input w-full"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Nome da Instância</label>
                                        <input
                                            type="text"
                                            placeholder="ex: hub-conexao"
                                            value={localConfig.whatsappInstance || ''}
                                            onChange={e => setLocalConfig({ ...localConfig, whatsappInstance: e.target.value })}
                                            className="aura-input w-full"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-white/20 italic mt-6 leading-relaxed pl-1">
                                    * Ativa o envio automático de avisos de materiais para consultores via WhatsApp.
                                </p>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'api-keys' && (
                        <div className="space-y-8 animate-reveal">
                            <div className="aura-glass p-10 rounded-[2.5rem]">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/[0.03] flex items-center justify-center text-indigo-400">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white tracking-wide">Sync Tokens</h4>
                                        <p className="text-[11px] text-white/30 font-medium uppercase tracking-[0.2em] mt-1">Sincronização ERP (Protheus/TOTVS)</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                    <input
                                        type="text"
                                        placeholder="Nome da Integração (ex: Protheus Produção)"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        className="aura-input flex-1"
                                    />
                                    <button
                                        onClick={handleCreateKey}
                                        className="btn-aura-lume px-8 py-3.5 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                                    >
                                        <Plus size={20} /> <span className="whitespace-nowrap">Gerar Token</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {isLoadingKeys ? (
                                        <div className="text-center py-12 text-white/20 italic animate-pulse">Estabelecendo conexão segura...</div>
                                    ) : apiKeys.length === 0 ? (
                                        <div className="text-center py-16 text-white/10 rounded-[2rem] flex flex-col items-center gap-4">
                                            <Key size={32} className="opacity-20" />
                                            <p className="text-sm font-medium tracking-wide">Nenhuma chave de API ativa no momento.</p>
                                        </div>
                                    ) : (
                                        apiKeys.map(apiKey => (
                                            <div key={apiKey.id} className="bg-white/[0.02] p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.03] transition-colors group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-accent/[0.03] flex items-center justify-center text-accent shrink-0 group-hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.02)] transition-all">
                                                        <Key size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-lg tracking-tight">{apiKey.name}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <code className="text-[11px] bg-black/40 px-3 py-1.5 rounded-xl text-accent/80 font-mono tracking-wider">
                                                                {apiKey.key.substring(0, 16)}••••••••
                                                            </code>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(apiKey.key);
                                                                    addToast('Chave completa copiada!', 'success');
                                                                }}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-accent hover:bg-accent/10 transition-all"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-10 pt-6 md:pt-0">
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center justify-end gap-2 mb-2">
                                                            <Clock size={12} className="opacity-50" /> Criada em {new Date(apiKey.createdAt).toLocaleDateString()}
                                                        </p>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(0,245,160,0.5)]"></div>
                                                            <p className="text-[10px] text-white/40 font-medium">Ativa • {apiKey.lastUsedAt ? `Último uso: ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : 'Sem uso registrado'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteKey(apiKey.id)}
                                                        className="w-11 h-11 rounded-xl flex items-center justify-center text-error/40 hover:text-error hover:bg-error/10 transition-all"
                                                        title="Revogar Chave"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}





                    {/* Invites */}
                    {settingsTab === 'invites' && (
                        <div className="aura-glass p-10 rounded-[2.5rem] animate-reveal">
                            <p className="text-sm text-white/40 mb-10 tracking-wide">Compartilhe os convites exclusivos para cadastro direto de novos perfis.</p>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {(['client', 'distributor', 'consultant', 'super_admin'] as Role[]).map(role => {
                                    const fullUrl = `${window.location.origin}/login?role=${role}`;
                                    return (
                                        <div key={role} className="bg-white/[0.02] p-6 rounded-[2rem] flex flex-col hover:bg-white/[0.03] transition-all group">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                                    <Share2 size={18} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">{t(`role.${role}`)}</span>
                                            </div>
                                            <div className="mt-auto space-y-4">
                                                <div className="relative">
                                                    <input readOnly value={fullUrl} className="w-full bg-black/40 p-3.5 pr-10 rounded-xl text-[10px] text-white/30 font-mono outline-none" />
                                                    <button
                                                        onClick={() => window.open(fullUrl, '_blank')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleCopyLink(fullUrl, role)}
                                                    className={`w-full py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${copiedLink === role ? 'bg-success text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
                                                >
                                                    {copiedLink === role ? <><CheckCircle size={16} /> Link Copiado</> : <><Copy size={16} /> Copiar Convite</>}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Registration Roles */}
                    {settingsTab === 'registration' && (
                        <div className="aura-glass p-10 rounded-[2.5rem] animate-reveal">
                            <p className="text-sm text-white/40 mb-10 tracking-wide">Controle quais perfis ficam visíveis na tela de registro e nos botões de acesso rápido da página de login.</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {(['client', 'distributor', 'consultant', 'super_admin'] as Role[]).map(role => {
                                    const isEnabled = (localConfig.registrationRoles || ['client', 'distributor', 'consultant', 'super_admin']).includes(role);
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => {
                                                const current = localConfig.registrationRoles || ['client', 'distributor', 'consultant', 'super_admin'];
                                                const updated = isEnabled
                                                    ? current.filter(r => r !== role)
                                                    : [...current, role];
                                                setLocalConfig({ ...localConfig, registrationRoles: updated });
                                            }}
                                            className={`p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all group ${isEnabled
                                                    ? 'bg-accent/5 hover:bg-accent/10'
                                                    : 'bg-white/[0.02] hover:bg-white/[0.04] opacity-40'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isEnabled
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'bg-white/[0.03] text-white/20'
                                                }`}>
                                                {isEnabled ? <Eye size={22} /> : <EyeOff size={22} />}
                                            </div>
                                            <div className="text-center">
                                                <p className={`text-xs font-black uppercase tracking-[0.15em] ${isEnabled ? 'text-white' : 'text-white/30'
                                                    }`}>{t(`role.${role}`)}</p>
                                                <p className={`text-[9px] mt-1.5 font-medium ${isEnabled ? 'text-success' : 'text-white/15'
                                                    }`}>{isEnabled ? '● Visível' : '○ Oculto'}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-10 p-5 bg-white/[0.015] rounded-2xl">
                                <p className="text-[10px] text-white/25 leading-relaxed">
                                    <span className="text-accent/60 font-bold">Nota:</span> Perfis desabilitados não aparecerão no seletor de cadastro público nem nos botões de acesso rápido da página de login. Convites diretos por link continuam funcionando normalmente.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
