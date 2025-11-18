/** 
 * Synchronizes Mantine theme breakpoints with Zustand store (mobile/tablet state)
 */
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';
import { useThemeStore } from '../stores';

export function useSyncIsMobileOrTablet() {
  const theme = useMantineTheme();
  const maxWidth = theme.breakpoints.md; // e.g., "48em"
  const isMobileOrTablet = useMediaQuery(`(max-width: ${maxWidth})`);
  const setIsMobileOrTablet = useThemeStore((s) => s.setIsMobileOrTablet);

  // Update Zustand store whenever the media query changes
  useEffect(() => {
    setIsMobileOrTablet(isMobileOrTablet);
  }, [isMobileOrTablet, setIsMobileOrTablet]);
}