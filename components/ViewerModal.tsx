import React, { useMemo, useState } from 'react';
import { Material, Language } from '../types';
import { X, ShieldAlert, ExternalLink, RefreshCw, PlayCircle, Youtube } from 'lucide-react';

interface ViewerModalProps {
  material: Material | null;
  language: Language;
  onClose: () => void;
}

export const ViewerModal: React.FC<ViewerModalProps> = ({ material, language, onClose }) => {
  // Estado para controlar se tentamos forçar o player nativo em links do Drive
  const [forceNativeDrive, setForceNativeDrive] = useState(false);

  if (!material) return null;

  const asset = material.assets[language];
  if (!asset) return null;

  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const getEmbedConfig = (url: string) => {
    if (!url) return { isEmbed: false, url: '', provider: '', originalUrl: '' };
    
    const cleanUrl = url.trim();

    // 1. YouTube Detection
    // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    const youtubeMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (youtubeMatch && youtubeMatch[1]) {
        return {
            isEmbed: true,
            provider: 'YouTube',
            originalUrl: cleanUrl,
            // autoplay=1: Toca ao abrir
            // rel=0: Mostra vídeos relacionados apenas do mesmo canal (reduz distração)
            // modestbranding=1: Remove logo do YT quando possível
            embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
            nativeUrl: ''
        };
    }

    // 2. Google Drive Detection
    const driveIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
    
    if (driveIdMatch && driveIdMatch[1]) {
      const id = driveIdMatch[1];
      return {
        isEmbed: true,
        provider: 'Google Drive',
        originalUrl: cleanUrl,
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        nativeUrl: `https://drive.google.com/uc?export=download&id=${id}`
      };
    }

    // 3. Direct Link / Fallback
    return { 
        isEmbed: false, 
        provider: 'Direct', 
        originalUrl: cleanUrl,
        embedUrl: cleanUrl,
        nativeUrl: cleanUrl
    };
  };

  // Recalcula config quando a URL ou o modo forçado mudam
  const embedConfig = useMemo(() => getEmbedConfig(asset.url), [asset.url]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in select-none"
      onContextMenu={handleContextMenu}
    >
      
      {/* Header (Floating) */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/50 to-transparent z-50 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2 max-w-[80%]">
          <h3 className="font-bold text-lg text-white drop-shadow-md leading-tight line-clamp-2">{displayTitle}</h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-black bg-white px-2 py-0.5 rounded shadow uppercase">{language}</span>
            
            {/* BADGES ESPECÍFICOS POR PROVEDOR */}
            
            {embedConfig.provider === 'YouTube' && (
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded backdrop-blur-md uppercase font-bold border border-red-500/30 shadow-lg flex items-center gap-1">
                    <Youtube size={12} fill="currentColor" /> YouTube
                </span>
            )}

            {embedConfig.provider === 'Google Drive' && (
               <>
                <div className="flex bg-blue-900/40 backdrop-blur-md rounded border border-blue-500/30 overflow-hidden">
                    <span className="text-[10px] text-blue-200 px-2 py-1 border-r border-blue-500/30 flex items-center gap-1">
                        DRIVE
                    </span>
                    <button 
                        onClick={() => setForceNativeDrive(!forceNativeDrive)}
                        className="px-2 py-1 text-[10px] text-white hover:bg-white/10 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                        title="Alternar entre Player do Google e Player Nativo"
                    >
                        <RefreshCw size={10} className={forceNativeDrive ? "text-green-400" : ""} />
                        {forceNativeDrive ? "Modo Nativo" : "Modo Embed"}
                    </button>
                </div>

                <a 
                    href={asset.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2 py-1 rounded backdrop-blur-md transition-colors cursor-pointer"
                >
                    <ExternalLink size={10} /> Abrir Externamente
                </a>
               </>
            )}
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors border border-white/10 shrink-0 ml-4"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
        
        {(() => {
            // Caso 1: Imagem
            if (material.type === 'image') {
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

            // Caso 2: PDF
            if (material.type === 'pdf') {
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

            // Caso 3: YouTube (Otimizado)
            if (embedConfig.provider === 'YouTube') {
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

            // Caso 4: Google Drive (Modo Embed Padrão)
            if (embedConfig.provider === 'Google Drive' && !forceNativeDrive) {
                return (
                   <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <div className="absolute text-muted text-sm text-center px-4 animate-pulse">
                            Carregando player do Google...<br/>
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

            // Caso 5: Vídeo Genérico ou Drive em Modo Nativo
            const videoSrc = (embedConfig.provider === 'Google Drive' && forceNativeDrive) 
                ? embedConfig.nativeUrl 
                : asset.url;

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
    </div>
  );
};