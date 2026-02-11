import React, { useState, useEffect } from 'react';
import { UserProfile, Role, UserStatus, MaterialType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, FileText, Image as ImageIcon, Video, User } from 'lucide-react';

interface UserEditModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => Promise<void>;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
  const { t } = useLanguage();
  
  // Form States
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [cro, setCro] = useState(user.cro || '');
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [allowedTypes, setAllowedTypes] = useState<MaterialType[]>(user.allowedTypes || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...user,
      name,
      email,
      whatsapp,
      cro: cro || undefined,
      role,
      status,
      allowedTypes: allowedTypes.length > 0 ? allowedTypes : undefined
    });
    onClose();
  };

  const toggleType = (type: MaterialType) => {
    setAllowedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-border overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
          <div>
            <h3 className="font-bold text-lg text-main flex items-center gap-2">
                <User className="text-accent" size={20} />
                {t('user.edit')}
            </h3>
            <p className="text-xs text-muted">Gerencie dados pessoais, status e permissões.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status & Role Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-main mb-1.5 uppercase">Status</label>
                    <select 
                        value={status} 
                        onChange={e => setStatus(e.target.value as UserStatus)}
                        className={`w-full p-2.5 rounded-lg border border-border outline-none font-medium
                            ${status === 'active' ? 'bg-green-500/10 text-green-600' : 
                              status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                              status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-page text-muted'}
                        `}
                    >
                        <option value="active">{t('user.status.active')}</option>
                        <option value="pending">{t('user.status.pending')}</option>
                        <option value="inactive">{t('user.status.inactive')}</option>
                        <option value="rejected">{t('user.status.rejected')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-main mb-1.5 uppercase">Perfil</label>
                    <select 
                        value={role} 
                        onChange={e => setRole(e.target.value as Role)}
                        className="w-full p-2.5 rounded-lg border border-border bg-page text-main outline-none"
                    >
                        <option value="client">{t('role.client')}</option>
                        <option value="distributor">{t('role.distributor')}</option>
                        <option value="consultant">{t('role.consultant')}</option>
                        <option value="super_admin">{t('role.super_admin')}</option>
                    </select>
                </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">Nome Completo</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-page text-main outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">CRO (Opcional)</label>
                        <input type="text" value={cro} onChange={e => setCro(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-page text-main outline-none focus:border-accent" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">E-mail</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-page text-main outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">WhatsApp</label>
                        <input type="tel" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-page text-main outline-none focus:border-accent" />
                    </div>
                </div>
            </div>

            {/* Granular Permissions */}
            <div className="pt-4 border-t border-border">
                <label className="block text-xs font-bold text-main mb-2 uppercase tracking-wide">{t('user.access.types')}</label>
                <p className="text-xs text-muted mb-3">{t('user.access.hint')}</p>
                
                <div className="flex gap-4">
                    {(['pdf', 'image', 'video'] as MaterialType[]).map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => toggleType(type)}
                            className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all
                                ${allowedTypes.includes(type) 
                                    ? 'bg-accent/10 border-accent text-accent' 
                                    : 'bg-page border-border text-muted opacity-60 hover:opacity-100'}
                            `}
                        >
                            {type === 'pdf' && <FileText size={20} />}
                            {type === 'image' && <ImageIcon size={20} />}
                            {type === 'video' && <Video size={20} />}
                            <span className="text-xs font-bold uppercase">{t(`material.type.${type}`)}</span>
                        </button>
                    ))}
                </div>
            </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-page flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-5 py-2.5 rounded-lg text-muted hover:bg-muted/10 font-medium">{t('cancel')}</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg bg-accent text-white hover:opacity-90 font-medium flex items-center gap-2 shadow-lg shadow-accent/20">
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};