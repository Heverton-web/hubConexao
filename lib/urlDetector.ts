import { MaterialType } from '../types';

export interface UrlDetectionResult {
    provider: 'youtube' | 'google_drive' | 'instagram' | 'tiktok' | 'linkedin' | 'direct';
    label: string;
    icon: string; // emoji
    materialType: MaterialType;
    embedUrl: string;
    thumbnailUrl?: string;
    originalUrl: string;
    confidence: number; // 0-1
}

// --- Provider Detection ---

const detectYouTube = (url: string): UrlDetectionResult | null => {
    const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (!match?.[1]) return null;
    const videoId = match[1];
    return {
        provider: 'youtube',
        label: 'YouTube',
        icon: '▶',
        materialType: 'video',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        originalUrl: url,
        confidence: 1,
    };
};

const detectGoogleDrive = (url: string): UrlDetectionResult | null => {
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (!idMatch?.[1]) return null;
    const fileId = idMatch[1];

    // Try to detect type from URL context
    let materialType: MaterialType = 'pdf';
    const lower = url.toLowerCase();
    if (lower.includes('video') || lower.includes('.mp4') || lower.includes('.mov')) {
        materialType = 'video';
    } else if (lower.includes('image') || lower.includes('.jpg') || lower.includes('.png') || lower.includes('.webp')) {
        materialType = 'image';
    }

    return {
        provider: 'google_drive',
        label: 'Google Drive',
        icon: '📁',
        materialType,
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w400`,
        originalUrl: url,
        confidence: 1,
    };
};

const detectInstagram = (url: string): UrlDetectionResult | null => {
    if (!url.includes('instagram.com')) return null;
    const isReel = url.includes('/reel/') || url.includes('/reels/');
    return {
        provider: 'instagram',
        label: 'Instagram',
        icon: '📸',
        materialType: isReel ? 'video' : 'image',
        embedUrl: url.replace(/\?.*$/, '') + (url.endsWith('/') ? 'embed' : '/embed'),
        originalUrl: url,
        confidence: 0.9,
    };
};

const detectTikTok = (url: string): UrlDetectionResult | null => {
    if (!url.includes('tiktok.com')) return null;
    const videoMatch = url.match(/\/video\/(\d+)/);
    const embedUrl = videoMatch
        ? `https://www.tiktok.com/embed/v2/${videoMatch[1]}`
        : url;

    return {
        provider: 'tiktok',
        label: 'TikTok',
        icon: '🎵',
        materialType: 'video',
        embedUrl,
        originalUrl: url,
        confidence: 0.9,
    };
};

const detectLinkedIn = (url: string): UrlDetectionResult | null => {
    if (!url.includes('linkedin.com')) return null;
    const isVideo = url.includes('/video/') || url.includes('embed');
    return {
        provider: 'linkedin',
        label: 'LinkedIn',
        icon: '💼',
        materialType: isVideo ? 'video' : 'pdf',
        embedUrl: url,
        originalUrl: url,
        confidence: 0.8,
    };
};

const detectDirect = (url: string): UrlDetectionResult => {
    const lower = url.toLowerCase();
    let materialType: MaterialType = 'pdf';

    // Detect by extension
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)(\?|$)/)) {
        materialType = 'image';
    } else if (lower.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/)) {
        materialType = 'video';
    } else if (lower.match(/\.(pdf)(\?|$)/)) {
        materialType = 'pdf';
    }

    return {
        provider: 'direct',
        label: 'Link Direto',
        icon: '🌐',
        materialType,
        embedUrl: url,
        originalUrl: url,
        confidence: 0.5,
    };
};

// --- Main Detector ---

export const detectUrl = (rawUrl: string): UrlDetectionResult | null => {
    const url = rawUrl.trim();
    if (!url) return null;

    // Handle iframe paste — extract src
    if (url.includes('<iframe') && url.includes('src=')) {
        const srcMatch = url.match(/src=["'](.*?)["']/);
        if (srcMatch?.[1]) return detectUrl(srcMatch[1]);
    }

    // Try each provider in order of specificity
    return (
        detectYouTube(url) ||
        detectGoogleDrive(url) ||
        detectInstagram(url) ||
        detectTikTok(url) ||
        detectLinkedIn(url) ||
        detectDirect(url)
    );
};

// --- Provider Info (for UI) ---

export const PROVIDERS = [
    { id: 'youtube', label: 'YouTube', icon: '▶', color: '#FF0000' },
    { id: 'google_drive', label: 'Google Drive', icon: '📁', color: '#4285F4' },
    { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#00F2EA' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077B5' },
    { id: 'direct', label: 'Link Direto', icon: '🌐', color: '#FFFFFF' },
] as const;
