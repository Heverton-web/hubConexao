import React from 'react';

interface SkeletonTableProps {
    rows?: number;
    columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 5 }) => {
    return (
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-page">
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="p-4">
                                    <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-24" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, r) => (
                            <tr key={r} className="">
                                {Array.from({ length: columns }).map((_, c) => (
                                    <td key={c} className="p-4">
                                        <div className={`h-4 bg-gray-200 dark:bg-white/5 rounded ${c === 0 ? 'w-48' : 'w-full'}`} style={{ opacity: 1 - (c * 0.1) }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
