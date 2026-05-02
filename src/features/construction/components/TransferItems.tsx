import { Button, Fieldset, Flex, Grid, NumberInput, Select, Table } from "@mantine/core";
import { IconTruck } from "@tabler/icons-react";
import { useTransferItems } from "../hooks";
import type { JSX } from "react";
import { numberError } from "../../../utils";
import { RowAmount, StatusIcon } from ".";
import { ParcelSubdivisionSelect } from "../../parcels";
import type { BulkInventoryItem } from "../../../types/construction";

/**
 * Show a UI that allows transferring inventory items between locations,
 * optionally linked to parcel lots. Includes per-row parcel and quantity inputs.
 *
 * @component
 * @returns {JSX.Element}
 */
export function TransferItems({ handleClose }: { handleClose?: () => void }): JSX.Element {
    const {
        selects,
        rowSelections,
        handleParcelSelectChange,
        handleTransferOfItems,
        rowQuantity,
        onSiteQuantity,
        setFromLocation,
        setToLocation,
        setToParcel,
        transferDisabled,
        setRowAmount,
        removeItem,
        transferList,
        locations,
        parcelData,
        transferResults,
        transferResultsColor
    } = useTransferItems({ db: 'Inventory', type: 'inventory' });

    console.log(rowSelections)
    const theTransferList = transferList as BulkInventoryItem[]
    return (
        <>
            <Grid mb="0" pb="0">
                <Grid.Col span={3}>
                    <Select
                        label="From"
                        title="From"
                        value={selects.locationOfInventory}
                        data={["Chuck", "Office"]}
                        onChange={setFromLocation}
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <ParcelSubdivisionSelect
                        locations={{
                            from: selects.locationOfInventory,
                            to: selects.locationOfParcel,
                            parcel: selects.parcel,
                            listOfLocations: locations
                        }}
                        parcelData={parcelData}
                        setToLocation={setToLocation}
                        setToParcel={setToParcel}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    {transferResults === undefined ?
                        <Button
                            w="100%"
                            disabled={transferDisabled()}
                            rightSection={<IconTruck size={14} />}
                            mt="1.5rem"
                            onClick={() => handleTransferOfItems()}
                        >
                            Transfer
                        </Button>
                        :
                        <Button
                            w="100%"
                            variant='light'
                            color={transferResultsColor()}
                            // rightSection={<IconTruck size={14} />}
                            mt="1.5rem"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    }
                </Grid.Col>
            </Grid>
            <Fieldset disabled={transferResults !== undefined}>
                <Table.ScrollContainer minWidth={500} maxHeight={500} mt="xs">
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
                                <Table.Th>Available</Table.Th>
                                <Table.Th>Parcel</Table.Th>
                                <Table.Th>OnSite</Table.Th>
                                <Table.Th>Amount</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {theTransferList.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                                        No data
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                theTransferList
                                    .filter(row => row !== undefined)
                                    .map(row => (
                                        <Table.Tr key={row._id} style={{ cursor: "pointer" }}>
                                            <Table.Td>{row.title}</Table.Td>
                                            <Table.Td><RowAmount row={row} rowAmount={rowQuantity(row)} rowAdjust={rowSelections[row._id].amount} transferResults={transferResults} /></Table.Td>
                                            <Table.Td>
                                                <Select
                                                    value={rowSelections[row._id].parcel || null}
                                                    data={[
                                                        "All",
                                                        ...(
                                                            parcelData
                                                                ?.filter(p => p.subdivision_id === selects.locationOfParcel)
                                                                .map(p => p.parcelLot)
                                                                .filter((x): x is string => x != null) // filter out null or undefined
                                                            ?? []
                                                        )
                                                    ]}
                                                    onChange={val => handleParcelSelectChange(row._id, val)}
                                                />
                                            </Table.Td>
                                            <Table.Td>{onSiteQuantity(row)}</Table.Td>
                                            <Table.Td>
                                                <Flex>
                                                    <NumberInput
                                                        value={rowSelections[row._id].amount ?? ''}
                                                        min={0}
                                                        error={
                                                            numberError(rowSelections[row._id].amount, rowQuantity(row))
                                                        }
                                                        onChange={v =>
                                                            /* use this event to also update the row title */
                                                            setRowAmount(row._id, typeof v === "number" ? v : 0, row.title)
                                                        }
                                                    />
                                                    <StatusIcon row={row} transferResults={transferResults} removeItem={() => removeItem(row._id)} />
                                                </Flex>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Fieldset>
        </>
    );
}