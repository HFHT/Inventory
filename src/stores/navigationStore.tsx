import { type JSX } from "react";
import { create } from "zustand";
import { HomePage } from "../pages";
/**
 * Describes the navigation state.
 */
export type NavigationType = {
  page: JSX.Element;
  filter: string | null;
  key: string;
};

/**
 * Zustand store interface for navigation.
 */
export interface NavigationStore {
  navigation: NavigationType;
  setNavigation: (next: NavigationType | ((prev: NavigationType) => NavigationType)) => void;
  navbarOpened: boolean;
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleNavbar: () => void;
}

/**
 * The default navigation state.
 */
const defaultNavigation: NavigationType = {
  page: <HomePage open={true} />,
  key: "Home",
  filter: null,
};

/**
 * Zustand store for navigation data.
 * 
 * @returns Zustand hook for navigation state and actions.
 * @example
 * const { navigation, setNavigation } = useNavigationStore();
 */
export const useNavigationStore = create<NavigationStore>((set) => ({
  navigation: defaultNavigation,
  setNavigation: (next) =>
    set((state) => ({
      navigation: typeof next === "function" ? next(state.navigation) : next,
    })),

  // NavBar control state and actions
  navbarOpened: false,
  openNavbar: () => set({ navbarOpened: true }),
  closeNavbar: () => set({ navbarOpened: false }),
  toggleNavbar: () => set((state) => ({ navbarOpened: !state.navbarOpened })),
}));

/**
 * Get only the navigation.filter value. Deprecated, use CategoryProvider instead.
 */
export function useNavigationFilter(): string | null {
  return useNavigationStore((state) => state.navigation.filter);
}

/**
 * Checks if the current navigation is for the given key.
 * @param navigation The navigation object.
 * @param key The key to check.
 * @returns True if the navigation key matches the provided key.
 */
export const isPage = (navigation: NavigationType, key: string): boolean =>
  navigation.key === key;