import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon, Film, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DropZoneProps {
    onFileAccepted: (url: string, file?: File) => void;
    accept?: 'image' | 'video' | 'pdf' | 'all';
    currentUrl?: string;
    placeholder?: string;
    className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
    onFileAccepted,
    accept = 'all',
    currentUrl,
    placeholder,
    className = ""
}) => {
    const { t } = useLanguage();
    const [isDragActive, setIsDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Default placeholder using translation
    const effectivePlaceholder = placeholder || t('dropzone.drag.default');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    }, []);

    const validateFile = (file: File): boolean => {
        if (accept === 'image' && !file.type.startsWith('image/')) return false;
        if (accept === 'video' && !file.type.startsWith('video/')) return false;
        if (accept === 'pdf' && file.type !== 'application/pdf') return false;
        return true;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                const url = URL.createObjectURL(file);
                setPreview(url);
                onFileAccepted(url, file);
            } else {
                alert(t('dropzone.error.type'));
            }
        }
    }, [accept, onFileAccepted]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                const url = URL.createObjectURL(file);
                setPreview(url);
                onFileAccepted(url, file);
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file && validateFile(file)) {
                    const url = URL.createObjectURL(file);
                    setPreview(url);
                    onFileAccepted(url, file);
                    return;
                }
            } else if (item.kind === 'string' && item.type === 'text/plain') {
                item.getAsString((text) => {
                    if (text.startsWith('http')) {
                        setPreview(text);
                        onFileAccepted(text);
                    }
                });
            }
        }
    };

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onFileAccepted('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const getIcon = () => {
        if (accept === 'image') return <ImageIcon className="w-8 h-8 mb-2 opacity-50" />;
        if (accept === 'video') return <Film className="w-8 h-8 mb-2 opacity-50" />;
        if (accept === 'pdf') return <FileIcon className="w-8 h-8 mb-2 opacity-50" />;
        return <Upload className="w-8 h-8 mb-2 opacity-50" />;
    };

    return (
        <div
            className={`relative group cursor-pointer transition-all duration-300 ${className}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onClick={() => inputRef.current?.click()}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : accept === 'pdf' ? '.pdf' : '*'}
                onChange={handleChange}
            />

            <div className={`
            border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[160px]
            ${isDragActive ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border bg-surface hover:bg-page hover:border-accent/50'}
            ${preview ? 'border-solid border-accent/20' : ''}
            transition-all
        `}>

                {preview ? (
                    <div className="relative w-full h-full min-h-[120px] flex items-center justify-center">
                        {(() => {
                            // Simple type detection based on props or basic url sniffing
                            const isImageProp = accept === 'image';
                            const isVideoProp = accept === 'video';
                            const urlStr = preview.toLowerCase();
                            const isImageExt = urlStr.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/) || urlStr.startsWith('data:image');
                            const isVideoExt = urlStr.match(/\.(mp4|webm|ogg|mov)$/) || urlStr.startsWith('data:video');
                            const isYoutube = urlStr.includes('youtube') || urlStr.includes('youtu.be');

                            if (isImageProp || (accept === 'all' && isImageExt)) {
                                return <img src={preview} alt="Preview" className="max-h-40 rounded-lg shadow-sm object-contain" />;
                            }

                            if (isVideoProp || (accept === 'all' && (isVideoExt || isYoutube))) {
                                return <video src={preview} className="max-h-40 rounded-lg shadow-sm" controls />;
                            }

                            // Default for PDF or unknown
                            return (
                                <div className="flex flex-col items-center text-accent">
                                    <FileIcon size={48} />
                                    <span className="text-xs mt-2 font-mono truncate max-w-[200px]">{preview}</span>
                                </div>
                            );
                        })()}

                        <button
                            onClick={clear}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:scale-110 transition-transform"
                        >
                            <X size={14} />
                        </button>

                        <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <CheckCircle size={10} /> {t('dropzone.uploaded')}
                        </div>
                    </div>
                ) : (
                    <>
                        {getIcon()}
                        <p className="text-sm font-medium text-main">{isDragActive ? t('dropzone.drop.here') : effectivePlaceholder}</p>
                        <p className="text-xs text-muted mt-1">{t('dropzone.paste.hint')}</p>
                    </>
                )}
            </div>
        </div>
    );
};
