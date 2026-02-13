'use client';

import { useTitle } from '@/contexts/TitleContext';

export function PageTitle() {
    const { title } = useTitle();

    return (
        <h1 className="text-xl font-semibold transition-all duration-300 ease-in-out">
            {title}
        </h1>
    );
}
