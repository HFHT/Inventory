/** @deprecated 
 * 
 * Transfer can no longer be done from the inventory page.
*/
import { Button, Checkbox, Grid, NumberInput, Select, Tooltip } from "@mantine/core"
import { useMemo, useState } from "react"

interface ParcelTransferProps {
    inventory_id: string | number
    onTransfer: (e: ParcelTransferQtyTo) => void
}
export type ParcelTransferQtyTo = {
    qty: number,
    parcel_id: string
}
export function ParcelTransfer({ inventory_id, onTransfer }: ParcelTransferProps) {
    const [quantity, setQuantity] = useState<string | number>()
    const [toLoc, setToLoc] = useState<string | null>()
    const [allow, setAllow] = useState(false)
    console.log(inventory_id)
    // const subdivisions = useSubdivisions(true)
    // const { parcelInventory, parcelsUsingItem } = useParcelInventory(true)
    // const activeParcels = useMemo(() => {
    //     return parcelsUsingItem(inventory_id)
    // }, [parcelInventory])
    const handleTransfer = () => {
        if (!quantity || !toLoc) return
        // const toParcel = parcelInventory?.find(p => p.parcelLot === toLoc)
        // if (!toParcel) {
        //     console.warn('ParcelTransfer could not find the to location in the parcelInventory!')
        //     return
        // }
        // onTransfer({ qty: Number(quantity), parcel_id: toParcel.parcel_id })
    }
    return (
        <Grid columns={24}>
            <Grid.Col span={4} >
                <NumberInput placeholder='quantity' min={allow ? undefined : 1} value={quantity} onChange={(e) => setQuantity(e)} />
            </Grid.Col>
            <Grid.Col span={6} >
                <Select value={toLoc} placeholder='Select parcel'
                    // data={activeParcels}
                    onChange={(e) => setToLoc(e)}
                />
            </Grid.Col>
            <Grid.Col span={4} >
                <Button disabled={!toLoc || !quantity} onClick={() => handleTransfer()}>Transfer</Button>
            </Grid.Col>
            <Grid.Col span={7} >
                <Tooltip label='Allow the return of inventory.'>
                    <Checkbox mt={8} checked={allow} onChange={(e) => setAllow(e.currentTarget.checked)} label="Allow negative quantity." />
                </Tooltip>
            </Grid.Col>
        </Grid>
    )
}
