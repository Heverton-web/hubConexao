import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Material, Language } from '../types';
import { X, ExternalLink, RefreshCw, PlayCircle, Youtube } from 'lucide-react';
import { detectUrl, PROVIDERS } from '../lib/urlDetector';

interface ViewerModalProps {
    material: Material | null;
    language: Language;
    onClose: () => void;
}

export const ViewerModal: React.FC<ViewerModalProps> = ({ material, language, onClose }) => {
    const [forceNativeDrive, setForceNativeDrive] = useState(false);

    if (!material) return null;

    const asset = material.assets[language];
    if (!asset) return null;

    const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        return false;
    };

    // Use the centralized URL detector
    const detection = useMemo(() => detectUrl(asset.url), [asset.url]);

    // Build embed config from detection
    const embedConfig = useMemo(() => {
        if (!detection) return { isEmbed: false, provider: 'Direct', embedUrl: asset.url, nativeUrl: asset.url, originalUrl: asset.url };

        const providerLabel = PROVIDERS.find(p => p.id === detection.provider)?.label || 'Direct';

        // Google Drive specific: build native download URL
        let nativeUrl = asset.url;
        if (detection.provider === 'google_drive') {
            const idMatch = asset.url.match(/\/d\/([a-zA-Z0-9_-]+)/) || asset.url.match(/id=([a-zA-Z0-9_-]+)/);
            if (idMatch?.[1]) {
                nativeUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
            }
        }

        return {
            isEmbed: detection.provider !== 'direct',
            provider: providerLabel,
            embedUrl: detection.embedUrl,
            nativeUrl,
            originalUrl: detection.originalUrl,
        };
    }, [detection, asset.url]);

    const providerInfo = detection ? PROVIDERS.find(p => p.id === detection.provider) : null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black flex flex-col animate-fade-in select-none"
            style={{ zIndex: 9999 }}
            onContextMenu={handleContextMenu}
        >

            {/* Aura Floating Header */}
            <div className="absolute top-6 left-6 right-6 p-4 aura-glass rounded-[1.5rem] flex justify-between items-center z-50 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2 max-w-[80%] pl-2">
                    <h3 className="font-bold text-xl text-white heading-aura leading-tight line-clamp-1">{displayTitle}</h3>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/40 bg-white/[0.03] px-2.5 py-1 rounded-lg uppercase tracking-widest">{language}</span>

                        {/* Provider Badge */}
                        {providerInfo && (
                            <span
                                className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase flex items-center gap-2 tracking-widest"
                                style={{ background: `${providerInfo.color}15`, color: providerInfo.color }}
                            >
                                {detection?.provider === 'youtube' ? (
                                    <><Youtube size={12} fill="currentColor" /> YouTube</>
                                ) : (
                                    <><span>{providerInfo.icon}</span> {providerInfo.label}</>
                                )}
                            </span>
                        )}

                        {/* Google Drive specific controls */}
                        {detection?.provider === 'google_drive' && (
                            <div className="flex items-center gap-2">
                                <div className="flex bg-accent/10 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setForceNativeDrive(!forceNativeDrive)}
                                        className="px-3 py-1 text-[10px] text-white/60 hover:text-white hover:bg-accent/10 transition-all flex items-center gap-2 font-bold uppercase tracking-widest"
                                    >
                                        <RefreshCw size={10} className={forceNativeDrive ? "text-success" : ""} />
                                        {forceNativeDrive ? "Nativo" : "Preview"}
                                    </button>
                                </div>

                                <a
                                    href={asset.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white px-3 py-1 rounded-lg transition-all font-bold uppercase tracking-widest"
                                >
                                    <ExternalLink size={10} /> Link Direto
                                </a>
                            </div>
                        )}

                        {/* External link for social platforms */}
                        {(detection?.provider === 'instagram' || detection?.provider === 'tiktok' || detection?.provider === 'linkedin') && (
                            <a
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white px-3 py-1 rounded-lg transition-all font-bold uppercase tracking-widest"
                            >
                                <ExternalLink size={10} /> Abrir na Fonte
                            </a>
                        )}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/[0.03] hover:bg-error hover:text-white rounded-xl text-white/40 transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden relative">

                {(() => {
                    // Case 1: Image (direct)
                    if (material.type === 'image' && detection?.provider === 'direct') {
                        return (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <img
                                    src={asset.url}
                                    alt={displayTitle}
                                    className="max-w-full max-h-full object-contain shadow-2xl pointer-events-none"
                                    draggable="false"
                                />
                            </div>
                        );
                    }

                    // Case 2: PDF (direct link)
                    if (material.type === 'pdf' && detection?.provider === 'direct') {
                        return (
                            <div className="w-full h-full max-w-6xl mx-auto pt-20 pb-4 px-4">
                                <iframe
                                    src={`${asset.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                    className="w-full h-full rounded-lg bg-white shadow-2xl"
                                    title="PDF Viewer"
                                />
                            </div>
                        );
                    }

                    // Case 3: YouTube
                    if (detection?.provider === 'youtube') {
                        return (
                            <div className="w-full h-full flex items-center justify-center max-w-screen-2xl mx-auto p-0 md:p-8 aspect-video">
                                <iframe
                                    src={embedConfig.embedUrl}
                                    className="w-full h-full rounded-lg shadow-2xl bg-black"
                                    title="YouTube Video Player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    frameBorder="0"
                                />
                            </div>
                        );
                    }

                    // Case 4: Google Drive (Embed mode)
                    if (detection?.provider === 'google_drive' && !forceNativeDrive) {
                        return (
                            <div className="w-full h-full flex flex-col items-center justify-center relative">
                                <div className="absolute text-white/20 text-sm text-center px-4 animate-pulse">
                                    Carregando player do Google...<br />
                                    <span className="text-xs opacity-70">Se ficar preto, clique em "Modo Nativo" ou "Abrir Externamente".</span>
                                </div>

                                <iframe
                                    key={embedConfig.embedUrl}
                                    src={embedConfig.embedUrl}
                                    className="w-full h-full border-none bg-transparent relative z-10"
                                    title="Google Drive Player"
                                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                    sandbox="allow-forms allow-presentation allow-same-origin allow-scripts allow-popups"
                                    referrerPolicy="no-referrer"
                                    allowFullScreen
                                />
                            </div>
                        );
                    }

                    // Case 5: Instagram embed
                    if (detection?.provider === 'instagram') {
                        return (
                            <div className="w-full h-full flex items-center justify-center pt-20 pb-4">
                                <iframe
                                    src={embedConfig.embedUrl}
                                    className="w-full max-w-lg h-full rounded-lg shadow-2xl bg-black"
                                    title="Instagram Embed"
                                    allowFullScreen
                                    frameBorder="0"
                                />
                            </div>
                        );
                    }

                    // Case 6: TikTok embed
                    if (detection?.provider === 'tiktok') {
                        return (
                            <div className="w-full h-full flex items-center justify-center pt-20 pb-4">
                                <iframe
                                    src={embedConfig.embedUrl}
                                    className="w-[325px] h-[740px] rounded-lg shadow-2xl bg-black"
                                    title="TikTok Embed"
                                    allowFullScreen
                                    frameBorder="0"
                                />
                            </div>
                        );
                    }

                    // Case 7: LinkedIn or other social embed
                    if (detection?.provider === 'linkedin') {
                        return (
                            <div className="w-full h-full flex items-center justify-center pt-20 pb-4 px-4">
                                <iframe
                                    src={asset.url}
                                    className="w-full max-w-4xl h-full rounded-lg shadow-2xl bg-white"
                                    title="LinkedIn Embed"
                                    allowFullScreen
                                    frameBorder="0"
                                />
                            </div>
                        );
                    }

                    // Case 8: Google Drive native mode or direct video
                    const videoSrc = (detection?.provider === 'google_drive' && forceNativeDrive)
                        ? embedConfig.nativeUrl
                        : asset.url;

                    // If it's a PDF from Google Drive or other embed source
                    if (material.type === 'pdf') {
                        return (
                            <div className="w-full h-full max-w-6xl mx-auto pt-20 pb-4 px-4">
                                <iframe
                                    src={embedConfig.embedUrl}
                                    className="w-full h-full rounded-lg bg-white shadow-2xl"
                                    title="PDF Viewer"
                                    allowFullScreen
                                />
                            </div>
                        );
                    }

                    // If it's an image from Google Drive or other embed source
                    if (material.type === 'image') {
                        const imgSrc = detection?.provider === 'google_drive'
                            ? detection.thumbnailUrl || embedConfig.nativeUrl
                            : asset.url;
                        return (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <img
                                    src={imgSrc}
                                    alt={displayTitle}
                                    className="max-w-full max-h-full object-contain shadow-2xl pointer-events-none"
                                    draggable="false"
                                />
                            </div>
                        );
                    }

                    // Fallback: Video player
                    return (
                        <div className="w-full h-full flex items-center justify-center max-w-7xl mx-auto p-0 md:p-8 relative group">
                            {forceNativeDrive && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 pointer-events-none z-0">
                                    <PlayCircle size={100} />
                                </div>
                            )}
                            <video
                                key={videoSrc}
                                controls
                                controlsList="nodownload noremoteplayback"
                                disablePictureInPicture
                                className="w-full max-h-full aspect-video shadow-2xl rounded-lg bg-black outline-none relative z-10"
                                autoPlay
                                playsInline
                                preload="metadata"
                            >
                                <source src={videoSrc} />
                                {asset.subtitleUrl && <track kind="subtitles" src={asset.subtitleUrl} label={language} default />}

                                <div className="text-white text-center p-10">
                                    <p>Seu navegador não conseguiu carregar este vídeo.</p>
                                    <p className="text-sm mt-2">Tente o botão "Abrir Externamente".</p>
                                </div>
                            </video>
                        </div>
                    );
                })()}

            </div>
        </div>,
        document.body
    );
};