import type { RibbonProps } from "../types";

export function useRibbon(data: RibbonProps) {
    console.log(data)

    return {
        controls: data.controls,
        pagedRows: data.pagedRows,
        addRow: data.addRow,
        openDrawer: data.openDrawer
    }
}
