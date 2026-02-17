import React, { useMemo, useState } from 'react';
import { UserProfile, Role, UserStatus, MaterialType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { mockDb } from '../../lib/mockDb';
import { Trash2, Edit, Search, FileText, Image as ImageIcon, Video, CheckCircle, XCircle, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
    } = usePagination({ data: filteredUsers, itemsPerPage: 10 });

    const handleUserStatus = async (userId: string, status: UserStatus) => {
        try {
            await mockDb.updateUserStatus(userId, status);
            onReload();
        } catch (e: any) {
            addToast('Erro ao atualizar status do usu\u00e1rio: ' + e.message, 'error');
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
            addToast('Erro ao atualizar usu\u00e1rio: ' + e.message, 'error');
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Filters Toolbar */}
            <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2 focus:ring-accent text-main"
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                    />
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <select
                        className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                        value={userRoleFilter}
                        onChange={e => setUserRoleFilter(e.target.value as any)}
                    >
                        <option value="all">{t('user.filter.all')}</option>
                        <option value="client">{t('role.client')}</option>
                        <option value="distributor">{t('role.distributor')}</option>
                        <option value="consultant">{t('role.consultant')}</option>
                    </select>
                    <select
                        className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                        value={userStatusFilter}
                        onChange={e => setUserStatusFilter(e.target.value as any)}
                    >
                        <option value="all">{t('user.filter.status.all')}</option>
                        <option value="pending">{t('user.status.pending')}</option>
                        <option value="active">{t('user.status.active')}</option>
                        <option value="inactive">{t('user.status.inactive')}</option>
                        <option value="rejected">{t('user.status.rejected')}</option>
                    </select>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <SkeletonTable rows={5} columns={6} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-page text-xs uppercase text-muted font-semibold">
                                <tr>
                                    <th className="p-4">Usu\u00e1rio</th>
                                    <th className="p-4">Contatos</th>
                                    <th className="p-4">Perfil</th>
                                    <th className="p-4">{t('permissions')}</th>
                                    <th className="p-4 text-center">{t('status')}</th>
                                    <th className="p-4 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {currentData.map(user => (
                                    <tr key={user.id} className="hover:bg-page transition-colors text-main">
                                        <td className="p-4">
                                            <div className="font-bold text-main">{user.name}</div>
                                            <div className="text-xs text-muted">{user.cro ? `CRO: ${user.cro}` : 'N/A'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs space-y-1">
                                                <div className="flex items-center gap-1"><span className="text-muted">E:</span> {user.email}</div>
                                                <div className="flex items-center gap-1"><span className="text-muted">W:</span> {user.whatsapp}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-bold uppercase tracking-wide bg-page px-2 py-1 rounded text-muted">
                                                {t(`role.${user.role}`)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                {(!user.allowedTypes || user.allowedTypes.length === 0) ? (
                                                    <span className="text-[10px] uppercase font-bold bg-page px-2 py-1 rounded text-muted">Todos</span>
                                                ) : (
                                                    user.allowedTypes.map(type => (
                                                        <div key={type} className="p-1 rounded bg-page text-muted" title={t(`material.type.${type}`)}>
                                                            {type === 'pdf' && <FileText size={14} />}
                                                            {type === 'image' && <ImageIcon size={14} />}
                                                            {type === 'video' && <Video size={14} />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${user.status === 'active' ? 'bg-success/10 text-success' :
                                                user.status === 'pending' ? 'bg-warning/10 text-warning' :
                                                    user.status === 'rejected' ? 'bg-error/10 text-error' :
                                                        'bg-page text-muted'
                                                }`}>
                                                {t(`user.status.${user.status}`)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1 items-center">
                                                <button onClick={() => setUserComm(user)} className="p-2 text-accent hover:bg-accent/10 rounded-lg border border-transparent" title={t('comm.title')}>
                                                    <MessageCircle size={18} />
                                                </button>
                                                {user.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleUserStatus(user.id, 'active')} className="p-2 text-success hover:bg-success/10 rounded-lg" title={t('user.action.approve')}><CheckCircle size={18} /></button>
                                                        <button onClick={() => handleUserStatus(user.id, 'rejected')} className="p-2 text-error hover:bg-error/10 rounded-lg" title={t('user.action.reject')}><XCircle size={18} /></button>
                                                    </>
                                                )}
                                                <button onClick={() => setUserEditing(user)} className="p-2 text-accent hover:bg-accent/10 rounded-lg ml-1" title={t('edit')}>
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-error hover:bg-error/10 rounded-lg ml-1" title={t('delete')}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted">Nenhum usu\u00e1rio encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-border">
                                <span className="text-xs text-muted">
                                    {t('pagination.showing')} {startIndex + 1}-{endIndex} {t('pagination.of')} {filteredUsers.length}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className="p-1 rounded hover:bg-page disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-sm font-medium px-2">{currentPage} / {totalPages}</span>
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className="p-1 rounded hover:bg-page disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
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
