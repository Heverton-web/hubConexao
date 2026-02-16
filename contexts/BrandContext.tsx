import React, { createContext, useContext, useEffect, useState } from 'react';
import { SystemConfig } from '../types';
import { mockDb } from '../lib/mockDb';

interface BrandContextType {
  config: SystemConfig;
  updateConfig: (newConfig: SystemConfig) => Promise<void>;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback defaults in case DB fails completely
  const defaults: SystemConfig = {
      appName: 'Hub Conexão',
      themeLight: { background: '#f8fafc', surface: '#ffffff', textMain: '#0f172a', textMuted: '#64748b', border: '#e2e8f0', accent: '#3b82f6', success: '#10b981', warning: '#f59e0b', error: '#ef4444' },
      themeDark: { background: '#0f172a', surface: '#1e293b', textMain: '#f8fafc', textMuted: '#94a3b8', border: 'transparent', accent: '#6366f1', success: '#22c55e', warning: '#eab308', error: '#ef4444' }
  };

  // Fetch config on load
  useEffect(() => {
    mockDb.getSystemConfig()
      .then(data => {
        setConfig(data);
      })
      .catch(err => {
        console.error("BrandContext Init Error:", err);
        // Apply defaults to ensure app loads even if DB is down/missing
        setConfig(defaults);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Inject CSS Variables for both Light and Dark modes
  useEffect(() => {
    if (!config) return;

    let styleTag = document.getElementById('theme-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-styles';
      document.head.appendChild(styleTag);
    }

    const css = `
      :root {
        --color-bg: ${config.themeLight.background};
        --color-surface: ${config.themeLight.surface};
        --color-text-main: ${config.themeLight.textMain};
        --color-text-muted: ${config.themeLight.textMuted};
        --color-border: ${config.themeLight.border};
        --color-accent: ${config.themeLight.accent};
        --color-success: ${config.themeLight.success};
        --color-warning: ${config.themeLight.warning};
        --color-error: ${config.themeLight.error};
      }
      .dark {
        --color-bg: ${config.themeDark.background};
        --color-surface: ${config.themeDark.surface};
        --color-text-main: ${config.themeDark.textMain};
        --color-text-muted: ${config.themeDark.textMuted};
        --color-border: ${config.themeDark.border};
        --color-accent: ${config.themeDark.accent};
        --color-success: ${config.themeDark.success};
        --color-warning: ${config.themeDark.warning};
        --color-error: ${config.themeDark.error};
      }
    `;

    styleTag.innerHTML = css;
    document.title = config.appName;

  }, [config]);

  const updateConfig = async (newConfig: SystemConfig) => {
    try {
        await mockDb.updateSystemConfig(newConfig);
        setConfig(newConfig);
    } catch (e) {
        console.error("Failed to update config", e);
        throw e;
    }
  };

  return (
    <BrandContext.Provider value={{ config: config || defaults, updateConfig, isLoading }}>
      {!isLoading && config ? children : (
         // Simple loading indicator instead of blank screen
         <div className="h-screen w-full flex flex-col gap-4 items-center justify-center bg-gray-50 text-gray-500 font-medium animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
            <span>Carregando Sistema...</span>
         </div>
      )}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within a BrandProvider');
  return context;
};