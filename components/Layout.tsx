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
    <div className="min-h-screen flex flex-col bg-page transition-colors duration-200">
      <header className="bg-surface shadow-sm border-b border-border p-4 transition-colors duration-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20">
                {config.appName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold hidden sm:block text-main">{config.appName}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-page rounded-full px-2 py-1 border border-border">
              <Globe size={16} className="text-muted" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-main font-medium outline-none"
              >
                <option value="pt-br">PT</option>
                <option value="en-us">EN</option>
                <option value="es-es">ES</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-page text-muted hover:text-main transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-main">{user?.name}</p>
                <p className="text-xs text-muted">{t(`role.${user?.role}`)}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title={t('common.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 text-main">
        {children}
      </main>
    </div>
  );
};