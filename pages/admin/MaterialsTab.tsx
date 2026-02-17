import React, { useMemo, useState } from 'react';
import { Material, Language, MaterialType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { mockDb } from '../../lib/mockDb';
import { Plus, Trash2, Edit, Eye, EyeOff, Search, FileText, Image as ImageIcon, Video, ChevronRight, ChevronLeft } from 'lucide-react';
import { MaterialFormModal } from '../../components/MaterialFormModal';
import { ViewerModal } from '../../components/ViewerModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SkeletonTable } from '../../components/SkeletonTable';
import { usePagination } from '../../hooks/usePagination';

interface MaterialsTabProps {
    materials: Material[];
    onReload: () => void;
    isLoading?: boolean;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ materials, onReload, isLoading = false }) => {
    const { t, language } = useLanguage();
    const { addToast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language } | null>(null);

    // Filters
    const [materialSearch, setMaterialSearch] = useState('');
    const [materialTypeFilter, setMaterialTypeFilter] = useState<MaterialType | 'all'>('all');
    const [materialStatusFilter, setMaterialStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Delete confirmation
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const filteredMaterials = useMemo(() => {
        return materials.filter(mat => {
            const displayTitle = (mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '').toLowerCase();
            const matchesSearch = displayTitle.includes(materialSearch.toLowerCase());
            const matchesType = materialTypeFilter === 'all' || mat.type === materialTypeFilter;
            const matchesStatus = materialStatusFilter === 'all'
                ? true
                : materialStatusFilter === 'active' ? mat.active
                    : !mat.active;
            return matchesSearch && matchesType && matchesStatus;
        }).sort((a, b) => {
            const titleA = (a.title[language] || a.title['pt-br'] || '').toLowerCase();
            const titleB = (b.title[language] || b.title['pt-br'] || '').toLowerCase();
            return titleA.localeCompare(titleB);
        });
    }, [materials, materialSearch, materialTypeFilter, materialStatusFilter, language]);

    // Pagination
    const {
        currentData,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        startIndex,
        endIndex
    } = usePagination({ data: filteredMaterials, itemsPerPage: 10 });

    const handleOpenCreate = () => { setEditingMaterial(null); setIsFormOpen(true); };
    const handleOpenEdit = (material: Material) => { setEditingMaterial(material); setIsFormOpen(true); };

    const handleSaveMaterial = async (materialData: any) => {
        try {
            if (materialData.id) {
                await mockDb.updateMaterial(materialData);
            } else {
                await mockDb.createMaterial(materialData);
            }
            onReload();
        } catch (e: any) {
            addToast('Erro ao salvar material: ' + (e.message || e.details || JSON.stringify(e)), 'error');
        }
    };

    const handleToggleActive = async (material: Material) => {
        try {
            await mockDb.updateMaterial({ ...material, active: !material.active });
            onReload();
        } catch (e: any) {
            addToast('Erro ao atualizar status: ' + e.message, 'error');
        }
    };

    const handleDeleteMaterial = (id: string) => { setItemToDelete(id); setIsConfirmOpen(true); };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await mockDb.deleteMaterial(itemToDelete);
            onReload();
        } catch (e: any) {
            addToast('Erro ao excluir: ' + e.message, 'error');
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleView = (material: Material) => {
        const langs: Language[] = ['pt-br', 'en-us', 'es-es'];
        const availableLang = langs.find(l => material.assets[l]?.url);
        if (availableLang) {
            setViewingMaterial({ mat: material, lang: availableLang });
        } else {
            addToast(t('no.materials'), 'warning');
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Filters Toolbar */}
            <div className="bg-surface p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder={t('search.placeholder')}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2 focus:ring-accent text-main"
                        value={materialSearch}
                        onChange={e => setMaterialSearch(e.target.value)}
                    />
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <select
                        className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                        value={materialTypeFilter}
                        onChange={e => setMaterialTypeFilter(e.target.value as any)}
                    >
                        <option value="all">{t('filter.all')}</option>
                        <option value="pdf">{t('material.type.pdf')}</option>
                        <option value="image">{t('material.type.image')}</option>
                        <option value="video">{t('material.type.video')}</option>
                    </select>
                    <select
                        className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none text-main"
                        value={materialStatusFilter}
                        onChange={e => setMaterialStatusFilter(e.target.value as any)}
                    >
                        <option value="all">{t('user.filter.status.all')}</option>
                        <option value="active">{t('active')}</option>
                        <option value="inactive">{t('inactive')}</option>
                    </select>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-accent hover:bg-opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-accent/20 transition-all hover:scale-105 whitespace-nowrap"
                >
                    <Plus size={20} />
                    <span className="hidden md:inline">{t('add.material')}</span>
                </button>
            </div>

            <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <SkeletonTable rows={5} columns={6} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-page text-xs uppercase text-muted font-semibold">
                                <tr>
                                    <th className="p-4">{t('title')}</th>
                                    <th className="p-4">{t('type')}</th>
                                    <th className="p-4 text-center">{t('status')}</th>
                                    <th className="p-4">{t('permissions')}</th>
                                    <th className="p-4">Assets</th>
                                    <th className="p-4 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {currentData.map(mat => {
                                    const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                                    return (
                                        <tr key={mat.id} className="hover:bg-page transition-colors text-main">
                                            <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                                            <td className="p-4 capitalize opacity-75">{mat.type}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${mat.active
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-page text-muted'
                                                    }`}>
                                                    {mat.active ? t('active') : t('inactive')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex -space-x-1">
                                                    {mat.allowedRoles.map(r => (
                                                        <div key={r} className="w-6 h-6 rounded-full bg-page flex items-center justify-center text-[10px] uppercase text-muted font-bold shadow-sm" title={t(`role.${r}`)}>
                                                            {r[0]}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {Object.keys(mat.assets).map(lang => (
                                                        <span key={lang} className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded uppercase font-semibold">
                                                            {lang.split('-')[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleView(mat)} className="p-2 text-muted hover:text-accent rounded-lg"><Eye size={18} /></button>
                                                    <button onClick={() => handleToggleActive(mat)} className={`p-2 rounded-lg ${mat.active ? 'text-muted hover:text-error' : 'text-muted hover:text-success'}`}>{mat.active ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                                                    <button onClick={() => handleOpenEdit(mat)} className="p-2 text-accent hover:bg-accent/10 rounded-lg"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 text-error hover:bg-error/10 rounded-lg"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredMaterials.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted">{t('no.materials')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-border">
                                <span className="text-xs text-muted">
                                    {t('pagination.showing')} {startIndex + 1}-{endIndex} {t('pagination.of')} {filteredMaterials.length}
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
            {isFormOpen && (
                <MaterialFormModal
                    initialData={editingMaterial}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSaveMaterial}
                />
            )}

            {viewingMaterial && (
                <ViewerModal
                    material={viewingMaterial.mat}
                    language={viewingMaterial.lang}
                    onClose={() => setViewingMaterial(null)}
                />
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
