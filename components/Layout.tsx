import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { Moon, Sun, LogOut, Globe, ChevronDown, Keyboard } from 'lucide-react';
import { useKeyboardShortcuts, Shortcut } from '../hooks/useKeyboardShortcuts';
import { useShortcuts } from '../contexts/ShortcutContext';
import { KeyboardHelpModal } from './KeyboardHelpModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();


    const { config } = useBrand();
    const { shortcuts: allShortcuts } = useShortcuts();

    const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false);

    const globalShortcuts: Shortcut[] = [
        {
            id: 'toggle-theme',
            combo: { key: 'j', ctrl: true },
            action: () => toggleTheme(),
            description: 'Alternar Tema (Claro/Escuro)',
            global: true
        },
        {
            id: 'toggle-help',
            combo: { key: '?', shift: true },
            action: () => setIsShortcutsOpen(prev => !prev),
            description: 'Ver atalhos de teclado',
            global: true
        },
        {
            id: 'quick-logout',
            combo: { key: 'q', alt: true },
            action: () => {
                if (confirm(t('common.logout') + '?')) logout();
            },
            description: 'Sair da conta',
            global: true
        }
    ];

    useKeyboardShortcuts(globalShortcuts);

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-500 relative">
            <KeyboardHelpModal
                isOpen={isShortcutsOpen}
                onClose={() => setIsShortcutsOpen(false)}
                shortcuts={allShortcuts.map(s => ({
                    keys: [s.combo.ctrl && 'Ctrl', s.combo.alt && 'Alt', s.combo.shift && 'Shift', s.combo.key].filter(Boolean) as string[],
                    description: s.description,
                    category: s.category || (s.global ? 'Global' : 'Geral')
                }))}
            />

            {/* Floating Dynamic Header */}
            <header className="sticky top-0 z-40 w-full px-4 pt-4 pointer-events-none">
                <div className="container mx-auto">
                    <div className="bg-surface/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl shadow-black/5 rounded-2xl p-3 pl-5 flex justify-between items-center pointer-events-auto transition-all duration-500 hover:bg-surface/90 hover:shadow-accent/5">

                        {/* Logo Area */}
                        <div className="flex items-center space-x-4 group cursor-default">
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                                {config.logoUrl ? (
                                    <img src={config.logoUrl} alt="Logo" className="relative h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="relative w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                                        {config.appName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-xl font-bold hidden sm:block text-main tracking-tight group-hover:text-accent transition-colors duration-300">{config.appName}</h1>
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-3">

                            {/* Language Pill */}
                            <div className="hidden md:flex items-center gap-2 bg-page/50 border border-border/50 rounded-full px-1.5 py-1.5 hover:border-accent/50 transition-colors group">
                                <div className="p-1.5 bg-surface rounded-full shadow-sm text-muted group-hover:text-accent transition-colors">
                                    <Globe size={14} />
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer text-main font-bold outline-none uppercase pr-2 hover:text-accent transition-colors"
                                >
                                    <option value="pt-br">PT</option>
                                    <option value="en-us">EN</option>
                                    <option value="es-es">ES</option>
                                </select>
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="relative overflow-hidden w-10 h-10 rounded-full flex items-center justify-center bg-page/50 border border-border/50 text-muted hover:text-accent hover:border-accent/50 hover:bg-surface transition-all duration-300 group"
                            >
                                <div className="absolute inset-0 bg-accent/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
                                <div className="relative z-10 transition-transform duration-500 group-hover:rotate-180">
                                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                </div>
                            </button>

                            {/* User Profile Pill */}
                            <div className="flex items-center gap-3 pl-2">
                                <div className="flex items-center gap-3 bg-page/50 border border-border/50 hover:border-accent/30 rounded-full p-1 pr-4 transition-all duration-300 cursor-default group">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-surface group-hover:ring-accent/30 transition-all">
                                        {user?.name.charAt(0)}
                                    </div>
                                    <div className="hidden md:block leading-none">
                                        <p className="text-xs font-bold text-main group-hover:text-accent transition-colors">{user?.name.split(' ')[0]}</p>
                                        <p className="text-[9px] uppercase tracking-wide text-muted font-semibold mt-0.5">{t(`role.${user?.role}`)}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={logout}
                                    className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                                    title={t('common.logout')}
                                >
                                    <LogOut size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-6 text-main mt-4 animate-fade-in relative z-10">
                {children}
            </main>
        </div>
    );
};