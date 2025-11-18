import React from "react";
import type { TableProps } from "./types";
import { TablePresenter } from "./TablePresenter";
import { useTable } from "./hooks";

/**
 * Mantine Table container: Connects logic to UI.
 */
export const Table: React.FC<TableProps> = ({ data, children }) => {
    const table = useTable(data);
    return <TablePresenter {...table} drawerChild={children} />;
};