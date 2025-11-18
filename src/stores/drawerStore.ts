import { create } from 'zustand';


type DrawerState = {
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
};

export const useDrawerStore = create<DrawerState>((set) => ({
    isDrawerOpen: false,
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
}));