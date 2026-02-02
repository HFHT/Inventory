/** @deprecated not used. */
import type { RibbonProps } from "../types";

export function useRibbon(data: RibbonProps) {
    console.log(data)

    return {
        controls: data.controls,
        checkbox: data.checkbox,
        pagedRows: data.pagedRows,
        emptyRow: data.emptyRow,
        reload: data.reload,
        openDrawer: data.openDrawer
    }
}
