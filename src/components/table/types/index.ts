import type { ReactNode } from "react";
import type { ViewerDbTypes } from "../../../types";

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
}

/**  
 * Props for the Table component  
 */
export interface TableProps {
    /** Table data: columns and rows */
    data: TableData;
    children?: (rowId: string | number | null) => ReactNode;
} 