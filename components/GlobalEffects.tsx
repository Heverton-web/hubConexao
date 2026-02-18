import React from 'react';

export const GlobalEffects: React.FC = () => {
  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#08090B]">
        {/* Main Aura Drifts */}
        <div className="absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-accent/10 blur-[120px] animate-aura-drift"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-aura-lume/5 blur-[100px] animate-aura-drift" style={{ animationDelay: '-5s' }}></div>

        {/* High-frequency shimmer drift */}
        <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-accent/5 blur-[80px] animate-aura-drift" style={{ animationDelay: '-10s' }}></div>

        {/* Global Grain Texture - Feb 2026 standard */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] filter contrast-150 brightness-100"></div>

        {/* Subtle vignetting for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"></div>
      </div>
    </>
  );
};