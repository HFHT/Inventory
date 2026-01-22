import { useEffect, useState } from 'react';

/**
 * Custom hook to get the scroll area height as (window height - 300px).
 * Updates automatically on window resize.
 *
 * @returns {number} The computed scroll area height in pixels.
 */
export function useScrollAreaHeight(offset: number): number {
    const getHeight = () => window.innerHeight - offset;
    const [height, setHeight] = useState<number>(getHeight());

    useEffect(() => {
        const handleResize = () => setHeight(getHeight());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return height;
}