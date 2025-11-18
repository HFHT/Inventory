// TableDrawer.tsx
import React, { type ReactNode } from "react";
import { Drawer, Text } from "@mantine/core";

export interface TableDrawerProps {
    opened: boolean;
    onClose: () => void;
    rowId: string | number | null;
    children?: ReactNode | undefined | null
}

export const TableDrawer: React.FC<TableDrawerProps> = ({ opened, onClose, rowId, children }) => (
    <Drawer
        opened={opened}
        onClose={onClose}
        title="Inventory Item"
        position="right"
        offset={12}
        radius='md'
        size="65%"
        overlayProps={{ backgroundOpacity: 0.4, blur: 1 }}
    >
        {children}
    </Drawer>
);