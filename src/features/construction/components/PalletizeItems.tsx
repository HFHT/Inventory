import { Autocomplete, Button, Divider, Fieldset, Flex, Grid, Image, NumberInput, ScrollArea, Select, Table, Text, Textarea } from "@mantine/core";
import { DateInput } from '@mantine/dates';
import { usePalletizeItems } from "../hooks";
import { IconStackPush } from "@tabler/icons-react";
import { useScrollAreaHeight } from "../../../hooks/browser";
import { numberError } from "../../../utils";
import { imageObj } from "../../../components/form";
import { RowAmount, StatusIcon } from ".";
import type { BulkInventoryItem } from "../../../types/construction";

export function PalletizeItems({ handleClose }: { handleClose?: () => void }) {
  // Select pallet or new. If new then get a name and current location default to CHUCK. Once selected add the selected items.
  const height = useScrollAreaHeight(425);

  const {
    selects,
    rowSelections,
    setRowSKU,
    handleParcelSelectChange,
    handleTransferOfItems,
    rowQuantity,
    setFromLocation,
    setRowAmount,
    transferDisabled,
    removeItem,
    transferList,
    transferResults,
    transferResultsColor,
    selectedPalletName,
    setSelectedPalletName,
    selectedPallet,
    setSelectedPallet,
    havePalletInfo,
    onPalletQuantity,
    palletList,
    nextStep,
    duplicatePalletName,
    favoriteImage
  } = usePalletizeItems({ db: 'Inventory', type: 'inventory' });
  const theTransferList = transferList as BulkInventoryItem[]

  const ControlButton = () => {
    if (!havePalletInfo) {
      return <Button
        w="100%"
        disabled={selectedPalletName === '' || selects.locationOfInventory === null /*|| duplicatePalletName()*/}
        // rightSection={<IconTruck size={14} />}
        mt="1.5rem"
        onClick={nextStep}
      >
        Next
      </Button>
    }
    if (transferResults === undefined) {
      return <Button
        w="100%"
        disabled={transferDisabled() || selectedPallet.title === '' || selectedPallet.description === '' || selectedPallet.dateCreated === ''}
        rightSection={<IconStackPush size={14} />}
        mt="1.5rem"
        onClick={() => handleTransferOfItems()}
      >
        Transfer
      </Button>
    }
    return <Button
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

  const barcodeList = (row: BulkInventoryItem | undefined) => {
    if (!row || !row.barcodes) return ['(none)']
    return ['(none)', ...row.barcodes]
  }

  return (
    <>
      <Grid mb="0" pb="0">
        <Grid.Col span={1}>
          <Image src={favoriteImage} h={60} w='auto' fit='contain' fallbackSrc='https://hfhtdev.blob.core.windows.net/production/brokenImage.jpg' />
        </Grid.Col>
        <Grid.Col span={5}>
          <Autocomplete
            label="Select or Create a Pallet"
            placeholder="Select or Enter a name for a new pallet."
            data={palletList}
            // error={duplicatePalletName() ? 'Name exists' : false}
            // errorProps={{
            //   style: {
            //     marginTop: '-60px', // Moves the error up by 60px
            //     textAlign: 'right', // Aligns the error text to the right
            //   }
            // }}
            maxDropdownHeight={200}
            clearable
            onChange={(v) => setSelectedPalletName(v)}
          />
        </Grid.Col>
        <Grid.Col span={3} >
          <Select
            label="From"
            title="From"
            value={selects.locationOfInventory}
            disabled={selectedPalletName === ''}
            data={["Chuck", "Office"]}
            onChange={setFromLocation}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <ControlButton />
        </Grid.Col>
      </Grid>
      {havePalletInfo &&
        <Fieldset disabled={transferResults !== undefined}>
          <Textarea label='Pallet description' placeholder='...description'
            value={selectedPallet?.description}
            onChange={(e) => setSelectedPallet({ ...selectedPallet, description: e.currentTarget.value })}
          />
          <DateInput
            value={selectedPallet?.dateCreated}
            onChange={(v) => setSelectedPallet({ ...selectedPallet, dateCreated: v ?? '' })}
            clearable highlightToday
            label='Date created'
            placeholder='...Date'
          />
          <Divider label={<Text fw={700}>Items to transfer to pallet</Text>} size='sm' mt='sm' />
          <ScrollArea h={height}>
            {/* <Table.ScrollContainer minWidth={500} maxHeight={500} mt="xs"> */}
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
                  <Table.Th>SKU</Table.Th>
                  <Table.Th>On Pallet</Table.Th>
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
                            value={rowSelections[row._id].SKU || null}
                            data={barcodeList(row)}
                            onChange={val =>
                              setRowSKU(row._id, val ?? undefined)
                            }
                          />
                        </Table.Td>
                        <Table.Td>{onPalletQuantity(row)}</Table.Td>
                        <Table.Td>
                          <Flex>
                            <NumberInput
                              value={rowSelections[row._id].amount ?? ''}
                              min={0}
                              error={
                                numberError(rowSelections[row._id].amount, rowQuantity(row))
                              }
                              onChange={v => {
                                /* use this event to also update the row title */
                                setRowAmount(row._id, typeof v === "number" ? v : 0, row.title)
                                handleParcelSelectChange(row._id, 'pallet');
                              }}
                            />
                            <StatusIcon row={row} transferResults={transferResults} removeItem={() => removeItem(row._id)} />
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    ))
                )}
              </Table.Tbody>
            </Table>
            {/* </Table.ScrollContainer> */}
            <Divider label={<Text fw={700}>Items on the pallet</Text>} size='sm' mt='sm' />
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
                  <Table.Th>SKU</Table.Th>
                  <Table.Th>Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {selectedPallet.contents.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                      Empty
                    </Table.Td>
                  </Table.Tr>
                ) :
                  (
                    selectedPallet.contents.map((i) =>
                      <Table.Tr key={i.inventory_id} style={{ cursor: "pointer" }}>
                        <Table.Td>{i.title}</Table.Td>
                        <Table.Td>{i.SKU}</Table.Td>
                        <Table.Td>{i.amount}</Table.Td>
                      </Table.Tr>
                    )
                  )
                }
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Fieldset>
      }
    </>
  )
}
