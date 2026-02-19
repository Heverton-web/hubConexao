import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const GlobalEffects: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-page transition-colors duration-500">
        {/* Main Aura Drifts */}
        <div className={`absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-accent animate-aura-drift blur-[120px] transition-opacity duration-1000 ${isDark ? 'opacity-[0.08]' : 'opacity-0'}`}></div>
        <div className={`absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-accent animate-aura-drift blur-[100px] transition-opacity duration-1000 ${isDark ? 'opacity-[0.05]' : 'opacity-0'}`} style={{ animationDelay: '-5s' }}></div>

        {/* High-frequency shimmer drift */}
        <div className={`absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-accent animate-aura-drift blur-[80px] transition-opacity duration-1000 ${isDark ? 'opacity-[0.05]' : 'opacity-0'}`} style={{ animationDelay: '-10s' }}></div>

        {/* Global Grain Texture - Feb 2026 standard */}
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-150 brightness-100 transition-opacity duration-500 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.01]'}`}></div>

        {/* Subtle vignetting for depth */}
        <div className={`absolute inset-0 bg-gradient-radial from-transparent via-transparent to-page/40 transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
    </>
  );
};