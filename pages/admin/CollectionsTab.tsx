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

    const handleSave = async (col: Partial<Collection>) => {
        if (col.id) {
            await mockDb.updateCollection(col as Collection);
        } else {
            await mockDb.createCollection(col as any);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface rounded-xl"></div>)}
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl shadow-sm border border-border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar coleções..."
                        className="w-full bg-page border-none rounded-lg pl-10 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleCreate}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-accent text-white px-6 py-2 rounded-lg font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                >
                    <Plus size={18} /> Nova Coleção
                </button>
            </div>

            {/* Grid */}
            {filteredCollections.length === 0 ? (
                <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-page rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
                        <FolderOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-main">Nenhuma coleção encontrada</h3>
                    <p className="text-muted text-sm">Crie uma nova coleção para começar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCollections.map(col => (
                        <CollectionCard
                            key={col.id}
                            collection={col}
                            isAdmin
                            onClick={() => handleEdit(col)}
                            onEdit={() => handleEdit(col)}
                            onDelete={() => handleDelete(col)} // Card needs to support delete button if we want or just open modal
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
