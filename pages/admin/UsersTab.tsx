import React, { useMemo, useState } from 'react';
import { UserProfile, Role, UserStatus, MaterialType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { mockDb } from '../../lib/mockDb';
import { Trash2, Pencil, Search, FileText, Image as ImageIcon, Video, CheckCircle, XCircle, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserCommunicationModal } from '../../components/UserCommunicationModal';
import { UserEditModal } from '../../components/UserEditModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SkeletonTable } from '../../components/SkeletonTable';
import { usePagination } from '../../hooks/usePagination';

interface UsersTabProps {
    users: UserProfile[];
    onReload: () => void;
    isLoading?: boolean;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onReload, isLoading = false }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [userComm, setUserComm] = useState<UserProfile | null>(null);
    const [userEditing, setUserEditing] = useState<UserProfile | null>(null);

    // Filters
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<Role | 'all'>('all');
    const [userStatusFilter, setUserStatusFilter] = useState<UserStatus | 'all'>('all');

    // Delete confirmation
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            if (user.role === 'super_admin') return false;
            const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                user.email.toLowerCase().includes(userSearch.toLowerCase());
            const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
            const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [users, userSearch, userRoleFilter, userStatusFilter]);

    // Pagination
    const {
        currentData,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        startIndex,
        endIndex
    } = usePagination<UserProfile>({ data: filteredUsers, itemsPerPage: 10 });

    const handleUserStatus = async (userId: string, status: UserStatus) => {
        try {
            await mockDb.updateUserStatus(userId, status);
            onReload();
        } catch (e: any) {
            addToast('Erro ao atualizar status do usuário: ' + e.message, 'error');
        }
    };

    const handleDeleteUser = (userId: string) => { setItemToDelete(userId); setIsConfirmOpen(true); };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await mockDb.deleteUser(itemToDelete);
            onReload();
        } catch (e: any) {
            addToast('Erro ao excluir: ' + e.message, 'error');
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleSaveUser = async (updatedUser: UserProfile) => {
        try {
            await mockDb.updateUser(updatedUser);
            onReload();
        } catch (e: any) {
            addToast('Erro ao atualizar usuário: ' + e.message, 'error');
        }
    };

    return (
        <div className="animate-reveal space-y-8">
            {/* Filters Toolbar Aura */}
            <div className="aura-glass p-6 rounded-3xl flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full group/search">
                    <div className="absolute inset-0 bg-accent/20 rounded-xl blur-lg opacity-0 group-focus-within/search:opacity-10 transition-all duration-500"></div>
                    <div className="relative bg-white/[0.01] rounded-xl flex items-center transition-all duration-300 group-focus-within/search:bg-white/[0.02]">
                        <div className="pl-4 text-white/20 group-focus-within/search:text-accent transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            className="w-full bg-transparent border-none py-3 px-4 text-white placeholder-white/10 focus:ring-0 text-[13px] font-bold outline-none uppercase tracking-widest"
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex w-full lg:w-auto gap-4">
                    <select
                        className="flex-1 lg:w-44 py-3 px-4 rounded-xl bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-white/40 outline-none focus:bg-white/[0.04] transition-all appearance-none cursor-pointer"
                        value={userRoleFilter}
                        onChange={e => setUserRoleFilter(e.target.value as any)}
                    >
                        <option value="all" className="bg-surface">{t('user.filter.all')}</option>
                        <option value="client" className="bg-surface">{t('role.client')}</option>
                        <option value="distributor" className="bg-surface">{t('role.distributor')}</option>
                        <option value="consultant" className="bg-surface">{t('role.consultant')}</option>
                    </select>

                    <select
                        className="flex-1 lg:w-44 py-3 px-4 rounded-xl bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-white/40 outline-none focus:bg-white/[0.04] transition-all appearance-none cursor-pointer"
                        value={userStatusFilter}
                        onChange={e => setUserStatusFilter(e.target.value as any)}
                    >
                        <option value="all" className="bg-surface">{t('user.filter.status.all')}</option>
                        <option value="pending" className="bg-surface">{t('user.status.pending')}</option>
                        <option value="active" className="bg-surface">{t('user.status.active')}</option>
                        <option value="inactive" className="bg-surface">{t('user.status.inactive')}</option>
                        <option value="rejected" className="bg-surface">{t('user.status.rejected')}</option>
                    </select>
                </div>
            </div>

            {/* Users List Aura */}
            <div className="aura-glass rounded-[2rem] overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex items-center justify-center text-white/5 uppercase font-black tracking-[0.5em] animate-pulse">Sincronizando Perfis...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-main/[0.02]">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Usuário</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Contatos</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Perfil</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('permissions')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center">{t('status')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {currentData.map(user => (
                                    <tr key={user.id} className="group hover:bg-main/[0.01] transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-main/80 group-hover:text-main transition-colors">{user.name}</div>
                                            <div className="text-[10px] text-main/20 font-medium uppercase tracking-widest mt-1">{user.cro ? `CRO: ${user.cro}` : 'SEM CRO'}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 group/email cursor-pointer">
                                                    <div className="w-5 h-5 rounded bg-white/[0.03] flex items-center justify-center transition-all">
                                                        <span className="text-[8px] font-black text-white/20 group-hover/email:text-accent">E</span>
                                                    </div>
                                                    <span className="text-[11px] text-white/40 group-hover/email:text-white/60 transition-colors">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 group/wa cursor-pointer">
                                                    <div className="w-5 h-5 rounded bg-main/[0.03] flex items-center justify-center transition-all">
                                                        <span className="text-[8px] font-black text-main/20 group-hover/wa:text-success">W</span>
                                                    </div>
                                                    <span className="text-[11px] text-main/40 group-hover/wa:text-main/60 transition-colors">{user.whatsapp}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex px-3 py-1 rounded-lg bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-accent/60 transition-all">
                                                {t(`role.${user.role}`)}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-2">
                                                {(!user.allowedTypes || user.allowedTypes.length === 0) ? (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/10 italic">TOTAL</span>
                                                ) : (
                                                    user.allowedTypes.map(type => (
                                                        <div key={type} className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/20 hover:text-accent transition-all" title={t(`material.type.${type}`)}>
                                                            {type === 'pdf' && <FileText size={14} />}
                                                            {type === 'image' && <ImageIcon size={14} />}
                                                            {type === 'video' && <Video size={14} />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${user.status === 'active' ? 'bg-success/10 text-success' :
                                                user.status === 'pending' ? 'bg-warning/10 text-warning shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                                                    user.status === 'rejected' ? 'bg-error/10 text-error' :
                                                        'bg-white/[0.02] text-white/20'
                                                }`}>
                                                {t(`user.status.${user.status}`)}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                <button onClick={() => setUserComm(user)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-accent bg-white/[0.02] hover:bg-accent/10 rounded-xl transition-all" title={t('comm.title')}>
                                                    <MessageCircle size={16} />
                                                </button>
                                                {user.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUserStatus(user.id, 'active')} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-success bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all shadow-[0_0_15px_rgba(0,245,160,0.1)]" title={t('user.action.approve')}><CheckCircle size={16} /></button>
                                                        <button onClick={() => handleUserStatus(user.id, 'rejected')} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-error bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all" title={t('user.action.reject')}><XCircle size={16} /></button>
                                                    </div>
                                                )}
                                                <button onClick={() => setUserEditing(user)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-accent bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all" title={t('edit')}>
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-error bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all hover:shadow-[0_0_15px_rgba(255,77,77,0.1)]" title={t('delete')}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-white/10 uppercase font-black tracking-[0.2em]">Nenhum usuário encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Footer Aura */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-main/[0.01]">
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20 mb-4 sm:mb-0">
                                    {t('pagination.showing')} {startIndex + 1}-{endIndex} {t('pagination.of')} {filteredUsers.length}
                                </span>
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] text-white/20 hover:text-white disabled:opacity-5 transition-all outline-none"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{currentPage} <span className="text-white/10 mx-2">/</span> {totalPages}</span>
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-main/[0.02] text-main/20 hover:text-main disabled:opacity-5 transition-all outline-none"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {userComm && (
                <UserCommunicationModal user={userComm} onClose={() => setUserComm(null)} />
            )}
            {userEditing && (
                <UserEditModal user={userEditing} onClose={() => setUserEditing(null)} onSave={handleSaveUser} />
            )}
            <ConfirmModal
                isOpen={isConfirmOpen}
                title={t('confirm.delete.title')}
                message={t('confirm.delete.message')}
                onConfirm={confirmDelete}
                onClose={() => setIsConfirmOpen(false)}
            />
        </div>
    );
};
