import React, { useMemo } from 'react';
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

    const globalShortcuts: Shortcut[] = useMemo(() => [
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
    ], [toggleTheme, logout, t]);

    useKeyboardShortcuts(globalShortcuts);


    return (
        <div className="min-h-screen flex flex-col relative bg-[#08090B] font-['Outfit']">
            <KeyboardHelpModal
                isOpen={isShortcutsOpen}
                onClose={() => setIsShortcutsOpen(false)}
                shortcuts={allShortcuts.map(s => ({
                    keys: [s.combo.ctrl && 'Ctrl', s.combo.alt && 'Alt', s.combo.shift && 'Shift', s.combo.key].filter(Boolean) as string[],
                    description: s.description,
                    category: s.category || (s.global ? 'Global' : 'Geral')
                }))}
            />

            {/* Aura Dynamic Header */}
            <header className="sticky top-0 z-40 w-full px-6 pt-6 pointer-events-none">
                <div className="container mx-auto max-w-7xl">
                    <div className="aura-glass rounded-[1.5rem] p-3 pl-6 flex justify-between items-center pointer-events-auto transition-all duration-500 border-white/[0.03]">

                        {/* Logo Area */}
                        <div className="flex items-center space-x-4 group cursor-default">
                            <div className="relative">
                                {config.logoUrl ? (
                                    <img src={config.logoUrl} alt="Logo" className="relative h-8 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="relative w-10 h-10 bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-center text-white font-bold shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:bg-accent/10 group-hover:border-accent/30">
                                        {config.appName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-xl font-bold hidden sm:block text-white heading-aura group-hover:text-accent transition-colors duration-300">{config.appName}</h1>
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-4">

                            {/* Language Selector */}
                            <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2 hover:border-accent/30 transition-all group">
                                <Globe size={14} className="text-white/30 group-hover:text-accent transition-colors" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="bg-transparent border-none text-[10px] focus:ring-0 cursor-pointer text-white font-bold outline-none uppercase tracking-widest pl-1"
                                >
                                    <option value="pt-br" className="bg-[#08090B]">PT</option>
                                    <option value="en-us" className="bg-[#08090B]">EN</option>
                                    <option value="es-es" className="bg-[#08090B]">ES</option>
                                </select>
                            </div>

                            {/* User Profile */}
                            <div className="flex items-center gap-4 pl-2">
                                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] hover:border-accent/20 rounded-xl p-1.5 pr-4 transition-all duration-300 cursor-default group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-white/5 flex items-center justify-center text-white text-xs font-bold transition-all group-hover:border-accent/30">
                                        {user?.name.charAt(0)}
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-[11px] font-bold text-white group-hover:text-accent transition-colors">{user?.name.split(' ')[0]}</p>
                                        <p className="text-[9px] uppercase tracking-wide text-white/30 font-semibold mt-0.5">{t(`role.${user?.role}`)}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={logout}
                                    className="group w-10 h-10 flex items-center justify-center rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all duration-300"
                                    title={t('common.logout')}
                                >
                                    <LogOut size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-7xl p-6 md:p-8 animate-reveal relative z-10">
                {children}
            </main>
        </div>
    );
};