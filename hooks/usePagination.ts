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

    // Reset to page 1 when data changes (filtering)
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

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
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (data.length === 0) {
            setCurrentPage(1);
        }
    }, [data.length, totalPages, currentPage]);

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
