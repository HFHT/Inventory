

/** The back end linkages are wrong, need new pallet item specific methods. 
 * May need to refactor useTransferItems or create a new hook. 
 * Backend will receive the BasePallet object with the contents objects extended with a remove value.
 * Need a Restock (submit) button
 * Need to figure out whether to allow a Restock if the pallet is not at a warehouse location.
 * -- can clicking on Restock filter the table to include only warehouse locations?
*/





import { Table, Text, Group, Box, Image, Tooltip, Paper, NumberInput, Flex, CloseButton, rem, Grid, Button, Stack, Title, } from '@mantine/core';
import { IconCircleCheckFilled, IconClipboardPlusFilled, IconExclamationCircleFilled, IconForklift, IconPackage } from '@tabler/icons-react';
import type { BasePallet, BulkInventoryItem, PalletContents, TransferResults } from '../../../types/construction';
import { useResourceData } from '../../../stores';
import { useTransferPalletContents } from "../hooks";
import { warehouseLocations } from '../utils';
import type { JSX } from 'react';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Props for {@link PalletContentsTable}.
 */
interface PalletContentsTableProps {
    /** The contents array from the parent pallet. */
    contents: PalletContents[];
    transferResults: TransferResults | undefined;
    updateRestockAmount: (inventory_id: string | number, amount: number) => void;
}

/**
 * Renders a nested table of {@link PalletContents} items.
 *
 * @param {PalletContentsTableProps} props
 * @returns {JSX.Element}
 */
function PalletContentsTable({ contents, transferResults, updateRestockAmount }: PalletContentsTableProps) {

    const StatusIcon = ({ row }: { row: PalletContents }) => {
        if (transferResults !== undefined) {
            const resultForRow = transferResults.result.find((t) => Number(t.rowId) === row.inventory_id)
            if (!resultForRow || resultForRow.status === 'skipped') {
                return <IconExclamationCircleFilled size={36} color='red' />;
            }
            return <IconCircleCheckFilled size={36} color='green' />;
        }
        return (
            <Tooltip label={'Restock All'} >
                <CloseButton icon={<IconClipboardPlusFilled />} size={36} onClick={() => updateRestockAmount(row.inventory_id, row.amount)} />
            </Tooltip>
        )
    };
    if (contents.length === 0) {
        return (
            <Text c="dimmed" size="sm" p="md">
                No contents recorded for this pallet.
            </Text>
        );
    }

    const rows = contents.map((item) => (
        <Table.Tr key={`${item.inventory_id}-${item.SKU}`}>
            <Table.Td>
                <Text size="sm">{item.title}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="xs">{item.SKU}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{item.amount}</Text>
            </Table.Td>
            <Table.Td>
                <Flex>
                    <NumberInput
                        size='sm'
                        value={item.restockAmount ?? 0}
                        min={0} max={item.amount}
                        onChange={(value) =>
                            updateRestockAmount(item.inventory_id, typeof value === 'string' ? 0 : value)
                        }
                    />
                    <StatusIcon row={item} />
                </Flex>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Box p="sm">
            <Table
                withColumnBorders
                withTableBorder
                highlightOnHover
                striped
                verticalSpacing="xs"
                fz="sm"
            >
                <Table.Thead >
                    <Table.Tr>
                        <Table.Th w={'35%'}>Item</Table.Th>
                        <Table.Th w={'30%'}>SKU</Table.Th>
                        <Table.Th w={'15%'}>Quantity</Table.Th>
                        <Table.Th w={'20%'}>Restock</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Box>
    );
}

// ---------------------------------------------------------------------------

/**
 * Props for {@link PalletRow}.
 */
interface PalletRowProps {
    /** A single pallet object to render as an expandable row. */
    pallet: BasePallet;
    transferResults: TransferResults | undefined;
    updateRestockAmount: (inventory_id: string | number, amount: number) => void;
}

/**
 * Renders a single pallet as a table row that expands to reveal
 * a {@link PalletContentsTable}.
 *
 * @param {PalletRowProps} props
 * @returns {JSX.Element}
 */
function PalletRow({ pallet, transferResults, updateRestockAmount }: PalletRowProps) {

    const favoriteImage =
        pallet.images?.favorite ?? pallet.images?.urls[0] ?? null;

    return (
        <>
            {/* ── Primary row ─────────────────────────────────────── */}
            <Table.Tr
            >
                {/* Thumbnail */}
                <Table.Td w={'10%'}>
                    {favoriteImage ? (
                        <Tooltip label="Favorite image">
                            <Image
                                src={favoriteImage}
                                alt={pallet.title}
                                w={48}
                                h={48}
                                radius="sm"
                                fit="cover"
                            />
                        </Tooltip>
                    ) : (
                        <IconPackage size={32} color="gray" />
                    )}
                </Table.Td>

                {/* Title */}
                <Table.Td w={'25%'}>
                    <Text size="sm" fw={600}>
                        {pallet.title}
                    </Text>
                </Table.Td>

                {/* Description */}
                <Table.Td w={'45%'}>
                    <Text size="sm" lineClamp={2} maw={260}>
                        {pallet.description}
                    </Text>
                </Table.Td>

                {/* Location / Lot */}
                <Table.Td w={'20%'}>
                    <Text size="sm" fw={500}>
                        {`${pallet.location}`}
                    </Text>
                </Table.Td>
            </Table.Tr>

            <Table.Tr>
                {/* Span every column so the nested table stretches full width */}
                <Table.Td colSpan={4} p={0}>
                    <PalletContentsTable contents={pallet.contents} transferResults={transferResults} updateRestockAmount={updateRestockAmount} />
                </Table.Td>
            </Table.Tr>
        </>
    );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Props for {@link PalletTable}.
 */
export interface PalletTableProps {
    /** Array of pallets to display. */
    pallets: BasePallet[];
}

/**
 * Renders a full-width table of {@link BasePallet} objects.
 * Each row can be expanded to reveal a nested {@link PalletContentsTable}.
 *
 * @example
 * ```tsx
 * <PalletTable pallets={myPallets} />
 * ```
 *
 * @param {PalletTableProps} props
 * @returns {JSX.Element}
 */
export function RestockPallet({ handleClose }: { handleClose?: () => void }): JSX.Element {
    const { update: updatePallet } = useResourceData<BasePallet[]>("palletInventory");
    const { data } = useResourceData<BulkInventoryItem[]>("inventory");


    const {
        rowSelections,
        restockContents,
        palletRestockList,
        setPalletRestockList,
        updateRestockAmount,
        transferResults,
        transferResultsColor,
        setTransferResults,
        transferDisabled,
        locations,
        removeItem,
    } = useTransferPalletContents({ db: 'Inventory', type: 'pallet', restock: true });

    console.log(rowSelections)
    console.log(palletRestockList)
    console.log(warehouseLocations(locations))

    const handleRestockOfItems = () => {

    }
    if (!palletRestockList || palletRestockList.length === 0) {
        return (
            <Paper withBorder p="xl" radius="md">
                <Group justify="center" gap="sm">
                    <IconPackage size={32} color="gray" />
                    <Text c="dimmed">No pallets found.</Text>
                </Group>
            </Paper>
        );
    }

    return (
        <Stack>
            {/* <Paper withBorder radius="md" style={{ overflow: 'hidden' }}> */}

            <Grid mb="0" pb="0">
                <Grid.Col span={6}>
                    <Title order={4}>{`${palletRestockList.length} pallet(s) selected`}</Title>
                </Grid.Col>
                <Grid.Col span={3}>
                    {transferResults === undefined ?
                        <Button
                            w="100%"
                            disabled={transferDisabled()}
                            rightSection={<IconForklift size={18} />}
                            // mt="1.5rem"
                            onClick={() => handleRestockOfItems()}
                        >
                            Restock Items
                        </Button>
                        :
                        <Button
                            w="100%"
                            variant='light'
                            color={transferResultsColor()}
                            // mt="1.5rem"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    }
                </Grid.Col>
            </Grid>
            <Table
                // withColumnBorders
                // withTableBorder
                withRowBorders={false}
                highlightOnHover={false}
                verticalSpacing="sm"
                stickyHeader
            >
                <Table.Tbody>
                    {palletRestockList.map((pallet) => (
                        <PalletRow key={pallet._id} pallet={pallet} transferResults={transferResults} updateRestockAmount={updateRestockAmount} />
                    ))}
                </Table.Tbody>
            </Table>
            {/* </Paper> */}
        </Stack>
    );
}
