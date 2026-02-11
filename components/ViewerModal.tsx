import React, { useMemo } from 'react';
import { Material, Language } from '../types';
import { X, ShieldAlert, ExternalLink, AlertCircle } from 'lucide-react';

interface ViewerModalProps {
  material: Material | null;
  language: Language;
  onClose: () => void;
}

export const ViewerModal: React.FC<ViewerModalProps> = ({ material, language, onClose }) => {
  if (!material) return null;

  const asset = material.assets[language];
  if (!asset) return null;

  // Resolve title
  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';

  // Prevent right click to discourage saving
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  /**
   * Helper function to detect Google Drive and return embeddable config.
   */
  const getEmbedConfig = (url: string) => {
    if (!url) return { isEmbed: false, url: '', provider: '' };
    
    const cleanUrl = url.trim();

    // 1. Google Drive Detection (Priority)
    // Regex matches /file/d/ID or id=ID
    const driveIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
    
    if (driveIdMatch && driveIdMatch[1]) {
      return {
        isEmbed: true,
        // CRITICAL: Must use /preview for Google Drive videos to play in iframe
        url: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`,
        provider: 'Google Drive'
      };
    }

    // Default: Direct file link (fallback)
    return { isEmbed: false, url: cleanUrl, provider: 'Direct' };
  };

  const embedConfig = useMemo(() => getEmbedConfig(asset.url), [asset.url]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in select-none"
      onContextMenu={handleContextMenu}
    >
      
      {/* Header (Floating/Overlay) */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent z-20 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-1">
          <h3 className="font-bold text-lg text-white drop-shadow-md leading-tight">{displayTitle}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-300 uppercase tracking-wider drop-shadow-md">{language}</span>
            
            {embedConfig.provider === 'Google Drive' && (
               <>
                <span className="text-[10px] bg-blue-600/90 text-white px-2 py-0.5 rounded backdrop-blur-md uppercase font-bold border border-blue-400/30 shadow-lg">
                    via Google Drive
                </span>
                {/* Fallback Button for Drive Issues */}
                <a 
                    href={asset.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2 py-0.5 rounded backdrop-blur-md transition-colors cursor-pointer"
                    title="Se o vídeo não carregar, clique aqui para abrir diretamente no Google Drive"
                >
                    <ExternalLink size={10} /> Abrir Externamente
                </a>
               </>
            )}
            
            <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-200 border border-red-500/30 px-2 py-0.5 rounded backdrop-blur-md">
              <ShieldAlert size={10} /> Protegido (LGPD)
            </span>
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
        
        {/* 
            LÓGICA DE RENDERIZAÇÃO:
            Se for Google Drive (isEmbed = true), SEMPRE usamos Iframe.
            Isso resolve o problema de vídeos do Drive não rodarem na tag <video>.
        */}
        {embedConfig.isEmbed ? (
           <div className={`w-full h-full flex items-center justify-center ${material.type === 'video' ? 'max-w-screen-2xl' : 'max-w-5xl'}`}>
             <iframe
               key={embedConfig.url} // Force re-render if URL changes
               src={embedConfig.url}
               className="w-full h-full border-none bg-black"
               title="Content Viewer"
               // Expanded permissions for maximum compatibility
               allow="accelerometer; autoplay *; clipboard-write; encrypted-media *; gyroscope; picture-in-picture; web-share; fullscreen"
               allowFullScreen
               loading="lazy"
               style={{ 
                 display: 'block',
               }}
             />
           </div>
        ) : (
          /* Fallback para links diretos (não Google Drive) */
          <>
            {material.type === 'image' && (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                 <img 
                  src={asset.url} 
                  alt={displayTitle} 
                  className="max-w-full max-h-full object-contain shadow-2xl pointer-events-none select-none" 
                  draggable="false"
                />
              </div>
            )}

            {material.type === 'video' && (
              <div className="w-full h-full flex items-center justify-center max-w-7xl mx-auto p-0 md:p-8">
                <video 
                  controls 
                  controlsList="nodownload noremoteplayback" 
                  disablePictureInPicture
                  className="w-full max-h-full aspect-video shadow-2xl rounded-lg bg-black outline-none" 
                  autoPlay
                >
                  <source src={asset.url} />
                  {asset.subtitleUrl && <track kind="subtitles" src={asset.subtitleUrl} label={language} default />}
                  Seu navegador não suporta vídeos.
                </video>
              </div>
            )}

            {material.type === 'pdf' && (
              <div className="w-full h-full max-w-6xl mx-auto pt-20 pb-4 px-4">
                 <iframe
                   src={`${asset.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                   className="w-full h-full rounded-lg bg-white shadow-2xl border border-white/10"
                   title="PDF Viewer"
                   style={{ border: 'none' }}
                 />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};