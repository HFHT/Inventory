import { useForm } from '@mantine/form'
import type { BulkInventoryItem } from "../../../types/construction";
import { Accordion, Divider, Grid, Image, ScrollArea, Text, Textarea, TextInput } from '@mantine/core';
import { DependentNumberInputs, DependentSelect, imageActions, imageObj, QuantityGrid, SaveOrCancel } from '../../../components/form';
import { ImageCarousel } from '../../../components/carousel';
import { useCategories, useDrawerStore, useEditing, useResourceData, useSelectedRowStore } from '../../../stores';
import { ParcelInventory, ParcelTransfer, type ParcelTransferQtyTo } from '../parcels/components';
import { useEffect } from 'react';
import { useScrollAreaHeight } from '../../../hooks';

// import type { ViewerDbTypes } from '../types';

export function EditItem() {
  const height = useScrollAreaHeight(200);

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

  const saveForm = () => {
    console.log('save', form.getValues())
    update(form.getValues())
  }

  const isNew = false;
  console.log('EditItem render', row, categories)
  return (
    <form className=''>
      {isNew && <Text>New</Text>}
      <Grid grow justify='space-between' align='center' >
        <Grid.Col span={1}>
          <Image src={imageObj(form).favorite} h={60} w='auto' fit='contain' fallbackSrc='https://hfhtdev.blob.core.windows.net/production/brokenImage.jpg' />
        </Grid.Col>
        <Grid.Col span={7}>
          <TextInput label='Title' placeholder='' size='sm' withAsterisk key={(form.key('title'))} {...form.getInputProps('title')} />
        </Grid.Col>
        <Grid.Col span={3}>
          <SaveOrCancel
            onSave={saveForm}
            onCancel={closeDrawer}
          />
        </Grid.Col>
      </Grid>
      <ScrollArea h={height} scrollbars="y"  pr='md'>
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

            <Textarea size='sm' placeholder='barcodes seperated by commas....' autosize minRows={1} label='Barcodes'
              key={(form.key('$barcodes'))}
              {...form.getInputProps('$barcodes')}
            />
            <Textarea size='sm' placeholder='suppliers seperated by commas....' autosize minRows={1} label='Suppliers'
              key={(form.key('$suppliers'))}
              {...form.getInputProps('$suppliers')}
            />
          </Grid.Col>
        </Grid>
        <Textarea size='sm' placeholder='description....' autosize minRows={1} label='Description'
          key={(form.key('description'))}
          {...form.getInputProps('description')} />
        <ParcelInventory inventory_id={form.getValues()._id} />
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


