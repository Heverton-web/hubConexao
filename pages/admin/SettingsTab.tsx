import React, { useState } from 'react';
import { SystemConfig, ColorScheme, Role, Language } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useBrand } from '../../contexts/BrandContext';
import { ChevronRight, Sun, Moon, Save, ExternalLink, Copy, CheckCircle, Share2, Image as ImageIcon, X, Check } from 'lucide-react';

// Lucide doesn't have "Type", "Webhook", "Palette" exactly — let's use suitable alternatives
import { Type, Webhook, Palette } from 'lucide-react';

// --- External Helper Components ---
const ColorInput = ({ label, value, onChange, hint }: { label: string, value: string, onChange: (val: string) => void, hint: string }) => (
    <div className="flex items-center gap-3 group">
        <div className="relative">
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer appearance-none border-2 border-border hover:border-accent transition-colors bg-transparent"
                style={{ WebkitAppearance: 'none', padding: 0 }}
            />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-main">{label}</p>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-24 text-xs bg-page px-2 py-1 rounded text-muted font-mono outline-none focus:ring-1 focus:ring-accent"
                />
                <span className="text-[10px] text-muted truncate">{hint}</span>
            </div>
        </div>
    </div>
);

const ThemeEditorSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
        <p className="text-xs font-bold uppercase text-muted tracking-wider">{title}</p>
        <div className="space-y-4 pl-1">
            {children}
        </div>
    </div>
);

const LivePreview = ({ themeName, scheme }: { themeName: string, scheme: ColorScheme }) => (
    <div className="rounded-xl overflow-hidden border border-border/30">
        <div className="px-4 py-2 bg-page/50 text-xs font-bold uppercase text-muted tracking-wider flex items-center gap-2">
            Preview — {themeName}
        </div>
        <div className="p-4" style={{ backgroundColor: scheme.background }}>
            <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: scheme.surface, borderColor: scheme.border, borderWidth: '1px' }}>
                <p className="text-sm font-bold" style={{ color: scheme.textMain }}>Título de exemplo</p>
                <p className="text-xs" style={{ color: scheme.textMuted }}>Subtítulo com texto secundário</p>
                <div className="flex gap-2 mt-2">
                    <div className="text-[10px] px-2 py-1 rounded font-bold text-white" style={{ backgroundColor: scheme.accent }}>Botão</div>
                    <div className="text-[10px] px-2 py-1 rounded font-bold" style={{ color: scheme.success, backgroundColor: scheme.success + '22' }}>Ativo</div>
                    <div className="text-[10px] px-2 py-1 rounded font-bold" style={{ color: scheme.warning, backgroundColor: scheme.warning + '22' }}>Pendente</div>
                </div>
                <div className="flex gap-2 mt-3 justify-end">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ color: scheme.error }}><X size={12} /></div>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ color: scheme.success }}><Check size={12} /></div>
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
    const [settingsTab, setSettingsTab] = useState<'identity' | 'integrations' | 'themes' | 'invites'>('identity');
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1
        ${settingsTab === id
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-muted hover:bg-page hover:text-main'}
      `}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                {label}
            </div>
            {settingsTab === id && <ChevronRight size={16} className="opacity-75" />}
        </button>
    );

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Menu */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-surface rounded-xl p-2 shadow-sm sticky top-4">
                        <p className="px-4 py-2 text-xs font-bold uppercase text-muted tracking-wider mb-2">Opções</p>
                        {renderSettingsSidebarItem('identity', 'Identidade Visual', Type)}
                        {renderSettingsSidebarItem('integrations', 'Integrações', Webhook)}
                        {renderSettingsSidebarItem('themes', 'Temas', Palette)}
                        {renderSettingsSidebarItem('invites', t('user.invite'), Share2)}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Header & Actions */}
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-main flex items-center gap-2">
                            {settingsTab === 'identity' && <><Type size={24} className="text-accent" /> Identidade Visual</>}
                            {settingsTab === 'integrations' && <><Webhook size={24} className="text-purple-500" /> Integrações</>}
                            {settingsTab === 'themes' && <><Palette size={24} className="text-orange-500" /> Personalização de Temas</>}
                            {settingsTab === 'invites' && <><Share2 size={24} className="text-green-500" /> {t('user.invite')}</>}
                        </h3>
                        {settingsTab !== 'invites' && (
                            <button onClick={handleSaveSettings} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-opacity flex items-center gap-2">
                                <Save size={18} /> Salvar Alterações
                            </button>
                        )}
                    </div>

                    {/* Identity */}
                    {settingsTab === 'identity' && (
                        <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-main">Nome da Aplicação</label>
                                    <input
                                        type="text"
                                        value={localConfig.appName}
                                        onChange={e => setLocalConfig({ ...localConfig, appName: e.target.value })}
                                        className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-black/20 text-main focus:ring-2 focus:ring-accent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-main">URL do Logo</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={localConfig.logoUrl || ''}
                                            onChange={e => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
                                            className="flex-1 p-2.5 rounded-lg bg-gray-50 dark:bg-black/20 text-main focus:ring-2 focus:ring-accent outline-none"
                                        />
                                        <div className="w-10 h-10 bg-page rounded-lg flex items-center justify-center shrink-0">
                                            {localConfig.logoUrl ? <img src={localConfig.logoUrl} className="w-6 h-6 object-contain" /> : <ImageIcon size={16} className="text-muted" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrations */}
                    {settingsTab === 'integrations' && (
                        <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-main">URL do Webhook (N8N)</label>
                                <div className="flex gap-2">
                                    <div className="p-3 bg-page rounded-l-lg text-muted font-bold text-xs flex items-center">POST</div>
                                    <input
                                        type="text"
                                        placeholder="https://n8n.seu-dominio.com/webhook/..."
                                        value={localConfig.webhookUrl || ''}
                                        onChange={e => setLocalConfig({ ...localConfig, webhookUrl: e.target.value })}
                                        className="flex-1 p-2.5 rounded-r-lg bg-gray-50 dark:bg-black/20 text-main focus:ring-2 focus:ring-accent outline-none font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-muted mt-3 leading-relaxed">
                                    Esta URL será chamada via POST com um payload JSON sempre que uma mensagem for enviada através da gestão de usuários.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Themes */}
                    {settingsTab === 'themes' && (
                        <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Light Theme */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-main font-semibold pb-2 border-b border-border/20">
                                        <Sun size={18} className="text-orange-500" /> Tema Light
                                    </div>
                                    <ThemeEditorSection title="Estrutura Base">
                                        <ColorInput label="Background" value={localConfig.themeLight.background} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, background: v } })} hint="Fundo geral da página" />
                                        <ColorInput label="Surface" value={localConfig.themeLight.surface} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, surface: v } })} hint="Cards, modais e headers" />
                                        <ColorInput label="Borders" value={localConfig.themeLight.border} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, border: v } })} hint="Linhas divisórias" />
                                    </ThemeEditorSection>
                                    <ThemeEditorSection title="Tipografia">
                                        <ColorInput label="Text Main" value={localConfig.themeLight.textMain} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, textMain: v } })} hint="Títulos e textos principais" />
                                        <ColorInput label="Text Muted" value={localConfig.themeLight.textMuted} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, textMuted: v } })} hint="Legendas e ícones secundários" />
                                    </ThemeEditorSection>
                                    <ThemeEditorSection title="Marca">
                                        <ColorInput label="Accent" value={localConfig.themeLight.accent} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, accent: v } })} hint="Botões, links e destaques" />
                                    </ThemeEditorSection>
                                    <ThemeEditorSection title="Feedback & Status">
                                        <ColorInput label="Success" value={localConfig.themeLight.success} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, success: v } })} hint="Ativo, Aprovado" />
                                        <ColorInput label="Warning" value={localConfig.themeLight.warning} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, warning: v } })} hint="Pendente, Alerta" />
                                        <ColorInput label="Error" value={localConfig.themeLight.error} onChange={v => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, error: v } })} hint="Inativo, Rejeitado, Perigo" />
                                    </ThemeEditorSection>
                                    <div className="pt-4"><LivePreview themeName="Light" scheme={localConfig.themeLight} /></div>
                                </div>
                                {/* Dark Theme */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-main font-semibold pb-2 border-b border-border/20">
                                        <Moon size={18} className="text-blue-400" /> Tema Dark
                                    </div>
                                    <ThemeEditorSection title="Estrutura Base">
                                        <ColorInput label="Background" value={localConfig.themeDark.background} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, background: v } })} hint="Fundo geral da página" />
                                        <ColorInput label="Surface" value={localConfig.themeDark.surface} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, surface: v } })} hint="Cards, modais e headers" />
                                        <ColorInput label="Borders" value={localConfig.themeDark.border} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, border: v } })} hint="Linhas divisórias" />
                                    </ThemeEditorSection>
                                    <ThemeEditorSection title="Tipografia">
                                        <ColorInput label="Text Main" value={localConfig.themeDark.textMain} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, textMain: v } })} hint="Títulos e textos principais" />
                                        <ColorInput label="Text Muted" value={localConfig.themeDark.textMuted} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, textMuted: v } })} hint="Legendas e ícones secundários" />
                                    </ThemeEditorSection>
                                    <ThemeEditorSection title="Marca">
                                        <ColorInput label="Accent" value={localConfig.themeDark.accent} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, accent: v } })} hint="Botões, links e destaques" />
                                    </ThemeEditorSection>
                                    <ThemeEditorSection title="Feedback & Status">
                                        <ColorInput label="Success" value={localConfig.themeDark.success} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, success: v } })} hint="Ativo, Aprovado" />
                                        <ColorInput label="Warning" value={localConfig.themeDark.warning} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, warning: v } })} hint="Pendente, Alerta" />
                                        <ColorInput label="Error" value={localConfig.themeDark.error} onChange={v => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, error: v } })} hint="Inativo, Rejeitado, Perigo" />
                                    </ThemeEditorSection>
                                    <div className="pt-4"><LivePreview themeName="Dark" scheme={localConfig.themeDark} /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invites */}
                    {settingsTab === 'invites' && (
                        <div className="bg-surface p-6 rounded-xl shadow-sm animate-fade-in">
                            <p className="text-sm text-muted mb-6">Compartilhe estes links para que novos usuários se cadastrem diretamente com o perfil pré-selecionado.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(['client', 'distributor', 'consultant'] as Role[]).map(role => {
                                    const fullUrl = `${window.location.origin}/login?role=${role}`;
                                    return (
                                        <div key={role} className="bg-page p-4 rounded-lg flex flex-col">
                                            <span className="text-sm font-semibold text-main mb-2 capitalize">{t(`role.${role}`)}</span>
                                            <div className="mt-auto pt-2 flex gap-2">
                                                <input readOnly value={fullUrl} className="bg-surface p-2 rounded text-xs text-muted truncate flex-1 font-mono outline-none" />
                                                <button onClick={() => window.open(fullUrl, '_blank')} className="p-2 rounded bg-surface hover:bg-muted/10 text-muted hover:text-main transition-colors" title="Visualizar">
                                                    <ExternalLink size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleCopyLink(fullUrl, role)}
                                                    className={`p-2 rounded text-white transition-colors flex items-center gap-1 text-xs font-bold ${copiedLink === role ? 'bg-success' : 'bg-accent hover:opacity-90'}`}
                                                    title={t('user.invite.copy')}
                                                >
                                                    {copiedLink === role ? <CheckCircle size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
