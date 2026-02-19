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
    registrationRoles: ['client', 'distributor', 'consultant', 'super_admin'],
    theme: {
      background: '#08090B',
      surface: '#121418',
      textMain: '#FFFFFF',
      textMuted: '#8E9196',
      border: 'rgba(255,255,255,0.02)',
      accent: '#00D1FF',
      lume: '#E8E1D1',
      lumeText: '#08090B',
      phantom: '#A19B8F',
      glow: '#00D1FF',
      success: '#00F5A0',
      warning: '#F59E0B',
      error: '#FF4D4D',
      glass: 'rgba(18, 20, 24, 0.4)',
      shadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5)'
    },
    effects: {
      glassBlur: 40,
      glassSaturate: 180,
      glassOpacity: 0.4,
      grainOpacity: 0.04,
      mouseGlowIntensity: 0.05,
      hoverLift: 8,
      revealDuration: 0.8,
      glowIntensity: 20
    },
    elements: {
      button: {
        radius: '1rem',
        borderWidth: '0px',
        borderColor: 'transparent',
        bg: 'var(--color-lume)',
        text: 'var(--color-lume-text)',
        hoverBg: 'var(--color-lume)',
        hoverText: 'var(--color-lume-text)',
        hoverBorder: 'transparent',
        shadow: '0 10px 20px -5px rgba(0, 0, 0, 0.3)'
      },
      input: {
        radius: '1rem',
        borderWidth: '0px',
        borderColor: 'rgba(255, 255, 255, 0.03)',
        bg: 'var(--color-surface)',
        text: 'var(--color-main)',
        hoverBg: 'rgba(255, 255, 255, 0.04)',
        hoverText: 'var(--color-main)',
        hoverBorder: 'rgba(0, 209, 255, 0.1)',
        shadow: 'none'
      },
      container: {
        radius: '2.5rem',
        borderWidth: '0px',
        borderColor: 'rgba(255, 255, 255, 0.02)',
        bg: 'var(--glass-bg)',
        text: 'var(--color-main)',
        hoverBg: 'var(--glass-bg)',
        hoverText: 'var(--color-main)',
        hoverBorder: 'rgba(255, 255, 255, 0.05)',
        shadow: 'var(--glass-shadow)'
      },
      modal: {
        radius: '3rem',
        borderWidth: '0px',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        bg: 'var(--color-surface)',
        text: 'var(--color-main)',
        hoverBg: 'var(--color-surface)',
        hoverText: 'var(--color-main)',
        hoverBorder: 'rgba(255, 255, 255, 0.05)',
        shadow: '0 50px 100px -20px rgba(0, 0, 0, 0.8)'
      },
      toast: {
        radius: '1.25rem',
        borderWidth: '0px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        bg: 'rgba(18, 20, 24, 0.9)',
        text: 'var(--color-main)',
        hoverBg: 'rgba(18, 20, 24, 0.95)',
        hoverText: 'var(--color-main)',
        hoverBorder: 'rgba(255, 255, 255, 0.2)',
        shadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      },
      icon: {
        color: 'var(--color-muted)',
        hoverColor: 'var(--color-primary)'
      }
    }
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

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    };

    const css = `
      :root {
        --color-bg-rgb: ${hexToRgb(config.theme.background)};
        --color-surface-rgb: ${hexToRgb(config.theme.surface)};
        --color-main-rgb: ${hexToRgb(config.theme.textMain)};
        --color-muted-rgb: ${hexToRgb(config.theme.textMuted)};
        --color-primary-rgb: ${hexToRgb(config.theme.accent)};
        --color-lume-rgb: ${hexToRgb(config.theme.lume)};
        --color-success-rgb: ${hexToRgb(config.theme.success)};
        --color-warning-rgb: ${hexToRgb(config.theme.warning)};
        --color-error-rgb: ${hexToRgb(config.theme.error)};
        
        --color-lume: ${config.theme.lume};
        --color-lume-text: ${config.theme.lumeText};
        --color-phantom: ${config.theme.phantom};
        --color-glow: ${config.theme.glow};
        
        --color-success: ${config.theme.success};
        --color-warning: ${config.theme.warning};
        --color-error: ${config.theme.error};
 
        --glass-bg: ${config.theme.glass};
        --glass-border: ${config.theme.border};
        --glass-shadow: ${config.theme.shadow};
        
        /* Dynamic Effects Vars */
        --aura-blur: ${config.effects.glassBlur}px;
        --aura-saturate: ${config.effects.glassSaturate}%;
        --aura-grain: ${config.effects.grainOpacity};
        --aura-mouse-glow: ${config.effects.mouseGlowIntensity};
        --aura-lift: -${config.effects.hoverLift}px;
        --aura-reveal-time: ${config.effects.revealDuration}s;
        --aura-glow-radius: ${config.effects.glowIntensity}px;

        /* Elements Architecture - Buttons */
        --btn-radius: ${config.elements.button.radius};
        --btn-bg: ${config.elements.button.bg};
        --btn-text: ${config.elements.button.text};
        --btn-border: ${config.elements.button.borderWidth} solid ${config.elements.button.borderColor};
        --btn-shadow: ${config.elements.button.shadow};
        --btn-hover-bg: ${config.elements.button.hoverBg};
        --btn-hover-text: ${config.elements.button.hoverText};
        --btn-hover-border: ${config.elements.button.hoverBorder};

        /* Elements Architecture - Inputs */
        --input-radius: ${config.elements.input.radius};
        --input-bg: ${config.elements.input.bg};
        --input-text: ${config.elements.input.text};
        --input-border: ${config.elements.input.borderWidth} solid ${config.elements.input.borderColor};
        --input-hover-bg: ${config.elements.input.hoverBg};
        --input-hover-border: ${config.elements.input.hoverBorder};

        /* Elements Architecture - Containers */
        --card-radius: ${config.elements.container.radius};
        --card-bg: ${config.elements.container.bg};
        --card-border: ${config.elements.container.borderWidth} solid ${config.elements.container.borderColor};
        --card-shadow: ${config.elements.container.shadow};
        --card-hover-border: ${config.elements.container.hoverBorder};

        /* Elements Architecture - Icons */
        --icon-color: ${config.elements.icon.color};
        --icon-hover: ${config.elements.icon.hoverColor};

        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
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