import { Button, CloseButton, Fieldset, Flex, Grid, Select, Table } from "@mantine/core";
import { IconCircleCheckFilled, IconExclamationCircleFilled, IconTruck } from "@tabler/icons-react";
import { useTransferItems } from "../hooks";
import type { JSX } from "react";
import type { BulkInventoryItem } from "../../../types/construction";
import { ParcelSubdivisionSelect } from "../parcels";

/**
 * Show a UI that allows transferring inventory items between locations,
 * optionally linked to parcel lots. Includes per-row parcel and quantity inputs.
 *
 * @component
 * @returns {JSX.Element}
 */
export function TransferPallet({ handleClose }: { handleClose?: () => void }): JSX.Element {
    const {
        selects,
        rowSelections,
        handleParcelSelectChange,
        handleTransferOfItems,
        setFromLocation,
        setToLocation,
        setToParcel,
        transferDisabled,
        removeItem,
        transferList,
        locations,
        parcelData,
        transferResults,
        transferResultsColor
    } = useTransferItems({ db: 'Inventory', type: 'pallet' });


    console.log(rowSelections)

    const StatusIcon = ({ row }: { row: BulkInventoryItem }) => {
        if (transferResults !== undefined) {
            const resultForRow = transferResults.result.find((t) => Number(t.rowId) === row._id)
            if (!resultForRow || resultForRow.status === 'skipped') {
                return <IconExclamationCircleFilled size={36} color='red' />;
            }
            return <IconCircleCheckFilled size={36} color='green' />;
        }
        return <CloseButton size={36} onClick={() => removeItem(row._id)} />;
    };

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
                {/* <Grid.Col span={3}>
                    <Select
                        label="To"
                        title="To"
                        value={selects.locationOfParcel}
                        data={
                            locations?.Locations
                                .filter(l => !l.hide && l.id === undefined && l.Name !== selects.locationOfInventory)
                                .map(l => l.Name)
                        }
                        onChange={setToLocation}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <Select
                        label="Parcel"
                        title="Parcel"
                        value={selects.parcel}
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
                        onChange={setToParcel}
                    />
                </Grid.Col> */}
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
                                <Table.Th>Pallet</Table.Th>
                                <Table.Th>Parcel</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {transferList.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                                        No data
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                transferList
                                    .filter(row => row !== undefined)
                                    .map(row => (
                                        <Table.Tr key={row._id} style={{ cursor: "pointer" }}>
                                            <Table.Td>{row.title}</Table.Td>
                                            <Table.Td>
                                                <Flex>
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
                                                        onChange={val => {
                                                            handleParcelSelectChange(row._id, val);
                                                        }}
                                                    />
                                                    <StatusIcon row={row} />
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