import { Divider, Table, Text } from "@mantine/core";
import { useResourceData } from "../../../stores";
import type { ParcelInventoryType } from "../../../types/parcels";

interface ParcelInventoryProps {
  inventory_id: string | number
}

export function ParcelItemInventory({ inventory_id }: ParcelInventoryProps) {
  const { data } = useResourceData('parcelInventory')
  const parcels = data as unknown as ParcelInventoryType[] | undefined
  const activeParcels = parcels?.filter(p => p.active === true)

  const parcelsWithThisItem = activeParcels?.filter(parcel =>
    parcel.billOfMaterial.some(bom => bom.inventory_id === inventory_id)
  );

  console.log(parcelsWithThisItem)
  if (!parcelsWithThisItem || parcelsWithThisItem.length === 0) return <></>
  return (
    <>
      <Divider mt={10} mb={6} size='sm' labelPosition='left'
        label={<Text size='sm'>Inventory by Parcel</Text>}
      />
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Lot</Table.Th>
            <Table.Th>Current</Table.Th>
            <Table.Th>Desired</Table.Th>
            <Table.Th>Difference</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {parcelsWithThisItem.map((parcel) =>
            parcel.billOfMaterial
              .filter(b => b.inventory_id === inventory_id)
              .map((bom) => (
                <Table.Tr key={`${parcel._id}-${bom.inventory_id}`}>
                  <Table.Td>{parcel.parcelLot}</Table.Td>
                  <Table.Td>{bom.actual}</Table.Td>
                  <Table.Td>{bom.required}</Table.Td>
                  <Table.Td>{bom.actual - Number(bom.required)}</Table.Td>
                </Table.Tr>
              ))
          )}
        </Table.Tbody>
      </Table>
    </>
  );
}