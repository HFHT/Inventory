import { type JSX, type ReactElement } from "react";
import { create } from "zustand";
import { HomePage } from "../pages";
/**
 * Describes the navigation state.
 */
export type NavItem = 
  | { label: string; key: string; page: ReactElement; children?: never }
  | { label: string; key: string; page?: never; children: NavItem[] };


/**
 * Zustand store interface for navigation.
 */
export interface NavigationStore {
  navigation: NavItem;
  setNavigation: (next: NavItem | ((prev: NavItem) => NavItem)) => void;
  navbarOpened: boolean;
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleNavbar: () => void;
}

/**
 * The default navigation state.
 */
const defaultNavigation: NavItem = {
  page: <HomePage />,
  key: "Home",
  label: "Home",
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
 * Checks if the current navigation is for the given key.
 * @param navigation The navigation object.
 * @param key The key to check.
 * @returns True if the navigation key matches the provided key.
 */
export const isPage = (navigation: NavItem, key: string): boolean =>
  navigation.key === key;