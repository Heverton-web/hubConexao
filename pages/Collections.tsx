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
        <div className="space-y-12 animate-reveal pb-20">
            {/* Header Aura */}
            <div className="aura-glass p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl heading-aura text-white mb-4">Trilhas de Aprendizado</h1>
                    <p className="text-[15px] text-white/30 font-medium max-w-lg">
                        Sua jornada de conhecimento organizada em coleções curadas e exclusivas.
                    </p>
                </div>

                <div className="relative w-full md:w-80 group/search">
                    <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl opacity-0 group-focus-within/search:opacity-20 transition-all duration-500"></div>
                    <div className="relative bg-white/[0.01] rounded-2xl flex items-center shadow-inner transition-all duration-300 group-focus-within/search:bg-white/[0.02]">
                        <div className="pl-5 text-white/20 group-focus-within/search:text-accent transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar trilhas..."
                            className="w-full bg-transparent border-none py-4 px-4 text-white placeholder-white/10 focus:ring-0 text-[13px] font-bold outline-none uppercase tracking-widest"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-80 aura-glass rounded-[2rem] animate-pulse"></div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-24 aura-glass rounded-[2.5rem] text-center">
                    <Layers size={32} className="mx-auto text-white/5 mb-4" />
                    <h3 className="text-lg font-bold text-white/40 mb-2">Nenhuma trilha encontrada</h3>
                    <p className="text-[12px] text-white/20">Tente ajustar seus termos de busca.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
