import { useEffect } from 'react';
import { useShortcuts, Shortcut } from '../contexts/ShortcutContext';

// Re-export types for convenience
export type { Shortcut, KeyCombo } from '../contexts/ShortcutContext';

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
    const { registerShortcut, unregisterShortcut } = useShortcuts();

    useEffect(() => {
        // Register all shortcuts on mount
        shortcuts.forEach(shortcut => registerShortcut(shortcut));

        // Unregister all shortcuts on unmount
        return () => {
            shortcuts.forEach(shortcut => unregisterShortcut(shortcut.id));
        };
    }, [shortcuts, registerShortcut, unregisterShortcut]);
};
