import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type KeyCombo = {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
};

export interface Shortcut {
    id: string;
    combo: KeyCombo;
    action: (e: KeyboardEvent) => void;
    description: string;
    global?: boolean;
    category?: string; // Optional category for grouping in help modal
}

interface ShortcutContextType {
    shortcuts: Shortcut[];
    registerShortcut: (shortcut: Shortcut) => void;
    unregisterShortcut: (id: string) => void;
}

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

    const registerShortcut = useCallback((shortcut: Shortcut) => {
        setShortcuts(prev => {
            if (prev.some(s => s.id === shortcut.id)) return prev;
            return [...prev, shortcut];
        });
    }, []);

    const unregisterShortcut = useCallback((id: string) => {
        setShortcuts(prev => prev.filter(s => s.id !== id));
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore checks if an input/textarea is focused
            const target = event.target as HTMLElement;
            const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

            // Sort shortcuts to prioritize those that match most modifiers or specificity if needed
            // For now, simple iteration.

            // We need to find ONE matching shortcut to execute.
            // If multiple match, typically the last registered (most local) or first?
            // Let's execute the first match for now, but maybe reverse order (LIFO) simulates stack?
            // LIFO is better for "focused" components overriding global ones.

            const activeShortcuts = [...shortcuts].reverse();

            for (const shortcut of activeShortcuts) {
                const { key, ctrl, shift, alt, meta } = shortcut.combo;

                const keyMatches = event.key.toLowerCase() === key.toLowerCase();
                const ctrlMatches = !!ctrl === event.ctrlKey;
                const shiftMatches = !!shift === event.shiftKey;
                const altMatches = !!alt === event.altKey;
                const metaMatches = !!meta === event.metaKey;

                if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
                    if (!isInputFocused || shortcut.global) {
                        // If it's a "global" shortcut (like Ctrl+K or F1), we might want to prevent default
                        // BUT, if it is NOT global and input is focused, we skip.

                        // We found a match. Execute and stop.
                        event.preventDefault(); // Prevent browser default (e.g. Ctrl+P)
                        shortcut.action(event);
                        return;
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    return (
        <ShortcutContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut }}>
            {children}
        </ShortcutContext.Provider>
    );
};

export const useShortcuts = () => {
    const context = useContext(ShortcutContext);
    if (!context) {
        throw new Error('useShortcuts must be used within a ShortcutProvider');
    }
    return context;
};
