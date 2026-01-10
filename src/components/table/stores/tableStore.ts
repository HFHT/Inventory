import { create } from "zustand";
import type { ViewerDbRowTypes } from "../../../types";

interface TableSelectionStore {
  selectedRowIds: Array<ViewerDbRowTypes["_id"]>;
  setSelectedRowIds: (ids: Array<ViewerDbRowTypes["_id"]>) => void;
  addSelectedRowId: (id: ViewerDbRowTypes["_id"]) => void;
  removeSelectedRowId: (id: ViewerDbRowTypes["_id"]) => void;
  clearSelectedRowIds: () => void;
}

export const useTableSelectionStore = create<TableSelectionStore>((set) => ({
  selectedRowIds: [],
  setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
  addSelectedRowId: (id) =>
    set((state) => ({
      selectedRowIds: [...state.selectedRowIds, id],
    })),
  removeSelectedRowId: (id) =>
    set((state) => ({
      selectedRowIds: state.selectedRowIds.filter((_id) => _id !== id),
    })),
  clearSelectedRowIds: () => set({ selectedRowIds: [] }),
}));