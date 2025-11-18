import { Table as MantineTable, Group, UnstyledButton, Center, Box } from "@mantine/core";
import {
    IconChevronUp,
    IconChevronDown,
    IconSelector,
} from "@tabler/icons-react";
import type { TableColumnHeader, TableRow } from "./types";
import { getValueByAccessor } from "./utils";
import type { JSX } from "react";

/**
 * Props for the TableView component.
 * 
 * @typedef {Object} TableViewProps
 * @property {TableColumnHeader[]} columns - The column headers for the table, each with accessor, label, and options.
 * @property {TableRow[]} rows - The table row data (already filtered and sorted).
 * @property {{ column: string | null, direction: "asc" | "desc" | null }} sort - Current sort column and direction.
 * @property {(accessor: string) => void} onSort - Callback to sort data by column accessor.
 * @property {(id: string | number) => void} onClick - Callback to handle the selection of a table row.
 */
export interface TableViewProps {
    columns: TableColumnHeader[];
    rows: TableRow[];
    sort: { column: string | null; direction: "asc" | "desc" | null };
    onSort: (accessor: string) => void;
    onClick: (id: string | number) => void;
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
export function TableView({ columns, rows, sort, onSort, onClick }: TableViewProps) {
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
    console.log('TableView render')
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
                        {columns.map((col) => (
                            <MantineTable.Th key={col.accessor}>
                                {col.sortable === false ? (
                                    // Non-sortable column
                                    <Box>{col.label}</Box>
                                ) : (
                                    // Sortable column
                                    <UnstyledButton
                                        onClick={() => onSort(col.accessor)}
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
                    {rows.length === 0 ? (
                        // No data row
                        <MantineTable.Tr>
                            <MantineTable.Td colSpan={columns.length} style={{ textAlign: "center" }}>
                                No data
                            </MantineTable.Td>
                        </MantineTable.Tr>
                    ) : (
                        // Render each row of data
                        rows.map((row, i) => (
                            <MantineTable.Tr
                                key={i}
                                style={{ cursor: "pointer" }}
                                onClick={() => onClick(row._id)}
                            >
                                {columns.map((col) => (
                                    <MantineTable.Td key={col.accessor}>
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