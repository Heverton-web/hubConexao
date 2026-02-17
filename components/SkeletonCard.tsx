import React from 'react';

export const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border/50 animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-video bg-gray-200 dark:bg-white/5 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>

            {/* Content Placeholder */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-md w-3/4" />

                {/* Tags */}
                <div className="flex gap-2 pt-1">
                    <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-16" />
                    <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-16" />
                </div>

                {/* Footer */}
                <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                    <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-20" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-white/5 rounded-lg" />
                </div>
            </div>
        </div>
    );
};
