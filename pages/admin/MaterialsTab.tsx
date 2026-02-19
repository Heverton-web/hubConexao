import React, { useMemo, useState } from 'react';
import { Material, Language, MaterialType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { mockDb } from '../../lib/mockDb';
import { Plus, Trash2, Pencil, Eye, EyeOff, Search, FileText, Image as ImageIcon, Video, ChevronRight, ChevronLeft } from 'lucide-react';
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
    } = usePagination<Material>({ data: filteredMaterials, itemsPerPage: 10 });

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
        <div className="animate-reveal space-y-8">
            {/* Filters Toolbar Aura */}
            <div className="aura-glass p-6 rounded-3xl flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full group/search">
                    <div className="absolute inset-0 bg-accent/20 rounded-xl blur-lg opacity-0 group-focus-within/search:opacity-10 transition-all duration-500"></div>
                    <div className="relative bg-main/[0.01] rounded-xl flex items-center transition-all duration-300 group-focus-within/search:bg-main/[0.03]">
                        <div className="pl-4 text-main/20 group-focus-within/search:text-accent transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            className="w-full bg-transparent border-none py-3 px-4 text-main placeholder-main/10 focus:ring-0 text-[13px] font-bold outline-none uppercase tracking-widest"
                            value={materialSearch}
                            onChange={e => setMaterialSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex w-full lg:w-auto gap-4">
                    <select
                        className="flex-1 lg:w-44 py-3 px-4 rounded-xl bg-main/[0.01] text-[10px] font-black uppercase tracking-widest text-main/40 outline-none focus:bg-main/[0.03] transition-all appearance-none cursor-pointer"
                        value={materialTypeFilter}
                        onChange={e => setMaterialTypeFilter(e.target.value as any)}
                    >
                        <option value="all" className="bg-surface">{t('filter.all')}</option>
                        <option value="pdf" className="bg-surface">{t('material.type.pdf')}</option>
                        <option value="image" className="bg-surface">{t('material.type.image')}</option>
                        <option value="video" className="bg-surface">{t('material.type.video')}</option>
                    </select>

                    <select
                        className="flex-1 lg:w-44 py-3 px-4 rounded-xl bg-main/[0.01] text-[10px] font-black uppercase tracking-widest text-main/40 outline-none focus:bg-main/[0.03] transition-all appearance-none cursor-pointer"
                        value={materialStatusFilter}
                        onChange={e => setMaterialStatusFilter(e.target.value as any)}
                    >
                        <option value="all" className="bg-surface">{t('user.filter.status.all')}</option>
                        <option value="active" className="bg-surface">{t('active')}</option>
                        <option value="inactive" className="bg-surface">{t('inactive')}</option>
                    </select>

                    <button
                        onClick={handleOpenCreate}
                        className="btn-aura-lume px-8 py-3 flex items-center justify-center gap-3 w-full lg:w-auto"
                    >
                        <Plus size={18} />
                        <span>Novo Material</span>
                    </button>
                </div>
            </div>

            <div className="aura-glass rounded-[2rem] overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex items-center justify-center text-white/5 uppercase font-black tracking-[0.5em] animate-pulse">Processando Materiais...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-main/[0.02]">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('title')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('type')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center">{t('status')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t('permissions')}</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Assets</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {currentData.map(mat => {
                                    const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                                    return (
                                        <tr key={mat.id} className="group hover:bg-main/[0.01] transition-colors">
                                            <td className="p-6">
                                                <div className="font-bold text-main/80 group-hover:text-main transition-colors truncate max-w-xs">{displayTitle}</div>
                                                <div className="text-[10px] text-main/20 font-medium uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">ID: {mat.id}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{mat.type}</span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${mat.active
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-main/[0.05] text-main/20'
                                                    }`}>
                                                    {mat.active ? t('active') : t('inactive')}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex -space-x-2">
                                                    {mat.allowedRoles.map(r => (
                                                        <div key={r} className="w-8 h-8 rounded-xl bg-main/[0.03] flex items-center justify-center text-[10px] uppercase text-main/40 font-black shadow-lg" title={t(`role.${r}`)}>
                                                            {r[0]}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex gap-2">
                                                    {Object.keys(mat.assets).map(lang => (
                                                        <span key={lang} className="text-[9px] px-2 py-0.5 bg-accent/10 text-accent rounded-md uppercase font-black tracking-widest">
                                                            {lang.split('-')[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleView(mat)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all"><Eye size={16} /></button>
                                                    <button onClick={() => handleToggleActive(mat)} className={`w-10 h-10 flex items-center justify-center text-white/20 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all ${mat.active ? 'hover:text-error' : 'hover:text-success'}`}>{mat.active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                                                    <button onClick={() => handleOpenEdit(mat)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-accent bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all"><Pencil size={16} /></button>
                                                    <button onClick={() => handleDeleteMaterial(mat.id)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-error bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredMaterials.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-white/10 uppercase font-black tracking-[0.2em]">{t('no.materials')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Footer Aura */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20 mb-4 sm:mb-0">
                                    {t('pagination.showing')} {startIndex + 1}-{endIndex} {t('pagination.of')} {filteredMaterials.length}
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
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] text-white/20 hover:text-white disabled:opacity-5 transition-all outline-none"
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
