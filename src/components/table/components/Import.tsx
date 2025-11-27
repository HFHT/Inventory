import classes from './../styles/Ribbon.module.css'
import { Center, Menu, Text } from "@mantine/core";
import { IconChevronDown, IconFileTypeCsv, IconUpload } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function Import({ label }: TableRibbonType) {
  return (
    <span className={classes.link}>
      <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
        <Menu.Target>
          <Center>
            <IconUpload size={14} />
            <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{label}</Text>
            <IconChevronDown size={14} stroke={1.5} />
          </Center>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconFileTypeCsv size={14} />}
          // onClick={(event) => { event.preventDefault(); onClick(item.label); item.callBack && item.callBack({ label: link.label, data: { ...table?.getFilteredRowModel().rows } }) }}
          >
            Csv
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </span>
  )
}



