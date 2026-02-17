import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Collection, CollectionItem, Material } from '../types';
import { mockDb } from '../lib/mockDb';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Layers, PlayCircle, Lock, CheckCircle, Clock } from 'lucide-react';
import { MaterialCard } from '../components/MaterialCard'; // We can reuse this or make a list item version
import { ViewerModal } from '../components/ViewerModal';

export const CollectionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language, t } = useLanguage();

    const [collection, setCollection] = useState<Collection | null>(null);
    const [items, setItems] = useState<{ item: CollectionItem, material: Material | null }[]>([]);
    const [loading, setLoading] = useState(true);

    // Viewer State
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerLang, setViewerLang] = useState<string>('pt-br');

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const col = await mockDb.getCollectionById(id);
                setCollection(col);
                if (col) {
                    const colItems = await mockDb.getCollectionItems(id);
                    setItems(colItems);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleOpenMaterial = (material: Material, lang: string) => {
        setSelectedMaterial(material);
        setViewerLang(lang);
        setViewerOpen(true);
        // Log access here if needed, or ViewerModal handles it? 
        // ViewerModal handles it on mount usually, but let's explicity log for collections tracking later
        if (user) mockDb.logAccess(material.id, user.id, lang as any);
    };

    // Need user for logging
    const { user } = require('../contexts/AuthContext').useAuth();

    if (loading) {
        return <div className="animate-pulse h-96 bg-surface rounded-2xl m-6"></div>;
    }

    if (!collection) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-xl font-bold text-main">Trilha não encontrada</h2>
                <button onClick={() => navigate('/collections')} className="mt-4 text-accent hover:underline">Voltar para Trilhas</button>
            </div>
        );
    }

    const title = collection.title[language] || collection.title['pt-br'];
    const description = collection.description?.[language] || collection.description?.['pt-br'];

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-b-3xl -mt-6 mx-auto max-w-7xl shadow-2xl">
                {collection.coverImage ? (
                    <img src={collection.coverImage} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                        <Layers size={64} className="text-white/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-page via-page/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                    <button
                        onClick={() => navigate('/collections')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm font-bold uppercase tracking-wider bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit"
                    >
                        <ArrowLeft size={16} /> Voltar para Trilhas
                    </button>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{title}</h1>
                    <p className="text-white/80 text-lg md:w-2/3 leading-relaxed drop-shadow-md">{description}</p>
                </div>
            </div>

            {/* Content List */}
            <div className="max-w-5xl mx-auto mt-12 px-4 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-accent rounded-full"></div>
                    <h2 className="text-2xl font-bold text-main">Conteúdo da Trilha</h2>
                    <span className="text-muted text-sm font-medium">({items.length} itens)</span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-border before:content-['']">
                    {items.map((itemObj, index) => {
                        if (!itemObj.material) return null; // Skip deleted materials
                        const mat = itemObj.material;
                        const matTitle = mat.title[language] || mat.title['pt-br'];

                        return (
                            <div key={itemObj.item.id} className="relative pl-10 group">
                                {/* Timeline Node */}
                                <div className="absolute left-[11px] top-6 w-3 h-3 rounded-full bg-surface border-2 border-accent z-10 group-hover:scale-125 transition-transform shadow-[0_0_0_4px_var(--color-page)]"></div>

                                {/* Card */}
                                <div className="bg-surface border border-border p-5 rounded-xl hover:shadow-lg hover:border-accent/30 transition-all duration-300 flex flex-col md:flex-row gap-4 md:items-center justify-between group-hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-page flex items-center justify-center text-accent shrink-0">
                                            <span className="font-bold text-lg">{index + 1}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-main group-hover:text-accent transition-colors">{matTitle}</h3>
                                            <span className="text-xs uppercase font-bold text-muted bg-page px-2 py-0.5 rounded border border-border mt-1 inline-block">
                                                {t(`material.type.${mat.type}`)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOpenMaterial(mat, 'pt-br')} // Default to pt-br or detection
                                        className="px-5 py-2.5 rounded-lg bg-accent/10 text-accent font-bold hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <PlayCircle size={18} /> Acessar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedMaterial && (
                <ViewerModal
                    isOpen={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    material={selectedMaterial}
                    initialLanguage={viewerLang as any}
                />
            )}
        </div>
    );
};
