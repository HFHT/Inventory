import { TextInput } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import type { JSX } from "react";

/**
 * Props for the TableFilter component.
 * 
 * @typedef {Object} TableFilterProps
 * @property {string} filterValue - The current value of the filter input.
 * @property {(value: string) => void} setFilterValue - Callback to set the filter value.
 */
export interface TableFilterProps {
    filterValue: string;
    setFilterValue: (value: string) => void;
}

/**
 * TableFilter renders a text input for filtering a specific column in a table.
 * 
 * - Shows an icon and placeholder indicating the filtered column.
 * - Calls `setFilterValue` on change.
 * 
 * @param {TableFilterProps} props - The properties for the TableFilter component.
 * @returns {JSX.Element | null} The filter input field, or `null` if no column is selected.
 */
export function TableFilter({
    filterValue,
    setFilterValue,
}: TableFilterProps): JSX.Element | null {
    return (
        <TextInput
            leftSection={<IconFilter size={16} />}
            value={filterValue}
            onChange={(e) => setFilterValue(e.currentTarget.value)}
            placeholder={"Filter..."}
            size="xs"
        />
    );
}