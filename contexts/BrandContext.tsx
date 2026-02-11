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

  // Fetch config on load
  useEffect(() => {
    mockDb.getSystemConfig().then(data => {
      setConfig(data);
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
    await mockDb.updateSystemConfig(newConfig);
    setConfig(newConfig);
  };

  return (
    <BrandContext.Provider value={{ config: config!, updateConfig, isLoading }}>
      {!isLoading && config ? children : <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gray-500">Carregando...</div>}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within a BrandProvider');
  return context;
};