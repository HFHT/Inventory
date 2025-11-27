import { useForm } from '@mantine/form'
import type { BulkInventoryItem } from "../../../types/construction";
import { Accordion, Divider, Grid, Image, Text, Textarea, TextInput } from '@mantine/core';
import { DependentNumberInputs, DependentSelect, imageActions, imageObj, QuantityGrid, SaveOrCancel } from '../../../components/form';
import { ImageCarousel } from '../../../components/carousel';
import { useCategories, useDrawerStore, useEditing, useResourceData, useSelectedRowStore } from '../../../stores';
import { ParcelInventory, ParcelTransfer, type ParcelTransferQtyTo } from '../parcels/components';
import { useEffect } from 'react';

// import type { ViewerDbTypes } from '../types';

export function EditItem() {
  const { update } = useResourceData<BulkInventoryItem[]>("inventory");

  const { data: parcelInventory, update: parcelUpdate } = useResourceData<BulkInventoryItem[]>("parcelInventory");
  const { isEditing, setIsEditing, toggleIsEditing } = useEditing();
  const selectedRow = useSelectedRowStore((state) => state.selectedRow);
  const { closeDrawer } = useDrawerStore();

  useEffect(() => {
    setIsEditing(true)
    return () => {
      // setIsEditing(false)
    }
  }, [])

  const categories = useCategories();
  console.log(parcelInventory);
  const row = selectedRow as BulkInventoryItem
  const form = useForm<BulkInventoryItem>({
    mode: 'uncontrolled',
    initialValues: row,
    onValuesChange: (values) => {
      console.log(values)
    }
  })

  const handleSelects = (selects: any) => {
    console.log(selects, form.getValues())
    form.setFieldValue('select.category', selects.category.catKey)
    form.setFieldValue('select.subCategory', selects.subMenu)
  }

  const handleTransfer = (e: ParcelTransferQtyTo) => {
    console.log(e)
  }

  const saveForm = () => {
    console.log('save', form.getValues())
    update(form.getValues())
  }

  const isNew = false;
  console.log('EditItem render', row, categories)
  return (
    <form className=''>
      <SaveOrCancel
        onSave={saveForm}
        onCancel={closeDrawer}
      />
      {isNew && <Text>New</Text>}
      <Grid grow justify='space-between' align='center' >
        <Grid.Col span={1}>
          <Image src={imageObj(form).favorite} h={60} w='auto' fit='contain' fallbackSrc='https://hfhtdev.blob.core.windows.net/production/brokenImage.jpg' />
        </Grid.Col>
        <Grid.Col span={10}>
          <TextInput label='Title' placeholder='' size='sm' withAsterisk key={(form.key('title'))} {...form.getInputProps('title')} />
        </Grid.Col>
      </Grid>
      <Grid grow justify='space-between' align='center' >
        <Grid.Col span={4}>
          <QuantityGrid values={form.getValues().quantity.byLocation} onChange={(e) => form.setFieldValue('quantity', e)} totalPosition='above' label='Quantity' />
        </Grid.Col>
        <Grid.Col span={8}>
          <DependentSelect categories={categories.constructionMenuItems} subMenuLabel='Type'
            initial={{ catKey: form.getValues().select.category, subMenu: form.getValues().select.subCategory }}
            onChange={(e) => handleSelects(e)}
          />
          <DependentNumberInputs warnLevels={{ ...form.getValues().warnLevels }}
            onChange={(e) => form.setFieldValue('warnLevels', e)}
          />
        </Grid.Col>
      </Grid>
      <Accordion >
        <Accordion.Item value='additionalInfo'>
          <Accordion.Control >
            Additional Information
          </Accordion.Control>
          <Accordion.Panel>
            <Textarea size='sm' placeholder='description....' autosize minRows={1} label='Description'
              key={(form.key('description'))}
              {...form.getInputProps('description')} />
            <Textarea size='sm' placeholder='barcodes seperated by commas....' autosize minRows={1} label='Barcodes'
              key={(form.key('$barcodes'))}
              {...form.getInputProps('$barcodes')}
            />
            <Textarea size='sm' placeholder='suppliers seperated by commas....' autosize minRows={1} label='Suppliers'
              key={(form.key('$suppliers'))}
              {...form.getInputProps('$suppliers')}
            />

            <ImageCarousel w={120}
              images={imageObj(form).urls}
              action={imageActions}
              open={true}
              hasChanged={false} buttonLocation="inline" withIndicators={false}
              hideActions
            // hideMenu 
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='parcels'>
          <Accordion.Control >
            Parcel Information
          </Accordion.Control>
          <Accordion.Panel>
            <Divider mt={-6} mb={6} size='sm' labelPosition='left'
              label={<Text size='sm'>Transfer Inventory to Parcel</Text>}
            />
            <ParcelTransfer inventory_id={form.getValues()._id} onTransfer={(e) => handleTransfer(e)} />

            <ParcelInventory inventory_id={form.getValues()._id} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </form>
  )
}


