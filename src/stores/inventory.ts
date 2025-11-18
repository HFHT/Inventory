/**@deprecated */

import { create } from 'zustand';

export type Item = {
  id: number;
  name: string;
};

type InventoryState = {
  items: Item[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Item) => void;
};

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [{ id: 1, name: "Sample Item" }],
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  addItem: (item) => set((state) => ({ items: [...state.items, item], isDrawerOpen: false })),
}));