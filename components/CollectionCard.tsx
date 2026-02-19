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
            className="group aura-glass rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer hover:-translate-y-2"
            onClick={() => onClick(collection)}
        >
            {/* Cover Area */}
            <div className="h-44 w-full relative overflow-hidden bg-neutral-900/50">
                {collection.coverImage ? (
                    <img
                        src={collection.coverImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/10 to-transparent flex items-center justify-center">
                        <Layers size={48} className="text-white/10 group-hover:text-accent/40 transition-colors duration-500" />
                    </div>
                )}

                {/* Overlay Lume */}
                <div className="absolute inset-0 bg-gradient-to-t from-page via-transparent to-transparent opacity-90" />

                {/* Badge Trilha Luminous */}
                <div className="absolute top-4 left-4 bg-white/[0.03] backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold text-accent flex items-center gap-2 z-10">
                    <FolderOpen size={12} />
                    <span className="tracking-widest">Trilha</span>
                </div>

                {/* Points Badge */}
                {collection.points && (
                    <div className="absolute top-4 right-4 bg-accent/5 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-accent flex items-center gap-1 z-10">
                        <Award size={12} />
                        <span>+{collection.points} XP</span>
                    </div>
                )}
            </div>

            {/* Content Aura */}
            <div className="p-6 relative">
                <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-bold text-xl text-white/90 heading-aura leading-tight line-clamp-2 group-hover:text-white transition-colors">
                        {title}
                    </h3>

                    {isAdmin && (
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => onEdit?.(collection)}
                                className="p-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-white/20 hover:text-white transition-all"
                            >
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-[13px] text-white/30 leading-relaxed line-clamp-2 min-h-[3rem] font-medium">
                    {description || 'Explore esta trilha de conhecimento premium.'}
                </p>

                {/* Progress Bar Aura */}
                <div className="mt-6 space-y-2.5">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em]">
                        <span className={collection.progress === 100 ? "text-success flex items-center gap-2" : "text-white/20"}>
                            {collection.progress === 100 ? (
                                <><CheckCircle2 size={12} /> Concluída</>
                            ) : 'Progresso'}
                        </span>
                        <span className={collection.progress === 100 ? "text-success" : "text-white/40"}>
                            {collection.progress || 0}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.01] rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${collection.progress === 100
                                ? 'bg-success shadow-[0_0_15px_rgba(0,245,160,0.4)]'
                                : 'bg-accent shadow-[0_0_15px_rgba(0,209,255,0.4)]'
                                }`}
                            style={{ width: `${collection.progress || 0}%` }}
                        />
                    </div>
                </div>

                {/* Footer Lume */}
                <div className="mt-8 pt-6 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center gap-2">
                        <Layers size={14} className="opacity-40" />
                        Acessar Trilhas
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-white/[0.01] flex items-center justify-center text-white/40 group-hover:bg-accent/[0.03] group-hover:text-accent transition-all duration-500 transform translate-x-0 group-hover:translate-x-1">
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};
