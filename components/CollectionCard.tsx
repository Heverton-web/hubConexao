import React from 'react';
import { Collection } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Layers, ChevronRight, MoreVertical, PlayCircle, FolderOpen, Award, CheckCircle2 } from 'lucide-react';

interface CollectionCardProps {
    collection: Collection;
    onClick: (collection: Collection) => void;
    isAdmin?: boolean;
    onEdit?: (collection: Collection) => void;
    onDelete?: (collection: Collection) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onClick, isAdmin, onEdit, onDelete }) => {
    const { language, t } = useLanguage();

    const title = collection.title[language] || collection.title['pt-br'] || 'Sem título';
    const description = collection.description?.[language] || collection.description?.['pt-br'] || '';

    return (
        <div
            className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            onClick={() => {
                onClick(collection);
            }}
        >
            {/* Cover Image or Gradient Placeholder */}
            <div className="h-40 w-full relative overflow-hidden bg-page">
                {collection.coverImage ? (
                    <img
                        src={collection.coverImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center">
                        <Layers size={48} className="text-accent/40" />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />

                {/* Badge Trilha */}
                <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] uppercase font-bold text-accent shadow-sm border border-white/10 flex items-center gap-1.5 z-10">
                    <FolderOpen size={12} />
                    <span>Trilha</span>
                </div>

                {/* XP Badge */}
                {collection.points && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-lg border border-white/20 flex items-center gap-1 z-10 animate-fade-in">
                        <Award size={12} />
                        <span>+{collection.points} XP</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 relative">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-main leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                        {title}
                    </h3>

                    {isAdmin && (
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => onEdit?.(collection)}
                                className="p-1.5 hover:bg-page rounded text-muted hover:text-main transition-colors"
                            >
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted mt-2 line-clamp-2 min-h-[2.5rem]">
                    {description || 'Sem descrição definida para esta trilha.'}
                </p>

                {/* Progress Bar Container */}
                <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className={collection.progress === 100 ? "text-success flex items-center gap-1" : "text-muted"}>
                            {collection.progress === 100 ? (
                                <><CheckCircle2 size={12} /> Concluída</>
                            ) : 'Progresso'}
                        </span>
                        <span className={collection.progress === 100 ? "text-success" : "text-main"}>
                            {collection.progress || 0}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-page rounded-full overflow-hidden border border-border/50">
                        <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${collection.progress === 100
                                    ? 'bg-gradient-to-r from-success to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                    : 'bg-gradient-to-r from-accent to-indigo-500'
                                }`}
                            style={{ width: `${collection.progress || 0}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs font-medium text-muted">
                    <span className="flex items-center gap-1.5">
                        <Layers size={14} />
                        Confira a coleção
                    </span>

                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                        <ChevronRight size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};
