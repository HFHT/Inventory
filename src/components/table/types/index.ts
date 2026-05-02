import type { ReactNode } from "react";
import type { ViewerDbRowTypes, ViewerDbTypes } from "../../../types";

// TypeScript types
export type TableColumnHeader = {
    accessor: string;
    label: string;
    defaultValue?: string;
    type?: 'string' | 'number' | 'image' | 'select' | 'boolean' | 'json';
    isArray?: boolean;
    filterType?: 'fuzzy' | 'equal' | 'includes';
    sortable?: boolean;
    order?: number;
    size?: number;
    hide?: boolean;
    required?: boolean;
    pattern?: string;
    filterPrimary?: boolean;
    filterSecondary?: boolean;
    validate?: () => void;
    details?: TableColumnHeader[]
};

// /**  
//  * Table row type: string index keys, value is any  
//  */
// export type TableRow = Record<string, any>;

/**  
 * Table data for Table component  
 */
export interface TableData {
    columns: TableColumnHeader[];
    rows: ViewerDbTypes;
    openDrawer: () => void;
}

/**  
 * Props for the Table component  
 */
export interface TableProps {
    /** Table data: columns and rows */
    data: TableData;
    children?: (rowId: string | number | null) => ReactNode;
}

/**
 * Table Checkbox interface
 */
export interface TableCheckbox {
    allSelected: boolean;
    indeterminate: boolean;
    noneSelected: boolean;
    numSelected: number;
    pagedRowIds: (string | number)[];
    handleToggleAll: () => void;
    handleToggleRow: (rowId: string | number) => void;
    handleToggleCheckboxes: () => void;
    showCheckboxes: boolean;
}

/**
 * Table Ribbon interface.
 */

export interface TableRibbonType {
    label?: string;
    controls?: RibbonControls;
    reload?: () => void;
    onClick?: () => void | undefined;
    setTransferMode?: (mode: 'transfer' | 'palletize' | 'pallet') => void;
    data?: ViewerDbTypes;
}

/**
 * Props for the Ribbon component
 */
export interface RibbonProps {
    pagedRows: ViewerDbTypes;
    emptyRow: ViewerDbRowTypes;
    checkbox: TableCheckbox | undefined;
    controls: RibbonControls;
    reload: () => void;
    openDrawer: () => void;
    mode: string | null;
    setMode: (m: string | null) => void;
    setFilterValue: (v: string) => void;
    handleClose: () => void;
    handleToggleModal: () => void;
    clearSelectedRowIds: () => void;
    modalButtonLabel: string | undefined;
}
export interface RibbonControls {
    add?: boolean;
    start?: boolean;
    transfer?: boolean;
    pallet?: boolean;
    restock?: boolean;
    unload?: boolean;
    grid?: boolean;
    undoRedo?: boolean;
    refresh?: boolean;
    export?: boolean;
    import?: boolean;
    filter?: boolean;
    deviations?: boolean
}