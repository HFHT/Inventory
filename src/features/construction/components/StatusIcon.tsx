import { CloseButton, Tooltip } from "@mantine/core";
import type { BulkInventoryItem, TransferResults } from "../../../types/construction";
import { IconCircleCheckFilled, IconExclamationCircleFilled } from "@tabler/icons-react";

export const StatusIcon = ({ row, transferResults, removeItem }: { row: BulkInventoryItem, transferResults: TransferResults | undefined, removeItem: () => void }) => {
    if (transferResults !== undefined) {
        const resultForRow = transferResults.result.find((t) => Number(t.rowId) === row._id)
        if (!resultForRow || resultForRow.status === 'skipped') {
            return (
                <Tooltip label={resultForRow ? resultForRow.reason : 'Network error.'}><IconExclamationCircleFilled size={36} color='red' /></Tooltip>
            );
        }
        return <IconCircleCheckFilled size={36} color='green' />;
    }
    return <CloseButton size={36} onClick={() => removeItem()} />;
};