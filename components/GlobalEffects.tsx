import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const GlobalEffects: React.FC = () => {
  const { theme } = useTheme();
  
  // --- CUSTOM CURSOR LOGIC ---
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    // Only enable on devices with a mouse
    if (window.matchMedia("(pointer: fine)").matches) {
        const moveCursor = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            
            // Main dot (instant)
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
            }
            
            // Follower ring (delayed animation via CSS transition)
            if (followerRef.current) {
                // We use a slight timeout or just relied on CSS transition, 
                // but direct update is smoother for performance
                followerRef.current.animate({
                    left: `${clientX}px`,
                    top: `${clientY}px`
                }, { duration: 500, fill: "forwards" });
            }

            // Check for hoverable elements
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, input, select, textarea, [role="button"]');
            setIsHovering(!!isClickable);
        };

        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }
  }, []);

  // --- BACKGROUND BLOBS LOGIC ---
  // Create dynamic background blobs that move slightly
  
  return (
    <>
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob bg-purple-500`}></div>
        <div className={`absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 bg-yellow-500`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bg-pink-500`}></div>
        
        {/* Grid Pattern Overlay for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* Custom Cursor Elements (Only visible on fine pointer devices via CSS media query logic in index.html, but we render them always here) */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-accent rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block"
      />
      <div 
        ref={followerRef}
        className={`fixed top-0 left-0 border border-accent rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out hidden md:block mix-blend-difference
            ${isHovering ? 'w-12 h-12 bg-accent/20 border-transparent backdrop-blur-[1px]' : 'w-8 h-8 opacity-50'}
        `}
      />
    </>
  );
};