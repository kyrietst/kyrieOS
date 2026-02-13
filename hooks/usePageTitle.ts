'use client';

import { useEffect } from 'react';
import { useTitle } from '@/contexts/TitleContext';

/**
 * Hook to set the page title in the dynamic header.
 * @param title The title to display in the header.
 */
export function usePageTitle(title: string) {
    const { setTitle } = useTitle();

    useEffect(() => {
        setTitle(title);
    }, [title, setTitle]);
}
