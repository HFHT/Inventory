import { create } from 'zustand';

type RowType = Record<string, any>; // or your actual row type/interface

interface SelectedRowState {
  selectedRow: RowType | null;
  setSelectedRow: (row: RowType | null) => void;
}

export const useSelectedRowStore = create<SelectedRowState>((set) => ({
  selectedRow: null,
  setSelectedRow: (row) => set({ selectedRow: row }),
}));