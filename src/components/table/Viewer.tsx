import { Table as MantineTable, Group, UnstyledButton, Center, Box, Checkbox } from "@mantine/core";
import {
    IconChevronUp,
    IconChevronDown,
    IconSelector,
} from "@tabler/icons-react";
import { useMemo, type JSX } from "react";
import type { TableCheckbox, TableColumnHeader } from "./types";
import { getValueByAccessor } from "./utils";
import type { ViewerDbRowTypes, ViewerDbTypes } from "../../types";

/**
 * Props for the TableView component.
 * 
 * @typedef {Object} TableViewProps
 * @property {TableColumnHeader[]} columns - The column headers for the table, each with accessor, label, and options.
 * @property {ViewerDbTypes[]} rows - The table row data (already filtered and sorted).
 * @property {{ column: string | null, direction: "asc" | "desc" | null }} sort - Current sort column and direction.
 * @property {(accessor: string) => void} onSort - Callback to sort data by column accessor.
 * @property {(row: ViewerDbRowTypes) => void} onClick - Callback to handle the selection of a table row.
 */
export interface TableViewProps {
    columns: TableColumnHeader[];
    pagedRows: ViewerDbTypes;
    sort: { column: string | null; direction: "asc" | "desc" | null };
    handleSort: (accessor: string) => void;
    handleRowClick: (row: ViewerDbRowTypes) => void;
    checkbox: TableCheckbox;
    isRowSelected: (rowId: string | number) => boolean;
    selectedRowIds: ViewerDbRowTypes["_id"][]
}

/**
 * Renders a data table using Mantine components, with sortable and non-sortable column headers.
 *
 * Displays table head, body, and handles cases such as empty data and current sorting indicators.
 *
 * @component
 * @param {TableMarkupProps} props The component props.
 * @returns {JSX.Element} The rendered table markup.
 */
export function Viewer({ columns, pagedRows, sort, handleSort, handleRowClick, checkbox, isRowSelected, selectedRowIds }: TableViewProps) {

    const displayAbleColumns = useMemo(() => {
        return columns.filter((c) => c.type !== 'json')
    }, [columns])
    /**
     * Returns the appropriate sort icon for a given column.
     *
     * @param {string} accessor - The column accessor for which to get the sort icon.
     * @returns {JSX.Element} The icon representing the current sort state for the column.
     */
    const getSortIcon = (accessor: string): JSX.Element => {
        if (sort.column !== accessor) return <IconSelector size={14} />;
        if (sort.direction === "asc") return <IconChevronUp size={14} />;
        if (sort.direction === "desc") return <IconChevronDown size={14} />;
        return <IconSelector size={14} />;
    };
    console.log('Viewer render')
    return (
        <MantineTable.ScrollContainer minWidth={500} maxHeight={500}>
            <MantineTable
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="xs"
            >
                <MantineTable.Thead>
                    <MantineTable.Tr>
                        {checkbox.showCheckboxes && <MantineTable.Th><Checkbox checked={checkbox.allSelected} indeterminate={checkbox.indeterminate} onChange={() => checkbox.handleToggleAll()} variant='outline' /></MantineTable.Th>}
                        {displayAbleColumns.map((col) => (
                            <MantineTable.Th key={col.accessor}>
                                {col.sortable === false ? (
                                    // Non-sortable column
                                    <Box>{col.label}</Box>
                                ) : (
                                    // Sortable column
                                    <UnstyledButton
                                        onClick={() => handleSort(col.accessor)}
                                        style={{ width: "100%" }}
                                        aria-label={`Sort by ${col.label}`}
                                    >
                                        <Group justify="space-between" gap={4}>
                                            <span>{col.label}</span>
                                            <Center>{getSortIcon(col.accessor)}</Center>
                                        </Group>
                                    </UnstyledButton>
                                )}
                            </MantineTable.Th>
                        ))}
                    </MantineTable.Tr>
                </MantineTable.Thead>
                <MantineTable.Tbody>
                    {pagedRows.length === 0 ? (
                        // No data row
                        <MantineTable.Tr>
                            <MantineTable.Td colSpan={columns.length} style={{ textAlign: "center" }}>
                                No data
                            </MantineTable.Td>
                        </MantineTable.Tr>
                    ) : (
                        // Render each row of data
                        pagedRows.map((row, i) => (
                            <MantineTable.Tr
                                key={i}
                                style={{ cursor: "pointer" }}
                            >
                                {checkbox.showCheckboxes && <MantineTable.Td><Checkbox variant='outline' checked={isRowSelected(row._id)} onChange={() => checkbox.handleToggleRow(row._id)} /></MantineTable.Td>}
                                {displayAbleColumns.map((col) => (
                                    <MantineTable.Td key={col.accessor} onClick={() => handleRowClick(row)}>
                                        {getValueByAccessor(row, col.accessor)}
                                    </MantineTable.Td>
                                ))}
                            </MantineTable.Tr>
                        ))
                    )}
                </MantineTable.Tbody>
            </MantineTable>
        </MantineTable.ScrollContainer>
    );
}