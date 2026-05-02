import { useForm } from "@mantine/form";
import { imageActions, imageObj, LockChildFieldSet, SaveOrCancel } from "../../../components/form";
import { useDrawerStore, useResourceData, useSelectedRowStore } from "../../../stores";
import type { BasePallet, BulkInventoryItem } from "../../../types/construction";
import { Divider, Grid, Image, NumberInput, ScrollArea, Select, Table, Text, Textarea, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ImageCarousel } from "../../../components/carousel";
import { useScrollAreaHeight } from "../../../hooks";

export function EditPallet() {
  const height = useScrollAreaHeight(400);

  const { update: updatePallet } = useResourceData<BasePallet[]>("palletInventory");
  const { data } = useResourceData<BulkInventoryItem[]>("inventory");
  const selectedRow = useSelectedRowStore((state) => state.selectedRow);
  const { closeDrawer } = useDrawerStore();

  const row = selectedRow as BasePallet
  const form = useForm<BasePallet>({
    mode: 'uncontrolled',
    initialValues: row,
    onValuesChange: (values) => {
      console.log(values)
    }
  })
  const saveForm = () => {
    console.log('save', form.getValues())
    updatePallet(form.getValues())
    closeDrawer()
  }

  const availableInventory = (id: string | number, loc: string | undefined) => {
    if (!data) return null
    console.log(data)
    console.log(id, loc)
    const a = data.find((item) => item._id == id)
    if (!a) return 'not found'
    const q = a.quantity.byLocation.find((l) => l.loc === loc)
    return q?.qty === undefined ? 0 : q.qty
  }

  return (
    <form className=''>
      <Grid grow justify='space-between' align='center'>
        <Grid.Col span={1}>
          <Image src={imageObj(form).favorite} h={60} w='auto' fit='contain' fallbackSrc='https://hfhtdev.blob.core.windows.net/production/brokenImage.jpg' />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput label='Short Name' placeholder='(max 15 characters)' size='sm' withAsterisk key={(form.key('title'))} {...form.getInputProps('title')} />
        </Grid.Col>
        <Grid.Col span={2}>
          <Select label='Location' value={form.getValues().location} data={[form.getValues().location]} />
        </Grid.Col>
        <Grid.Col span={2}>
          <Select label='Lot' value={form.getValues().lot} data={[form.getValues().lot]} />
        </Grid.Col>
        <Grid.Col span={3}>
          <SaveOrCancel
            onSave={saveForm}
            onCancel={closeDrawer}
          />
        </Grid.Col>
      </Grid>
      <Grid grow justify='space-between' align='center' >
        <Grid.Col span={3}>
          <DateInput label='Created' size='sm' clearable highlightToday key={(form.key('dateCreated'))} {...form.getInputProps('dateCreated')} />
        </Grid.Col>
        <Grid.Col span={3}>
          <DateInput label='Shipped' size='sm' clearable highlightToday key={(form.key('dateShipped'))} {...form.getInputProps('dateShipped')} />
        </Grid.Col>
        <Grid.Col span={6}>
          <Textarea size='sm' placeholder='description....' autosize minRows={1} label='Description'
            key={(form.key('description'))}
            {...form.getInputProps('description')} />
        </Grid.Col>
      </Grid>
      <Divider mt={10} mb={6} size='sm' labelPosition='left'
        label={<Text size='sm'>Contents</Text>}
      />
      <ScrollArea h={height} pr='md'>
        <LockChildFieldSet label='Contents' lockText={undefined}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Available</Table.Th>
                <Table.Th style={{ width: '15%' }}>Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.getValues().contents.map((item) =>
              (
                <Table.Tr key={`${item.inventory_id}`}>
                  <Table.Td>{item.title}</Table.Td>
                  <Table.Td>{item.SKU}</Table.Td>
                  <Table.Td>{availableInventory(item.inventory_id, form.getValues().location)}</Table.Td>
                  <Table.Td>
                    <NumberInput value={item.amount} />
                  </Table.Td>
                </Table.Tr>
              )
              )}
            </Table.Tbody>
          </Table>
        </LockChildFieldSet>
        <Divider mt={10} mb={6} size='sm' labelPosition='left'
          label={<Text size='sm'>Images</Text>}
        />
        <ImageCarousel w={120}
          images={imageObj(form).urls}
          action={imageActions}
          open={true}
          hasChanged={false} buttonLocation="inline" withIndicators={false}
          hideActions
        // hideMenu 
        />
      </ScrollArea>
    </form>
  )
}
