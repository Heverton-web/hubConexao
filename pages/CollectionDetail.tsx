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
            <div className="animate-reveal pb-20 max-w-7xl mx-auto">
                <div className="px-6 md:px-0">
                    {/* Hero Header Aura */}
                    <div className="relative h-96 md:h-[450px] w-full overflow-hidden rounded-[2.5rem] mt-6 aura-glass">
                        {collection.coverImage ? (
                            <img src={collection.coverImage} className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-110 opacity-70" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent/10 to-transparent flex items-center justify-center">
                                <Layers size={80} className="text-white/10" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-transparent opacity-90"></div>

                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-10">
                            <div className="flex-1">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-3 text-white/40 hover:text-white mb-8 transition-all text-[10px] font-black uppercase tracking-[0.3em] bg-white/[0.01] backdrop-blur-md px-4 py-2 rounded-xl w-fit"
                                >
                                    <ChevronLeft size={16} /> Voltar para HUB
                                </button>
                                <h1 className="text-4xl md:text-6xl heading-aura text-white mb-6 leading-tight">{title}</h1>
                                <p className="text-white/30 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">{description}</p>
                            </div>

                            <div className="shrink-0 w-full md:w-auto pb-4">
                                <button
                                    onClick={handleStartTrail}
                                    className="w-full md:w-auto px-12 py-5 rounded-2xl bg-accent text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-accent/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                                >
                                    <PlayCircle size={24} className="transition-transform group-hover:rotate-12" />
                                    Iniciar Experiência
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Trail Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-16">
                        <div className="lg:col-span-8 space-y-12">
                            <div>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-10 w-1.5 bg-accent rounded-full shadow-[0_0_20px_rgba(0,209,255,0.6)]"></div>
                                    <h2 className="text-2xl heading-aura text-white">Roteiro de Consumo</h2>
                                    <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.01] px-4 py-1.5 rounded-full">
                                        {items.length} Módulos Disponíveis
                                    </span>
                                </div>

                                <div className="space-y-6 relative ml-5 pl-10 py-2">
                                    {items.map((itemObj, index) => {
                                        if (!itemObj.material) return null;
                                        const mat = itemObj.material;
                                        const isDone = completedIds.includes(mat.id);

                                        return (
                                            <div key={itemObj.item.id} className="relative group">
                                                {/* Step Aura Marker */}
                                                <div className={`absolute -left-[58px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 z-10 
                                                ${isDone ? 'bg-success border border-success text-white shadow-[0_0_20px_rgba(0,245,160,0.3)]' : 'bg-[#08090B] border border-white/[0.08] text-accent group-hover:border-accent/30'}
                                            `}>
                                                    {isDone ? <CheckCircle size={18} /> : <span className="font-black text-xs">{index + 1}</span>}
                                                </div>

                                                <div
                                                    className="aura-glass p-6 rounded-[1.5rem] flex items-center justify-between transition-all duration-500 hover:-translate-x-2 cursor-pointer"
                                                    onClick={() => { setCurrentIndex(index); setViewMode(true); }}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                                        ${isDone ? 'bg-success/5 text-success' : 'bg-white/[0.01] text-white/20 group-hover:text-accent group-hover:bg-accent/5'}
                                                    `}>
                                                            {mat.type === 'video' ? <PlayCircle size={28} /> : mat.type === 'pdf' ? <FileText size={28} /> : <ImageIcon size={28} />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-xl text-white/90 group-hover:text-white transition-colors">{mat.title[language] || mat.title['pt-br']}</h3>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                                                    {mat.type}
                                                                </span>
                                                                <span className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-[0.2em]">
                                                                    <Star size={12} className="opacity-40" /> {mat.points || 50} Pontos XP
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="w-10 h-10 rounded-xl bg-white/[0.01] text-white/40 group-hover:bg-accent/10 group-hover:text-accent transition-all flex items-center justify-center">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            {/* Progress Aura Card */}
                            <div className="aura-glass p-10 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-[2000ms]">
                                    <Trophy size={160} className="text-white" />
                                </div>

                                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                    <Trophy size={14} className="text-accent" /> Status da Jornada
                                </h3>

                                <div className="relative flex items-center justify-center mb-10">
                                    <svg className="w-40 h-40 transform -rotate-90">
                                        <circle cx="80" cy="80" r="72" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="10" />
                                        <circle
                                            cx="80" cy="80" r="72" fill="transparent" stroke="currentColor" strokeWidth="10"
                                            className="text-accent transition-all duration-1000 ease-out"
                                            strokeDasharray={452.4}
                                            strokeDashoffset={452.4 - (452.4 * progress) / 100}
                                            strokeLinecap="round"
                                            style={{ filter: 'drop-shadow(0 0 10px rgba(0,209,255,0.4))' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-white heading-aura">{progress}%</span>
                                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Concluído</span>
                                    </div>
                                </div>

                                <p className="text-[12px] text-white/30 text-center leading-relaxed font-medium">
                                    Alcance o final desta jornada para resgatar sua recompensa de <strong className="text-white">{items.reduce((acc, i) => acc + (i.material?.points || 0), 0)} XP</strong>.
                                </p>
                            </div>

                            {/* Pro Tip Aura */}
                            <div className="bg-accent/[0.01] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles size={20} className="text-accent animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Insights Premium</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed text-white/60">
                                        Sua interação com os materiais é monitorada em tempo real para otimizar seu aprendizado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- CONSUMPTION MODE (Integrated Viewer Aura) ---
    return (
        <div className="fixed inset-0 z-[100] bg-[#08090B] flex flex-col md:flex-row animate-reveal overflow-hidden">
            {/* Sidebar Aura (Sequence) */}
            <aside className={`aura-glass transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-50 flex flex-col relative ${sidebarOpen ? 'w-full md:w-80' : 'w-0 overflow-hidden md:w-0'}`}>
                <div className="p-8 flex justify-between items-center shrink-0">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white heading-aura truncate text-lg pr-4">{title}</h4>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="h-1.5 flex-1 bg-white/[0.03] rounded-full overflow-hidden">
                                <div className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_rgba(0,209,255,0.4)]" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-white/20 whitespace-nowrap">{progress}%</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-white/30 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                    <button
                        onClick={() => { setViewMode(false); }}
                        className="p-2.5 bg-white/[0.03] hover:bg-error rounded-xl text-white/30 hover:text-white transition-all ml-2"
                        title="Sair do modo tela cheia"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 py-6">
                    {items.map((itemObj, index) => {
                        if (!itemObj.material) return null;
                        const mat = itemObj.material;
                        const isActive = currentIndex === index;
                        const isDone = completedIds.includes(mat.id);

                        return (
                            <button
                                key={itemObj.item.id}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden
                                    ${isActive
                                        ? 'bg-accent/5'
                                        : 'hover:bg-white/[0.01] text-white/30 hover:text-white/80'}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_15px_rgba(0,209,255,0.6)]"></div>
                                )}

                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500
                                    ${isActive
                                        ? 'bg-accent/20 text-accent'
                                        : isDone ? 'bg-success/5 text-success' : 'bg-white/[0.02]'}
                                `}>
                                    {isDone ? <CheckCircle size={16} /> : <span className="text-[10px] font-black">{index + 1}</span>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[13px] font-bold truncate transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
                                        {mat.title[language] || mat.title['pt-br']}
                                    </p>
                                    <p className={`text-[9px] uppercase font-black tracking-widest mt-1.5 transition-colors ${isActive ? 'text-accent' : 'text-white/10 group-hover:text-white/20'}`}>
                                        {mat.type} • {mat.points} pts
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Player Area Aura */}
            <main className="flex-1 flex flex-col relative bg-[#060709]">
                {/* Top Controls Aura */}
                <div className="absolute top-0 left-0 right-0 p-6 md:p-8 z-40 flex justify-between items-center pointer-events-none">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-xl aura-glass text-white/40 hover:text-white hover:bg-white/[0.08] transition-all ${sidebarOpen ? 'hidden md:hidden' : 'flex'}`}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="aura-glass px-6 py-3 rounded-2xl pointer-events-auto hidden sm:block">
                            <div className="flex items-center gap-5">
                                <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em] bg-accent/10 px-3 py-1 rounded-lg">Módulo {currentIndex + 1}</span>
                                <span className="text-white/80 text-sm font-bold truncate max-w-[300px] heading-aura">{activeItem?.material?.title[language] || activeItem?.material?.title['pt-br']}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="aura-glass px-6 py-3 rounded-2xl flex items-center gap-4 mr-2">
                            <span className="text-white text-[10px] font-black tracking-widest">{progress}%</span>
                            <div className="w-24 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                <div className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_rgba(0,209,255,0.4)]" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewMode(false)}
                            className="w-12 h-12 flex items-center justify-center rounded-xl aura-glass text-white/40 hover:text-white hover:bg-error transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Player Integrated Container */}
                <div className="flex-1 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent opacity-30"></div>
                    {activeItem?.material ? (
                        <div className="w-full h-full animate-reveal relative z-10" key={activeItem.material.id}>
                            <IntegratedViewer
                                material={activeItem.material}
                                language={language}
                                onComplete={() => handleComplete(activeItem.material!.id)}
                            />
                        </div>
                    ) : (
                        <div className="text-white/10 font-black uppercase tracking-[0.5em] animate-pulse">Iniciando Experiência...</div>
                    )}
                </div>

                {/* Bottom Navigation Aura */}
                <div className="h-24 aura-glass flex items-center justify-between px-10 transition-all duration-500 shrink-0 z-40">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-white/[0.02] text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.05] hover:text-white disabled:opacity-5 transition-all outline-none"
                    >
                        <ChevronLeft size={18} /> Anterior
                    </button>

                    <div className="hidden md:flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-['Space_Grotesk']">{currentIndex + 1} <span className="text-white/5 mx-2">/</span> {items.length}</span>
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
                        className="flex items-center gap-4 px-12 py-3.5 rounded-xl bg-accent text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/20"
                    >
                        {currentIndex < items.length - 1 ? 'Próximo Módulo' : 'Finalizar Trilha'} <ChevronRight size={18} />
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
