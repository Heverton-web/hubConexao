import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Collection, CollectionItem, Material, Language } from '../types';
import { mockDb } from '../lib/mockDb';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, Layers, PlayCircle, Lock, CheckCircle, Clock,
    ChevronRight, ChevronLeft, Menu, X, Trophy, Star, Sparkles,
    Youtube, FileText, Image as ImageIcon, ExternalLink, RefreshCw
} from 'lucide-react';
import { ViewerModal } from '../components/ViewerModal';

export const CollectionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const { user } = useAuth();

    const [collection, setCollection] = useState<Collection | null>(null);
    const [items, setItems] = useState<{ item: CollectionItem, material: Material | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [completedIds, setCompletedIds] = useState<string[]>([]);

    // Trail State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState(false); // false = Overview, true = Consumption (Player)

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
                // In a real app we'd fetch user progress. For mock, we'll just keep it in state.
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const activeItem = items[currentIndex];
    const progress = items.length > 0 ? Math.round((completedIds.length / items.length) * 100) : 0;

    const handleStartTrail = () => {
        setViewMode(true);
        if (items.length > 0) {
            setCurrentIndex(0);
        }
    };

    const handleComplete = async (materialId: string) => {
        if (!user) return;
        if (!completedIds.includes(materialId)) {
            setCompletedIds(prev => [...prev, materialId]);
            await mockDb.completeMaterial(user.id, materialId);
        }
    };

    const handleNext = () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
                <div className="h-64 bg-surface rounded-3xl animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse"></div>)}
                    </div>
                    <div className="h-64 bg-surface rounded-3xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 text-muted border border-border">
                    <Layers size={40} />
                </div>
                <h2 className="text-2xl font-bold text-main">Trilha não encontrada</h2>
                <p className="text-muted mt-2">Esta trilha pode ter sido removida ou você não tem acesso.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-8 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:scale-105 transition-all">
                    Voltar ao Dashboard
                </button>
            </div>
        );
    }

    const title = collection.title[language] || collection.title['pt-br'];
    const description = collection.description?.[language] || collection.description?.['pt-br'];

    // --- OVERVIEW MODE ---
    if (!viewMode) {
        return (
            <div className="animate-fade-in pb-20 max-w-7xl mx-auto px-4 md:px-6">
                {/* Hero Header */}
                <div className="relative h-80 md:h-[400px] w-full overflow-hidden rounded-[2.5rem] mt-4 shadow-2xl border border-white/5">
                    {collection.coverImage ? (
                        <img src={collection.coverImage} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-accent/20 flex items-center justify-center">
                            <Layers size={80} className="text-white/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="flex-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit border border-white/10"
                            >
                                <ChevronLeft size={16} /> Voltar
                            </button>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-2xl">{title}</h1>
                            <p className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow-lg font-medium">{description}</p>
                        </div>

                        <div className="shrink-0 w-full md:w-auto">
                            <button
                                onClick={handleStartTrail}
                                className="w-full md:w-auto px-10 py-5 rounded-2xl bg-accent text-white font-bold text-xl shadow-2xl shadow-accent/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                            >
                                <PlayCircle size={28} className="transition-transform group-hover:rotate-12" />
                                Começar Agora
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trail Stats & Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                    <div className="md:col-span-3 space-y-10">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-8 w-1.5 bg-accent rounded-full shadow-[0_0_12px_rgba(var(--color-accent-rgb),0.5)]"></div>
                                <h2 className="text-2xl font-bold text-main">Roteiro de Aprendizado</h2>
                                <span className="text-muted text-sm font-medium bg-page px-3 py-1 rounded-full border border-border">
                                    {items.length} módulos
                                </span>
                            </div>

                            <div className="space-y-4 relative ml-4 border-l-2 border-border/50 pl-10 py-2">
                                {items.map((itemObj, index) => {
                                    if (!itemObj.material) return null;
                                    const mat = itemObj.material;
                                    const isDone = completedIds.includes(mat.id);

                                    return (
                                        <div key={itemObj.item.id} className="relative group">
                                            {/* Step Number Tag */}
                                            <div className={`absolute -left-[54px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 
                                                ${isDone ? 'bg-success border-success text-white shadow-lg shadow-success/20' : 'bg-surface border-border text-muted group-hover:border-accent'}
                                            `}>
                                                {isDone ? <CheckCircle size={16} /> : <span className="font-bold text-xs">{index + 1}</span>}
                                            </div>

                                            <div className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:border-accent/40 hover:-translate-x-1">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors 
                                                        ${isDone ? 'bg-success/10 text-success' : 'bg-page text-muted group-hover:text-accent'}
                                                    `}>
                                                        {mat.type === 'video' ? <PlayCircle size={24} /> : mat.type === 'pdf' ? <FileText size={24} /> : <ImageIcon size={24} />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-main leading-tight">{mat.title[language] || mat.title['pt-br']}</h3>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted py-0.5 px-2 bg-page rounded border border-border">
                                                                {mat.type}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-accent">
                                                                <Star size={10} fill="currentColor" /> {mat.points || 50} pontos
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setCurrentIndex(index); setViewMode(true); }}
                                                    className="p-3 rounded-xl bg-page text-muted hover:bg-accent hover:text-white transition-all shadow-sm"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                                <Trophy size={140} className="text-accent" />
                            </div>

                            <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Trophy size={14} className="text-accent" /> Seu Progresso
                            </h3>

                            <div className="relative flex items-center justify-center mb-6">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-page" />
                                    <circle
                                        cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8"
                                        className="text-accent transition-all duration-1000 ease-out"
                                        strokeDasharray={351.8}
                                        strokeDashoffset={351.8 - (351.8 * progress) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-main">{progress}%</span>
                                    <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Completo</span>
                                </div>
                            </div>

                            <p className="text-xs text-muted text-center leading-relaxed">
                                Complete todos os módulos para ganhar o selo de mestre da trilha e acumular <strong>{items.reduce((acc, i) => acc + (i.material?.points || 0), 0)}</strong> pontos.
                            </p>
                        </div>

                        {/* Gaming Tip */}
                        <div className="bg-gradient-to-br from-accent/90 to-accent rounded-[2rem] p-6 text-white shadow-lg shadow-accent/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={18} className="animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Dica Mestre</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                                Materiais de vídeo costumam dar mais pontos. Assista até o final!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- CONSUMPTION MODE (Integrated Viewer) ---
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row animate-fade-in overflow-hidden">
            {/* Sidebar (Sequence) */}
            <aside className={`bg-surface border-r border-border transition-all duration-500 ease-in-out z-50 flex flex-col ${sidebarOpen ? 'w-full md:w-80' : 'w-0 overflow-hidden md:w-0'}`}>
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface shrink-0">
                    <div>
                        <h4 className="font-bold text-main truncate max-w-[180px]">{title}</h4>
                        <div className="h-1.5 w-full bg-page rounded-full mt-2 overflow-hidden border border-border/50">
                            <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-muted">
                        <X size={20} />
                    </button>
                    <button
                        onClick={() => { setViewMode(false); }}
                        className="p-2 hover:bg-page rounded-full text-muted hover:text-accent transition-all ml-2"
                        title="Sair do modo tela cheia"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 py-4">
                    {items.map((itemObj, index) => {
                        if (!itemObj.material) return null;
                        const mat = itemObj.material;
                        const isActive = currentIndex === index;
                        const isDone = completedIds.includes(mat.id);

                        return (
                            <button
                                key={itemObj.item.id}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]'
                                        : 'hover:bg-page text-muted hover:text-main'}
                                `}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all
                                    ${isActive
                                        ? 'bg-white/20 border-white/20'
                                        : isDone ? 'bg-success/10 border-success/30 text-success' : 'bg-surface border-border'}
                                `}>
                                    {isDone ? <CheckCircle size={16} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-main'}`}>
                                        {mat.title[language] || mat.title['pt-br']}
                                    </p>
                                    <p className={`text-[9px] uppercase font-bold tracking-widest mt-0.5 ${isActive ? 'text-white/70' : 'text-muted'}`}>
                                        {mat.type} • {mat.points} pts
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Player Area */}
            <main className="flex-1 flex flex-col relative bg-black">
                {/* Top Overlay controls */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-40 flex justify-between items-start pointer-events-none">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`pointer-events-auto p-3 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-all ${sidebarOpen ? 'hidden' : 'flex'}`}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-auto hidden sm:block">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-accent tracking-tighter bg-accent/20 px-2 py-0.5 rounded">Módulo {currentIndex + 1}</span>
                                <span className="text-white text-sm font-bold truncate max-w-[200px]">{activeItem?.material?.title[language] || activeItem?.material?.title['pt-br']}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 mr-2">
                            <span className="text-white text-xs font-bold">{progress}%</span>
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewMode(false)}
                            className="p-3 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Player Integrated Container */}
                <div className="flex-1 flex items-center justify-center p-0 md:p-8">
                    {activeItem?.material ? (
                        <div className="w-full h-full animate-fade-in" key={activeItem.material.id}>
                            <IntegratedViewer
                                material={activeItem.material}
                                language={language}
                                onComplete={() => handleComplete(activeItem.material!.id)}
                            />
                        </div>
                    ) : (
                        <div className="text-white">Carregando conteúdo...</div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="h-20 border-t border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-40">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-20 transition-all"
                    >
                        <ChevronLeft size={20} /> Anterior
                    </button>

                    <div className="hidden md:flex flex-col items-center">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{currentIndex + 1} de {items.length}</span>
                    </div>

                    <button
                        onClick={() => {
                            if (currentIndex < items.length - 1) {
                                handleComplete(activeItem.material!.id);
                                handleNext();
                            } else {
                                handleComplete(activeItem.material!.id);
                                setViewMode(false);
                            }
                        }}
                        className="flex items-center gap-2 px-10 py-3 rounded-xl bg-accent text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                    >
                        {currentIndex < items.length - 1 ? 'Próximo' : 'Finalizar Trilha'} <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

// --- SIMPLIFIED INTEGRATED VIEWER (Logic Extracted from ViewerModal) ---

const IntegratedViewer: React.FC<{ material: Material, language: Language, onComplete: () => void }> = ({ material, language, onComplete }) => {

    useEffect(() => {
        // Auto-complete after 5 seconds for mock flow. In real app, video duration or end event.
        const timer = setTimeout(() => {
            onComplete();
        }, 5000);
        return () => clearTimeout(timer);
    }, [material.id]);

    const asset = material.assets[language] || Object.values(material.assets)[0];
    if (!asset) return <div className="text-white">Conteúdo não disponível neste idioma.</div>;

    const getEmbedConfig = (url: string) => {
        if (!url) return { provider: '', embedUrl: '', isEmbed: false };
        const cleanUrl = url.trim();
        const youtubeMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (youtubeMatch && youtubeMatch[1]) {
            return { isEmbed: true, provider: 'YouTube', embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0` };
        }
        const driveIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (driveIdMatch && driveIdMatch[1]) {
            return { isEmbed: true, provider: 'Google Drive', embedUrl: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview` };
        }
        return { isEmbed: false, provider: 'Direct', embedUrl: cleanUrl };
    };

    const config = getEmbedConfig(asset.url);

    if (material.type === 'image') {
        return <div className="w-full h-full flex items-center justify-center p-4"><img src={asset.url} className="max-w-full max-h-full object-contain shadow-2xl" /></div>;
    }

    if (material.type === 'pdf') {
        return <div className="w-full h-full pt-16 pb-4 md:p-14"><iframe src={`${asset.url}#toolbar=0`} className="w-full h-full rounded-2xl bg-white shadow-2xl border-none" /></div>;
    }

    if (config.isEmbed) {
        return (
            <div className="w-full h-full flex items-center justify-center pt-16 pb-4 md:p-14">
                <iframe src={config.embedUrl} className="w-full h-full aspect-video rounded-2xl shadow-2xl bg-black border-none" allowFullScreen allow="autoplay" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center pt-16 pb-4 md:p-14">
            <video controls autoPlay className="w-full h-full aspect-video rounded-2xl shadow-2xl bg-black outline-none" src={asset.url}>
                {asset.subtitleUrl && <track kind="subtitles" src={asset.subtitleUrl} label={language} default />}
            </video>
        </div>
    );
};
