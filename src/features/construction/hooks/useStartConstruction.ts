import { useEffect, useMemo, useState } from "react";
import { useTableSelectionStore } from "../../../components/table/stores/tableStore";

type RowSelection = {
    parcel: string | null;
    title?: string | undefined;
    SKU?: string | undefined;
    amount: number | null | undefined;
};
/**
 * Store row selections by row ID. { [rowId]: { parcel, amount } }
 */
type RowSelections = Record<string, RowSelection>;
export function useStartConstruction() {
    /**
     * Pull selectedRowIds directly from store. The store guarantees NonNullable
     * ids via DefinedRowId — we use useMemo to safely derive a filtered array
     * without creating a new reference on every render inside the selector.
     */
    const rawSelectedRowIds = useTableSelectionStore((state) => state.selectedRowIds);
    useEffect(() => {
        console.log('rawSelectedRowIds',rawSelectedRowIds)
    }, [rawSelectedRowIds])
    
    const selectedRowIds = useMemo(
        () => rawSelectedRowIds.filter((id): id is NonNullable<typeof id> => id != null),
        [rawSelectedRowIds]
    );
    // /** Create default rowSelections for selected row ids. */
    // function getDefaultRowSelections(ids: Array<string | number>): RowSelections {
    //     return ids.reduce<RowSelections>((acc, id) => {
    //         acc[id] = { parcel: null, amount: null };
    //         return acc;
    //     }, {});
    // }

    // /** Row selections state. */
    // const [rowSelections, setRowSelections] = useState<RowSelections>(() =>
    //     getDefaultRowSelections(selectedRowIds)
    // );

        return {

        // rowSelections,

        selectedRowIds,

    };
}
