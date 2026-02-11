import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-xl w-full max-w-md shadow-2xl border border-border overflow-hidden animate-fade-in">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-main mb-2">{title}</h3>
          <p className="text-sm text-muted mb-6">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-main hover:bg-page transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold shadow-lg shadow-red-500/20"
            >
              {t('confirm.delete.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};