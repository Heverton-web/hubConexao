import { useState, useMemo } from 'react';

export interface UsePaginationProps<T> {
    data: T[];
    itemsPerPage?: number;
}

export interface UsePaginationReturn<T> {
    currentData: T[];
    currentPage: number;
    totalPages: number;
    nextPage: () => void;
    prevPage: () => void;
    jumpToPage: (page: number) => void;
    startIndex: number;
    endIndex: number;
}

export function usePagination<T>({ data, itemsPerPage = 12 }: UsePaginationProps<T>): UsePaginationReturn<T> {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage]);

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return data.slice(start, end);
    }, [data, currentPage, itemsPerPage]);

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const jumpToPage = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };

    // Reset page when data length changes significantly (e.g. filtering)
    // Note: specific useEffect logic can be added here if needed, 
    // currently we rely on user resetting page if filter changes
    // or we can add a listener to reset if totalPages changes drastically

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);

    return {
        currentData,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        jumpToPage,
        startIndex,
        endIndex
    };
}
