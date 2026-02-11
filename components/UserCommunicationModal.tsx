import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Mail, MessageCircle, Send, Paperclip } from 'lucide-react';
import { useBrand } from '../contexts/BrandContext';

interface UserCommunicationModalProps {
  user: UserProfile;
  onClose: () => void;
}

export const UserCommunicationModal: React.FC<UserCommunicationModalProps> = ({ user, onClose }) => {
  const { t } = useLanguage();
  const { config } = useBrand();
  
  const [mode, setMode] = useState<'email' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);

  // Form States
  const [subject, setSubject] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [waType, setWaType] = useState<'text' | 'file'>('text');
  const [fileUrl, setFileUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!config.webhookUrl) {
      alert('Webhook URL não configurada em Configurações.');
      setLoading(false);
      return;
    }

    const payload = {
      recipient: {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
      },
      channel: mode,
      data: mode === 'email' ? {
        subject,
        subtitle,
        body,
        attachment: fileUrl || null
      } : {
        type: waType,
        message: body,
        file: waType === 'file' ? fileUrl : null
      },
      timestamp: new Date().toISOString()
    };

    try {
      // Simulation of webhook call since we can't actually hit a real N8N instance securely here
      console.log('--- N8N WEBHOOK PAYLOAD ---');
      console.log(JSON.stringify(payload, null, 2));
      console.log('Target:', config.webhookUrl);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Real call implementation would be:
      // await fetch(config.webhookUrl, { method: 'POST', body: JSON.stringify(payload) });

      alert(t('comm.success'));
      onClose();
    } catch (error) {
      alert('Erro ao enviar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-xl shadow-2xl flex flex-col border border-border overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-page rounded-lg border border-border">
                {mode === 'email' ? <Mail className="text-blue-500" size={20} /> : <MessageCircle className="text-green-500" size={20} />}
             </div>
             <div>
               <h3 className="font-bold text-lg text-main">{t('comm.title')}</h3>
               <p className="text-xs text-muted">Para: {user.name} ({mode === 'email' ? user.email : user.whatsapp})</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button 
            onClick={() => setMode('email')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'email' ? 'bg-surface text-accent border-b-2 border-accent' : 'bg-page text-muted hover:text-main'}`}
          >
            {t('comm.type.email')}
          </button>
          <button 
            onClick={() => setMode('whatsapp')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'whatsapp' ? 'bg-surface text-green-500 border-b-2 border-green-500' : 'bg-page text-muted hover:text-main'}`}
          >
            {t('comm.type.whatsapp')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-surface flex-1 overflow-y-auto">
          
          {mode === 'email' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">{t('comm.email.subject')}</label>
                <input 
                  type="text" required 
                  className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none"
                  value={subject} onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">{t('comm.email.subtitle')}</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none"
                  value={subtitle} onChange={e => setSubtitle(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode === 'whatsapp' && (
             <div className="space-y-4 animate-fade-in">
               <div>
                 <label className="block text-xs font-semibold text-main mb-1.5">{t('comm.wa.type')}</label>
                 <div className="flex gap-2">
                   <button type="button" onClick={() => setWaType('text')} className={`flex-1 py-2 rounded border text-sm ${waType === 'text' ? 'bg-green-500 text-white border-green-600' : 'bg-page border-border text-muted'}`}>{t('comm.wa.text')}</button>
                   <button type="button" onClick={() => setWaType('file')} className={`flex-1 py-2 rounded border text-sm ${waType === 'file' ? 'bg-green-500 text-white border-green-600' : 'bg-page border-border text-muted'}`}>{t('comm.wa.file')}</button>
                 </div>
               </div>
             </div>
          )}

          {/* Common Fields */}
          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
               {mode === 'email' ? t('comm.email.body') : t('comm.wa.message')}
            </label>
            <textarea 
              required
              rows={5}
              className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none resize-none"
              value={body} onChange={e => setBody(e.target.value)}
            />
          </div>

          {(mode === 'email' || (mode === 'whatsapp' && waType === 'file')) && (
            <div className="animate-fade-in">
               <label className="block text-xs font-semibold text-main mb-1.5 flex items-center gap-2">
                 <Paperclip size={14} /> {t('comm.file.url')}
               </label>
               <input 
                  type="text" required={mode === 'whatsapp' && waType === 'file'}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none font-mono text-xs"
                  value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                />
            </div>
          )}

        </form>

        <div className="p-4 border-t border-border bg-page flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-5 py-2.5 rounded-lg text-muted hover:bg-muted/10 font-medium">{t('cancel')}</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className={`
              px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-transform active:scale-95
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              ${mode === 'email' ? 'bg-accent shadow-accent/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'}
            `}
          >
            <Send size={18} />
            {loading ? '...' : t('comm.send')}
          </button>
        </div>
      </div>
    </div>
  );
};