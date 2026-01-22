import { useState, useMemo, useEffect } from "react";
import type { TableData } from "../types";
import { filterRowsByFilterType, separateColumnsByFilterType, sortRows } from "../utils";
import type { ViewerDbRowTypes } from "../../../types";
import { useSelectedRowStore } from "../../../stores";
import { useTableSelectionStore } from "../stores/tableStore";



/**
 * State and logic management for the Table component.
 * 
 * @param {TableData} data 
 */
export function useTable(data: TableData) {

    // Selected Row Ids
    const {
        selectedRowIds,
        setSelectedRowIds,
        addSelectedRowId,
        removeSelectedRowId,
        clearSelectedRowIds,
    } = useTableSelectionStore();

    // Rows-per-page options
    const rowCounts = [20, 50, 100];

    // Pagination and row count
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(rowCounts[0]);
    // Sorting state
    const [sort, setSort] = useState<{
        column: string | null,
        direction: "asc" | "desc" | null
    }>({
        column: null,
        direction: null,
    });
    // Filter value
    const [filterValue, setFilterValue] = useState("");

    // --- Checkbox / Selection state ---
    /** Columns with filtering config derived */
    const filterColumns = useMemo(
        () => separateColumnsByFilterType(data.columns),
        [data.columns]
    );
    /** Apply filter to rows */
    const filteredRows = useMemo(
        () => filterRowsByFilterType(data.rows, filterValue, filterColumns),
        [data.rows, filterColumns, filterValue, data.columns]
    );
    /** Sort filtered rows */
    const sortedRows = useMemo(
        () => sortRows(filteredRows, sort),
        [filteredRows, sort]
    );
    /** Paginate */
    const totalRows = sortedRows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (page - 1) * rowsPerPage;
    const pagedRows = sortedRows.slice(startIndex, startIndex + rowsPerPage);

    /** Sorting handler for column headers */
    const handleSort = (accessor: string) => {
        setSort((curr) => {
            if (curr.column !== accessor) return { column: accessor, direction: "asc" };
            if (curr.direction === "asc") return { column: accessor, direction: "desc" };
            if (curr.direction === "desc") return { column: null, direction: null };
            return { column: accessor, direction: "asc" };
        });
        setPage(1);
    };

    // Reset filter and page if filterColumns change
    useEffect(() => {
        setFilterValue("");
        setPage(1);
    }, [filterColumns]);

    // Reset checkboxes on data refresh, filter, sort, etc.
    useEffect(() => {
        clearSelectedRowIds();
    }, [filteredRows, page, rowsPerPage]);

    // Checkbox logic
    // IDs of currently displayed page
    const pagedRowIds = useMemo(
        () => pagedRows.map((row) => row._id),
        [pagedRows]
    );

    const isRowSelected = (rowId: ViewerDbRowTypes["_id"]) => selectedRowIds.includes(rowId);

    // For page checkbox header:
    const numSelected = pagedRowIds.filter(id => selectedRowIds.includes(id)).length;
    const allSelected = pagedRowIds.length > 0 && numSelected === pagedRowIds.length;
    const noneSelected = numSelected === 0;
    const someSelected = !noneSelected && !allSelected;
    const indeterminate = someSelected;
    const [showCheckboxes, setShowCheckboxes] = useState(false);

    const handleToggleCheckboxes = () => {
        console.log('toggle', showCheckboxes)
        setShowCheckboxes(!showCheckboxes);
    }



    // Handler for header checkbox
    const handleToggleAll = () => {
        if (allSelected) {
            // Remove all from this page
            setSelectedRowIds(selectedRowIds.filter(id => !pagedRowIds.includes(id)));
        } else {
            // Add all from this page
            setSelectedRowIds(Array.from(new Set([...selectedRowIds, ...pagedRowIds])));
        }
    };

    // Handler for individual row
    const handleToggleRow = (rowId: ViewerDbRowTypes["_id"]) => {
        if (selectedRowIds.includes(rowId)) {
            removeSelectedRowId(rowId);
        } else {
            addSelectedRowId(rowId);
        }
    };

    /** Handle row click (set selected row in Zustand store) */
    const handleRowClick = (row: ViewerDbRowTypes) => {
        useSelectedRowStore.getState().setSelectedRow(row);
        data.openDrawer()
        console.log(row);
    };

    /** mode controls which modal component is used within the custom modal */
    const [mode, setMode] = useState<string | null>(null)
    const handleClose = () => {
        handleToggleCheckboxes()
        clearSelectedRowIds()
        setMode(null)
    }

    return {
        // Data
        columns: data.columns,
        pagedRows,
        // controls
        control: {
            mode: mode,
            setMode: setMode,
            handleClose: handleClose
        },
        // Row selection
        selectedRowIds,
        isRowSelected,
        clearSelectedRowIds,
        // Checkbox only if enabled
        checkbox: {
            allSelected,
            indeterminate,
            noneSelected,
            numSelected,
            pagedRowIds,
            handleToggleAll,
            handleToggleRow,
            handleToggleCheckboxes,
            showCheckboxes,
        },

        // Events
        handleRowClick,

        // Filtering
        filterValue,
        setFilterValue: (v: string) => {
            setFilterValue(v);
            setPage(1);
        },

        // Sorting
        sort,
        handleSort,

        // Pagination
        page,
        setPage,
        totalPages,
        rowsPerPage,
        setRowsPerPage: (n: number) => {
            setRowsPerPage(n);
            setPage(1);
        },
        rowCounts,
    };
}