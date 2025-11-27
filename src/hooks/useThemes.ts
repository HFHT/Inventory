import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { HIDDENFROM, MAXWIDTH, SMALLSCREEN } from '../constants/themes';

export function useTheme() {
    const theme = useMantineTheme();
    const isMobileOrTablet = useMediaQuery(`(max-width: ${theme.breakpoints[MAXWIDTH]})`);
    const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints[SMALLSCREEN]})`);
    return { isMobileOrTablet, isSmallScreen, hiddenFrom: HIDDENFROM }
}
