import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Collection, Language, Role, Material, CollectionItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDb } from '../lib/mockDb';
import { X, Save, Layers, Image as ImageIcon, Globe, Trash2, Search, Plus, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface CollectionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (collection: Partial<Collection>, materialIds: string[]) => Promise<void>;
    initialData?: Collection | null;
}

export const CollectionFormModal: React.FC<CollectionFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { t, language: currentLang } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Data Sources
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [title, setTitle] = useState<Record<Language, string>>({ 'pt-br': '', 'en-us': '', 'es-es': '' });
    const [description, setDescription] = useState<Record<Language, string>>({ 'pt-br': '', 'en-us': '', 'es-es': '' });
    const [coverImage, setCoverImage] = useState('');
    const [allowedRoles, setAllowedRoles] = useState<Role[]>(['client', 'distributor', 'consultant']);
    const [active, setActive] = useState(true);
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);

    // Tab State
    const [activeTab, setActiveTab] = useState<'info' | 'materials'>('info');
    const [activeLang, setActiveLang] = useState<Language>('pt-br');

    useEffect(() => {
        if (isOpen) {
            loadMaterials();
            if (initialData) {
                setTitle({
                    'pt-br': initialData.title['pt-br'] || '',
                    'en-us': initialData.title['en-us'] || '',
                    'es-es': initialData.title['es-es'] || ''
                });
                setDescription({
                    'pt-br': initialData.description?.['pt-br'] || '',
                    'en-us': initialData.description?.['en-us'] || '',
                    'es-es': initialData.description?.['es-es'] || ''
                });
                setCoverImage(initialData.coverImage || '');
                setAllowedRoles(initialData.allowedRoles);
                setActive(initialData.active);
                loadCollectionItems(initialData.id);
            } else {
                resetForm();
            }
        }
    }, [initialData, isOpen]);

    const loadMaterials = async () => {
        try {
            const mats = await mockDb.getMaterials('super_admin');
            setAllMaterials(mats);
        } catch (e) {
            console.error(e);
        }
    };

    const loadCollectionItems = async (colId: string) => {
        try {
            const items = await mockDb.getCollectionItems(colId);
            setSelectedMaterialIds(items.map(i => i.item.materialId));
        } catch (e) {
            console.error(e);
        }
    };

    const resetForm = () => {
        setTitle({ 'pt-br': '', 'en-us': '', 'es-es': '' });
        setDescription({ 'pt-br': '', 'en-us': '', 'es-es': '' });
        setCoverImage('');
        setAllowedRoles(['client', 'distributor', 'consultant']);
        setActive(true);
        setSelectedMaterialIds([]);
        setActiveTab('info');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                id: initialData?.id,
                title,
                description,
                coverImage,
                allowedRoles,
                active
            }, selectedMaterialIds);
            onClose();
        } catch (error) {
            alert('Erro ao salvar trilha');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = (role: Role) => {
        setAllowedRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const toggleMaterial = (matId: string) => {
        setSelectedMaterialIds(prev =>
            prev.includes(matId) ? prev.filter(id => id !== matId) : [...prev, matId]
        );
    };

    // Wait, let's fix the toggleMaterial logic:
    // setSelectedMaterialIds(prev => prev.includes(matId) ? prev.filter(id => id !== matId) : [...prev, matId]);

    const moveMaterial = (index: number, direction: 'up' | 'down') => {
        const newIds = [...selectedMaterialIds];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newIds.length) {
            [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
            setSelectedMaterialIds(newIds);
        }
    };

    const filteredMaterials = allMaterials.filter(m => {
        const t = m.title['pt-br']?.toLowerCase() || '';
        return t.includes(searchTerm.toLowerCase()) || m.category?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center bg-surface shrink-0">
                    <div>
                        <h2 className="font-bold text-xl text-main">{initialData ? 'Editar Trilha' : 'Nova Trilha'}</h2>
                        <p className="text-xs text-muted">A trilha organiza materiais em uma sequência de aprendizado.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs Toggle */}
                <div className="flex px-6 bg-page/30 shrink-0">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'info' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-main'}`}
                    >
                        Informações Básicas
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'materials' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-main'}`}
                    >
                        Materiais da Trilha
                        <span className="bg-muted/20 text-muted text-[10px] px-1.5 py-0.5 rounded-full">{selectedMaterialIds.length}</span>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Flow (Content) */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {activeTab === 'info' ? (
                            <div className="space-y-6">
                                {/* Language Switcher */}
                                <div className="flex gap-2 p-1 bg-page rounded-xl w-fit border border-border">
                                    {(['pt-br', 'en-us', 'es-es'] as Language[]).map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setActiveLang(lang)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all
                                                ${activeLang === lang ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-main'}
                                            `}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-muted uppercase mb-1.5">Título ({activeLang})</label>
                                            <input
                                                type="text"
                                                className="w-full bg-page rounded-xl p-3 text-main text-sm focus:border-accent/20 outline-none transition-all"
                                                placeholder="Ex: Formação em Vendas"
                                                value={title[activeLang]}
                                                onChange={e => setTitle({ ...title, [activeLang]: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted uppercase mb-1.5">Descrição ({activeLang})</label>
                                            <textarea
                                                className="w-full bg-page rounded-xl p-3 text-main text-sm focus:border-accent/20 outline-none transition-all resize-none h-32"
                                                placeholder="Explique o objetivo desta trilha..."
                                                value={description[activeLang]}
                                                onChange={e => setDescription({ ...description, [activeLang]: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-muted uppercase mb-1.5 flex items-center gap-2">
                                                <ImageIcon size={14} /> URL da Capa
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full bg-page rounded-xl p-3 text-main text-sm focus:border-accent/20 outline-none transition-all"
                                                placeholder="https://..."
                                                value={coverImage}
                                                onChange={e => setCoverImage(e.target.value)}
                                            />
                                            {coverImage && (
                                                <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-border bg-page">
                                                    <img src={coverImage} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-border" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-muted uppercase mb-3">Público Alvo</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['client', 'distributor', 'consultant'] as Role[]).map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => toggleRole(role)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all
                                                        ${allowedRoles.includes(role)
                                                            ? 'bg-accent/10 text-accent'
                                                            : 'bg-page text-muted hover:text-main'}
                                                    `}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted uppercase mb-3">Status da Trilha</label>
                                        <div
                                            className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${active ? 'bg-success/10' : 'bg-page'}`}
                                            onClick={() => setActive(!active)}
                                        >
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${active ? 'bg-success' : 'bg-gray-400'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${active ? 'translate-x-4' : ''}`} />
                                            </div>
                                            <span className={`text-sm font-bold ${active ? 'text-success' : 'text-muted'}`}>
                                                {active ? 'Atividade Liberada' : 'Rascunho / Inativa'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full gap-6">
                                {/* Search Materials */}
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Buscar materiais para adicionar..."
                                            className="w-full bg-page rounded-xl pl-10 pr-4 py-3 text-sm focus:border-accent/20 outline-none"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredMaterials.map(mat => {
                                        const isSelected = selectedMaterialIds.includes(mat.id);
                                        return (
                                            <div
                                                key={mat.id}
                                                onClick={() => toggleMaterial(mat.id)}
                                                className={`p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 group
                                                    ${isSelected ? 'bg-accent/5' : 'bg-page hover:bg-page/80'}
                                                `}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-accent text-white' : 'bg-surface text-muted group-hover:text-accent'}`}>
                                                    {isSelected ? <X size={16} /> : <Plus size={16} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-main truncate">{mat.title['pt-br']}</h4>
                                                    <p className="text-[10px] text-muted uppercase flex items-center gap-1">
                                                        {mat.type} • {mat.category || 'Geral'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Flow (Sidebar Summary / Reordering) */}
                    <div className="w-full md:w-80 bg-page/50 p-6 flex flex-col shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                <Layers size={14} className="text-accent" /> Ordem dos Materiais
                            </h3>
                        </div>

                        {selectedMaterialIds.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                <Plus size={32} className="mb-2" />
                                <p className="text-xs font-medium">Nenhum material<br />selecionado ainda.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {selectedMaterialIds.map((id, index) => {
                                    const mat = allMaterials.find(m => m.id === id);
                                    if (!mat) return null;
                                    return (
                                        <div key={id} className="bg-surface p-2.5 rounded-xl flex items-center gap-3 shadow-sm group animate-fade-in">
                                            <div className="w-6 h-6 bg-page rounded font-mono text-[10px] flex items-center justify-center text-muted shrink-0">
                                                {index + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-main truncate">{mat.title['pt-br']}</p>
                                            </div>

                                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveMaterial(index, 'up'); }}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-page rounded text-muted hover:text-accent disabled:opacity-20"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveMaterial(index, 'down'); }}
                                                    disabled={index === selectedMaterialIds.length - 1}
                                                    className="p-1 hover:bg-page rounded text-muted hover:text-accent disabled:opacity-20"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="pt-4 mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || selectedMaterialIds.length === 0}
                                className={`w-full py-3 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''} ${selectedMaterialIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Carregando...' : <><Save size={18} /> Salvar Trilha</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
