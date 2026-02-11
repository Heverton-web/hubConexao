import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { Moon, Sun, LogOut, Globe } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { config } = useBrand();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 relative">
      
      {/* Floating Glass Header */}
      <header className="sticky top-0 z-40 w-full px-4 pt-4 pointer-events-none">
        <div className="container mx-auto">
            <div className="bg-surface/70 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/5 rounded-2xl p-4 flex justify-between items-center pointer-events-auto transition-all duration-300 hover:shadow-xl hover:bg-surface/80 hover:border-white/20">
            <div className="flex items-center space-x-3">
                {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20">
                    {config.appName.substring(0, 2).toUpperCase()}
                </div>
                )}
                <h1 className="text-xl font-bold hidden sm:block text-main tracking-tight">{config.appName}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Language Selector */}
                <div className="hidden md:flex items-center gap-1 bg-page/50 rounded-full px-3 py-1.5 border border-border/50 hover:border-accent/50 transition-colors">
                <Globe size={14} className="text-muted" />
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer text-main font-bold outline-none uppercase"
                >
                    <option value="pt-br">PT</option>
                    <option value="en-us">EN</option>
                    <option value="es-es">ES</option>
                </select>
                </div>

                {/* Theme Toggle */}
                <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-page text-muted hover:text-accent transition-all hover:rotate-12"
                >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                <div className="text-right hidden md:block leading-tight">
                    <p className="text-sm font-bold text-main">{user?.name}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted font-semibold">{t(`role.${user?.role}`)}</p>
                </div>
                <button
                    onClick={logout}
                    className="group p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                    title={t('common.logout')}
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
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