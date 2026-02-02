import { useForm } from "@mantine/form";
import { imageActions, imageObj, LockChildFieldSet, SaveOrCancel } from "../../../components/form";
import { useDrawerStore, useLocations, useResourceData, useSelectedRowStore } from "../../../stores";
import { Divider, Grid, Image, ScrollArea, Stack, Table, Text, Textarea, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ImageCarousel } from "../../../components/carousel";
import { useScrollAreaHeight } from "../../../hooks";
import { ParcelSubdivisionSelect } from "../../parcels";
import type { ParcelInventoryType } from "../../../types/parcels";

export function EditParcelInventory() {
    const height = useScrollAreaHeight(480);
    /** Locations select options */
    const locations = useLocations();
    // const { data, update } = useResourceData<BulkInventoryItem[]>("inventory");
    const { data: parcelData, update: parcelUpdate } = useResourceData<ParcelInventoryType[]>("parcelInventory");

    const selectedRow = useSelectedRowStore((state) => state.selectedRow);

    console.log(selectedRow, parcelData)

    const { closeDrawer } = useDrawerStore();
    const row = parcelData?.find((p) => p._id === selectedRow?._id)
    if (!row) return <></>
    // const row = selectedRow as BasePallet
    const form = useForm<ParcelInventoryType>({
        mode: 'uncontrolled',
        initialValues: row,
        onValuesChange: (values) => {
            console.log(values)
        }
    })
    const saveForm = () => {
        console.log('save', form.getValues())
        parcelUpdate(form.getValues())
        closeDrawer()
    }

    return (
        <form className=''>
            <Grid grow justify='space-between' align='start'>
                <Grid.Col span={6}>
                    <Grid grow justify='space-between' align='start'>
                        <Grid.Col span={12}>
                            <LockChildFieldSet label='Parcel Location' lockText={undefined}>
                                <ParcelSubdivisionSelect locations={{
                                    from: null,
                                    to: form.getValues().subdivision_id,
                                    parcel: form.getValues().parcelLot,
                                    listOfLocations: locations
                                }}
                                    parcelData={parcelData}
                                    allowUpdate
                                    setToLocation={v => form.setFieldValue('subdivision_id', v)}
                                    setToParcel={v => form.setFieldValue('parcelLot', v)}
                                />
                            </LockChildFieldSet>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput label='Start Date' size='sm' clearable highlightToday key={(form.key('startDate'))} {...form.getInputProps('startDate')} />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput label='Completed' size='sm' clearable highlightToday key={(form.key('endDate'))} {...form.getInputProps('endDate')} />
                        </Grid.Col>
                    </Grid>


                </Grid.Col>
                <Grid.Col span={6}>
                    <Grid grow justify='space-between' align='start'>
                        <Grid.Col span={6}>
                            <LockChildFieldSet
                                label='Architecture'
                                lockText={
                                    <>
                                        <Text size='sm'>Updating this information should only be used to correct errors.</Text>
                                        <Text size='sm'>Changing this information will <b>not</b> update the Bill of Materials.</Text>
                                    </>
                                }

                            >
                                <TextInput label='Model' key={(form.key('architecture.model'))} {...form.getInputProps('architecture.model')} />
                                <TextInput label='Variant' key={(form.key('architecture.variant'))} {...form.getInputProps('architecture.variant')} />
                                {/* <TextInput label='Elevation' /> */}
                            </LockChildFieldSet>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Stack gap={'xs'}>
                                <SaveOrCancel
                                    onSave={saveForm}
                                    onCancel={closeDrawer}
                                />
                                <Image src={imageObj(form).favorite} h={120} w='auto' fit='contain' fallbackSrc='https://hfhtdev.blob.core.windows.net/production/brokenImage.jpg' />
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
            <Textarea size='sm' placeholder='notes....' autosize minRows={1} label='Notes'
                key={(form.key('notes'))}
                {...form.getInputProps('notes')} />

            {/* <Divider mt={10} mb={6} size='sm' labelPosition='left'
                label={<Text size='sm'>Contents</Text>}
            /> */}
            <ScrollArea h={height} pr='md'>
                <LockChildFieldSet label='Contents' lockText={undefined}>

                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Title</Table.Th>
                                <Table.Th>Required</Table.Th>
                                <Table.Th>Actual</Table.Th>
                                <Table.Th>Need</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.getValues().billOfMaterial.map((item) =>
                            (
                                <Table.Tr key={`${item.inventory_id}`}>
                                    <Table.Td>{item.title}</Table.Td>
                                    <Table.Td>{item.required}</Table.Td>
                                    <Table.Td>{item.actual}</Table.Td>
                                    <Table.Td>
                                        {item.required - item.actual}
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
        </form >
    )
}
