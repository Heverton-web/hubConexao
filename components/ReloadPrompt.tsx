import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-surface border border-border p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm">
                <div className="bg-accent/10 p-2 rounded-lg text-accent">
                    <RefreshCw size={24} className={needRefresh ? "animate-spin" : ""} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-main">
                        {offlineReady ? "Pronto para uso offline" : "Nova versão disponível"}
                    </h4>
                    <p className="text-xs text-muted mt-1">
                        {offlineReady
                            ? "O app foi salvo para uso sem internet."
                            : "Clique em atualizar para carregar as novidades."}
                    </p>
                </div>
                {needRefresh && (
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-accent/90 transition-colors"
                    >
                        Atualizar
                    </button>
                )}
                <button
                    onClick={close}
                    className="text-muted hover:text-main p-1"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
