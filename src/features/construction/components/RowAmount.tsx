import { Flex, Text } from "@mantine/core"
import type { BulkInventoryItem, TransferResults } from "../../../types/construction"

export const RowAmount = ({ row, rowAmount, rowAdjust, transferResults, }: { row: BulkInventoryItem, rowAmount: number, rowAdjust: number | null | undefined, transferResults: TransferResults | undefined }) => {
    console.log(transferResults)
    if (transferResults === undefined)
        return <Text>{rowAmount}</Text>
    const resultForRow = transferResults.result.find((t) => Number(t.rowId) === row._id)
    if (!resultForRow || resultForRow.status === 'skipped') {
        return <Text>{rowAmount}</Text>
    }
    const remaining = rowAdjust ? rowAmount - rowAdjust : 'error'
    return (
        <Flex>
            <Text style={{ textDecoration: 'line-through', opacity: 0.8 }}>{rowAmount}</Text>
            <Text>&nbsp;&nbsp;{remaining}</Text>
        </Flex>
    )
}