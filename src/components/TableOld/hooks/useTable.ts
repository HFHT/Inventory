import { useState, useMemo, useEffect } from "react";
import type { TableData } from "../types";
import { filterRowsByFilterType, separateColumnsByFilterType, sortRows } from "../utils";

/**
 * State and logic management for the Table component.
 * 
 * @param {TableData} data 
 */
export function useTable(data: TableData) {
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


    // Drawer State
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<string | number | null>(null);

    /** Handle row click to open drawer */
    const handleRowClick = (_id: string | number) => {
        console.log(_id)
        setSelectedRowId(_id ?? null);
        setDrawerOpened(true);
    };
    // Reset rowId on drawer close
    const closeDrawer = () => {
        setDrawerOpened(false);
        setSelectedRowId(null);
    };

    return {
        // Data
        columns: data.columns,
        pagedRows,

        // Events
        handleRowClick,
        drawerOpened,
        closeDrawer,
        selectedRowId,

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