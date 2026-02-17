import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Collection } from '../types';
import { mockDb } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CollectionCard } from '../components/CollectionCard';
import { Search, Layers } from 'lucide-react';

export const Collections: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCollections = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const data = await mockDb.getCollections(user.role);
                setCollections(data);
            } catch (error) {
                console.error("Failed to load collections", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, [user]);

    const filtered = collections.filter(c => {
        const title = Object.values(c.title).join(' ').toLowerCase();
        return title.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-main mb-2">Trilhas de Aprendizado</h1>
                    <p className="text-muted">Coleções curadas de materiais para impulsionar seu conhecimento.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar trilhas..."
                        className="w-full bg-surface border border-transparent focus:border-accent/50 rounded-xl pl-10 py-3 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-72 bg-surface/50 rounded-2xl border border-white/5"></div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted">
                    <Layers size={48} className="mb-4 opacity-50" />
                    <p>Nenhuma trilha encontrada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(col => (
                        <CollectionCard
                            key={col.id}
                            collection={col}
                            onClick={() => navigate(`/collections/${col.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
