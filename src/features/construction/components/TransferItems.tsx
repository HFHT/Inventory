import { Grid, NumberInput, Select, Table } from "@mantine/core";
import { useTableSelectionStore } from "../../../components/table/stores/tableStore";
import { useLocations, useResourceData } from "../../../stores";
import type { BulkInventoryItem } from "../../../types/construction";
import type { ParcelInventoryType } from "../parcels/types";
import { useMemo, useState } from "react";

export function TransferItems() {
    const [selects, setSelects] = useState<{ from: string | null, to: string | null, parcel: string | null }>({ from: 'Chuck', to: null, parcel: 'Any' })
    const selectedRowIds = useTableSelectionStore(state => state.selectedRowIds);
    const locations = useLocations();
    const { data } = useResourceData<BulkInventoryItem[]>("inventory");
    const { data: parcelData } = useResourceData<ParcelInventoryType[]>("parcelInventory");

    const transferList = useMemo(() => {
        if (selectedRowIds.length === 0) return []
        const f = selectedRowIds.map(id => data?.find(d => d._id === id))
        return f

    }, [selectedRowIds, data, parcelData])

    const rowQuantity = (row: BulkInventoryItem | undefined) => {
        if (!row) return 0
        const qtyAtLoc = row.quantity.byLocation.find(l => l.loc === selects.from)
        return qtyAtLoc ? qtyAtLoc.qty : 0
    }

    const onSiteQuantity = (row: BulkInventoryItem | undefined) => {
        const parcel = parcelData?.find(p => p.parcelLot === selects.parcel)
        if (!row || !parcel) return ''
        const parcelQty = parcel.billOfMaterial.find(b => b.inventory_id === row._id)
        return parcelQty ? `${parcelQty.actual}/${parcelQty.required ? parcelQty.required : '0'}` : '0/0'
    }
    console.log(selectedRowIds, locations)
    console.log(data, parcelData)
    return (
        <>
            <Grid>
                <Grid.Col span={3}>
                    <Select label='From' title='From' value={selects.from} data={['Chuck', 'Office']} onChange={(e) => setSelects({ ...selects, from: e })} />
                </Grid.Col>
                <Grid.Col span={5}>
                    <Select label='To' title='To' value={selects.to}
                        data={locations?.Locations.filter(l => !l.hide && l.id === undefined).map(l => l.Name)}
                        onChange={(e) => setSelects({ ...selects, to: e, parcel: null })}
                    />
                </Grid.Col>
                <Grid.Col span={4}>
                    <Select label='Parcel' title='Parcel' value={selects.parcel}
                        data={['All', ...(parcelData?.filter(p => p.subdivision_id === selects.to).map(p => p.parcelLot) ?? [])]}
                        onChange={(e) => setSelects({ ...selects, parcel: e })}
                    />
                </Grid.Col>
            </Grid>
            <Table.ScrollContainer minWidth={500} maxHeight={500}>
                <Table
                    striped
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    horizontalSpacing="md"
                    verticalSpacing="xs"
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Item</Table.Th>
                            <Table.Th>Quantity</Table.Th>
                            <Table.Th>Parcel</Table.Th>
                            <Table.Th>OnSite</Table.Th>
                            <Table.Th>Amount</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {transferList.length === 0 ? (
                            // No data row
                            <Table.Tr>
                                <Table.Td colSpan={4} style={{ textAlign: "center" }}>
                                    No data
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            // Render each row of data
                            transferList.filter(f => f !== undefined).map((row, i) => (
                                <Table.Tr
                                    key={i}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Table.Td >
                                        {row.title}
                                    </Table.Td>
                                    <Table.Td >
                                        {rowQuantity(row)}
                                    </Table.Td>
                                    <Table.Td >
                                        <Select label='Parcel' title='Parcel' value={selects.parcel}
                                            data={['All', ...(parcelData?.filter(p => p.subdivision_id === selects.to).map(p => p.parcelLot) ?? [])]}
                                            onChange={(e) => setSelects({ ...selects, parcel: e })}
                                        />
                                    </Table.Td>
                                    <Table.Td >
                                        {onSiteQuantity(row)}
                                    </Table.Td>
                                    <Table.Td >
                                        <NumberInput />
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

        </>
    )
}
