// store/themeStore.ts
import { create } from 'zustand';
import { type MantineSize } from '@mantine/core';

export type ThemeState = {
  hiddenFrom: MantineSize;
  isMobileOrTablet: boolean;
  setIsMobileOrTablet: (value: boolean) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  hiddenFrom: 'md',
  isMobileOrTablet: false,
  setIsMobileOrTablet: (isMobileOrTablet: boolean) =>
    set({ isMobileOrTablet }),
}));