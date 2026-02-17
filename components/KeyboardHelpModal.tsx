import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Keyboard, X, Command } from 'lucide-react';

interface ShortcutHelpProps {
    isOpen: boolean;
    onClose: () => void;
    shortcuts: Array<{ keys: string[], description: string, category: string }>;
}

export const KeyboardHelpModal: React.FC<ShortcutHelpProps> = ({ isOpen, onClose, shortcuts }) => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Header */}
                <div className="bg-page px-6 py-4 flex justify-between items-center border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Keyboard size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-main">{t('shortcuts.title') || 'Atalhos de Teclado'}</h3>
                            <p className="text-xs text-muted">Maximize sua produtividade</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface rounded-full text-muted hover:text-main transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Object.entries(
                            shortcuts.reduce((acc, curr) => {
                                const cat = curr.category;
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(curr);
                                return acc;
                            }, {} as Record<string, ShortcutHelpProps['shortcuts']>)
                        ).map(([category, items]) => (
                            <div key={category} className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted tracking-wider border-b border-border pb-2">{category}</h4>
                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center group">
                                            <span className="text-sm font-medium text-main group-hover:text-accent transition-colors">{item.description}</span>
                                            <div className="flex gap-1">
                                                {item.keys.map((k, kIdx) => (
                                                    <kbd key={kIdx} className="min-w-[1.5rem] h-6 px-1.5 flex items-center justify-center bg-page border border-border rounded text-[10px] font-bold text-muted font-mono shadow-sm">
                                                        {k}
                                                    </kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-page/50 px-6 py-3 flex justify-between items-center text-xs text-muted border-t border-border">
                    <div className="flex items-center gap-2">
                        <Command size={12} />
                        <span>Pressione <kbd className="font-bold bg-white/10 px-1 rounded">?</kbd> a qualquer momento para ver esta tela</span>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};
