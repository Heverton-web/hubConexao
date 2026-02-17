import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Collection, Language, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, Layers, Image as ImageIcon, Globe, Trash2 } from 'lucide-react';

interface CollectionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (collection: Partial<Collection>) => Promise<void>;
    initialData?: Collection | null;
}

export const CollectionFormModal: React.FC<CollectionFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState<Record<Language, string>>({ 'pt-br': '', 'en-us': '', 'es-es': '' });
    const [description, setDescription] = useState<Record<Language, string>>({ 'pt-br': '', 'en-us': '', 'es-es': '' });
    const [coverImage, setCoverImage] = useState('');
    const [allowedRoles, setAllowedRoles] = useState<Role[]>(['client', 'distributor', 'consultant']);
    const [active, setActive] = useState(true);

    // Tab State for Multi-language
    const [activeLang, setActiveLang] = useState<Language>('pt-br');

    useEffect(() => {
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
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setTitle({ 'pt-br': '', 'en-us': '', 'es-es': '' });
        setDescription({ 'pt-br': '', 'en-us': '', 'es-es': '' });
        setCoverImage('');
        setAllowedRoles(['client', 'distributor', 'consultant']);
        setActive(true);
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
            });
            onClose();
        } catch (error) {
            alert('Erro ao salvar coleção');
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

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-slide-up">

                {/* --- Left Panel: Visual Preview (Hidden on Mobile) --- */}
                <div className="hidden md:flex flex-col w-1/3 bg-page/50 border-r border-border p-6 justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-surface rounded-2xl shadow-lg flex items-center justify-center mb-4 mx-auto border border-border">
                            {coverImage ? (
                                <img src={coverImage} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <Layers size={32} className="text-accent" />
                            )}
                        </div>
                        <h3 className="font-bold text-main line-clamp-2">{title[activeLang] || 'Nova Coleção'}</h3>
                        <p className="text-xs text-muted mt-2 line-clamp-3">{description[activeLang] || 'Adicione uma descrição para visualizar aqui.'}</p>
                    </div>
                </div>

                {/* --- Right Panel: Form --- */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
                        <div>
                            <h2 className="font-bold text-lg text-main">{initialData ? 'Editar Coleção' : 'Nova Coleção'}</h2>
                            <p className="text-xs text-muted">Agrupe materiais em trilhas de aprendizado.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-page rounded-full text-muted hover:text-main">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {/* Language Tabs */}
                        <div className="flex gap-2 mb-4 border-b border-border pb-2">
                            {(['pt-br', 'en-us', 'es-es'] as Language[]).map(lang => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setActiveLang(lang)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all
                            ${activeLang === lang ? 'bg-accent/10 text-accent ring-1 ring-accent/20' : 'text-muted hover:bg-page hover:text-main'}
                          `}
                                >
                                    <Globe size={12} /> {lang}
                                </button>
                            ))}
                        </div>

                        {/* Title & Description inputs for active Lang */}
                        <div className="space-y-4 animate-fade-in" key={activeLang}>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1">Título ({activeLang})</label>
                                <input
                                    type="text"
                                    className="w-full bg-page border border-border rounded-lg p-2.5 text-main text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
                                    placeholder="Ex: Onboarding 2024"
                                    value={title[activeLang]}
                                    onChange={e => setTitle({ ...title, [activeLang]: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1">Descrição ({activeLang})</label>
                                <textarea
                                    className="w-full bg-page border border-border rounded-lg p-2.5 text-main text-sm focus:ring-2 focus:ring-accent outline-none transition-all resize-none h-24"
                                    placeholder="Breve resumo sobre esta coleção..."
                                    value={description[activeLang]}
                                    onChange={e => setDescription({ ...description, [activeLang]: e.target.value })}
                                />
                            </div>
                        </div>

                        <hr className="border-border/50 dashed" />

                        {/* Cover Image */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-1 flex items-center gap-2">
                                <ImageIcon size={14} /> URL da Imagem de Capa
                            </label>
                            <input
                                type="url"
                                className="w-full bg-page border border-border rounded-lg p-2.5 text-main text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
                                placeholder="https://..."
                                value={coverImage}
                                onChange={e => setCoverImage(e.target.value)}
                            />
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-2">Visibilidade</label>
                            <div className="flex flex-wrap gap-2">
                                {(['client', 'distributor', 'consultant'] as Role[]).map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => toggleRole(role)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all
                                    ${allowedRoles.includes(role)
                                                ? 'bg-accent text-white border-accent'
                                                : 'bg-page text-muted border-border hover:border-accent/50'}
                                `}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center gap-3 bg-page p-3 rounded-xl border border-border">
                            <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${active ? 'bg-success' : 'bg-gray-300 dark:bg-gray-700'}`} onClick={() => setActive(!active)}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${active ? 'translate-x-4' : ''}`} />
                            </div>
                            <span className="text-sm font-medium text-main">Coleção Ativa</span>
                        </div>
                    </div>

                    <div className="p-6 border-t border-border bg-page/30 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-muted hover:text-main transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-6 py-2 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Salvando...' : <><Save size={18} /> Salvar Coleção</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
