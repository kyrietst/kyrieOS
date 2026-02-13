'use client';

import { usePageTitle } from '@/hooks/usePageTitle';

interface TitleSetterProps {
    title: string;
}

/**
 * A client component that sets the page title in the dynamic header.
 * Useful for Server Components where hooks cannot be used directly.
 */
export function TitleSetter({ title }: TitleSetterProps) {
    usePageTitle(title);
    return null;
}
