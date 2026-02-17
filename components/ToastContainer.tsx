import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast, Toast, ToastType } from '../contexts/ToastContext';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
};

const colorMap: Record<ToastType, { bg: string; border: string; text: string; progress: string }> = {
    success: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-500',
        progress: 'bg-emerald-500',
    },
    error: {
        bg: 'bg-red-500/10 dark:bg-red-500/15',
        border: 'border-red-500/30',
        text: 'text-red-500',
        progress: 'bg-red-500',
    },
    warning: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-500',
        progress: 'bg-amber-500',
    },
    info: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        border: 'border-blue-500/30',
        text: 'text-blue-500',
        progress: 'bg-blue-500',
    },
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const colors = colorMap[toast.type];

    useEffect(() => {
        // Trigger entrance animation
        const enterTimer = setTimeout(() => setIsVisible(true), 10);

        // Trigger exit animation before removal
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, toast.duration - 300);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
        };
    }, [toast.duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div
            className={`
        relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl shadow-black/10
        transition-all duration-300 ease-out min-w-[320px] max-w-[420px]
        ${colors.bg} ${colors.border}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'}
      `}
        >
            {/* Icon */}
            <div className={`shrink-0 mt-0.5 ${colors.text}`}>
                {iconMap[toast.type]}
            </div>

            {/* Message */}
            <p className="flex-1 text-sm font-medium text-main leading-relaxed">
                {toast.message}
            </p>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="shrink-0 p-1 rounded-lg text-muted hover:text-main hover:bg-white/10 transition-colors"
            >
                <X size={14} />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                <div
                    className={`h-full ${colors.progress} opacity-60`}
                    style={{
                        animation: `toast-progress ${toast.duration}ms linear forwards`,
                    }}
                />
            </div>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return createPortal(
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-auto">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>,
        document.body
    );
};
