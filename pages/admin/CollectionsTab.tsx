import React, { useState, useEffect } from 'react';
import { Collection, Role } from '../../types';
import { mockDb } from '../../lib/mockDb';
import { useLanguage } from '../../contexts/LanguageContext';
import { CollectionCard } from '../../components/CollectionCard';
import { SkeletonCard } from '../../components/SkeletonCard'; // Reuse skeleton card for now
import { CollectionFormModal } from '../../components/CollectionFormModal';
import { Plus, Search, FolderOpen, Layers } from 'lucide-react';

interface CollectionsTabProps {
    isLoading?: boolean;
}

export const CollectionsTab: React.FC<CollectionsTabProps> = ({ isLoading: globalLoading }) => {
    const { t } = useLanguage();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            // Fetch all collections as super_admin role for management
            const data = await mockDb.getCollections('super_admin');
            setCollections(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!globalLoading) {
            fetchCollections();
        }
    }, [globalLoading]);

    const handleSave = async (col: Partial<Collection>, materialIds: string[]) => {
        let savedCol: Collection;
        if (col.id) {
            await mockDb.updateCollection(col as Collection);
            savedCol = col as Collection;
        } else {
            savedCol = await mockDb.createCollection(col as any);
        }

        // Logic for handling item updates (simplified for mock/base version)
        // In a real DB we'd want a more robust sync, but here we can:
        // 1. Remove old items (if editing)
        if (col.id) {
            const currentItems = await mockDb.getCollectionItems(col.id);
            for (const item of currentItems) {
                await mockDb.removeMaterialFromCollection(item.item.id);
            }
        }

        // 2. Add new items in order
        for (const matId of materialIds) {
            await mockDb.addMaterialToCollection(savedCol.id, matId);
        }

        setIsModalOpen(false);
        fetchCollections();
    };

    const handleEdit = (col: Collection) => {
        setEditingCollection(col);
        setIsModalOpen(true);
    };

    const handleDelete = async (col: Collection) => {
        if (confirm('Tem certeza que deseja excluir esta coleção?')) {
            await mockDb.deleteCollection(col.id);
            fetchCollections();
        }
    };

    const handleCreate = () => {
        setEditingCollection(null);
        setIsModalOpen(true);
    };

    const filteredCollections = collections.filter(c => {
        const title = Object.values(c.title).join(' ').toLowerCase();
        return title.includes(searchTerm.toLowerCase());
    });

    if (globalLoading || (loading && collections.length === 0)) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-80 aura-glass rounded-[2rem]"></div>)}
            </div>
        );
    }

    return (
        <div className="animate-reveal space-y-10">
            {/* Actions Bar Aura */}
            <div className="aura-glass p-6 rounded-[2.5rem] flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="relative w-full lg:w-96 group/search">
                    <div className="absolute inset-0 bg-accent/20 rounded-xl blur-lg opacity-0 group-focus-within/search:opacity-10 transition-all duration-500"></div>
                    <div className="relative bg-white/[0.01] rounded-xl flex items-center transition-all duration-300 group-focus-within/search:bg-white/[0.02]">
                        <div className="pl-4 text-white/20 group-focus-within/search:text-accent transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar coleções..."
                            className="w-full bg-transparent border-none py-3 px-4 text-white placeholder-white/10 focus:ring-0 text-[13px] font-bold outline-none uppercase tracking-widest"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="btn-aura-lume px-10 py-3.5 flex items-center justify-center gap-3 w-full lg:w-auto"
                >
                    <Plus size={18} /> Nova Coleção
                </button>
            </div>

            {/* Grid Aura */}
            {filteredCollections.length === 0 ? (
                <div className="text-center py-32 aura-glass rounded-[2.5rem] overflow-hidden relative group">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent opacity-30"></div>
                    <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-6 text-white/10 group-hover:text-accent/40 transition-colors duration-700 relative z-10">
                        <Layers size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white/40 heading-aura relative z-10 mb-2">Nenhuma coleção encontrada</h3>
                    <p className="text-white/20 text-[12px] font-medium uppercase tracking-widest relative z-10">Crie uma nova trilha premium para começar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {filteredCollections.map(col => (
                        <CollectionCard
                            key={col.id}
                            collection={col}
                            isAdmin
                            onClick={() => handleEdit(col)}
                            onEdit={() => handleEdit(col)}
                            onDelete={() => handleDelete(col)}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <CollectionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingCollection}
            />
        </div>
    );
};
