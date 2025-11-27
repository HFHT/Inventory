import classes from './../styles/Ribbon.module.css'
import { Center, Menu, Text } from "@mantine/core";
import { IconChevronDown, IconFilterOff, IconFilterPause, IconFilterFilled, IconFilter } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function Filter({ label }: TableRibbonType) {
  return (
    <span className={classes.link}>

      <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
        <Menu.Target>
          <Center>
            <IconFilterOff size={14} />
            <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{label}</Text>
            <IconChevronDown size={14} stroke={1.5} />
          </Center>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconFilterPause size={14} />}
          // onClick={(event) => { event.preventDefault(); onClick(item.label); item.callBack && item.callBack({ label: link.label, data: { ...table?.getFilteredRowModel().rows } }) }}
          >
            Filter 1
          </Menu.Item>
          <Menu.Item leftSection={<IconFilterPause size={14} />}
          // onClick={(event) => { event.preventDefault(); onClick(item.label); item.callBack && item.callBack({ label: link.label, data: { ...table?.getFilteredRowModel().rows } }) }}
          >
            Filter 2
          </Menu.Item>
          <Menu.Item leftSection={<IconFilterPause size={14} />}
          // onClick={(event) => { event.preventDefault(); onClick(item.label); item.callBack && item.callBack({ label: link.label, data: { ...table?.getFilteredRowModel().rows } }) }}
          >
            Filter 3
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </span>
  )
}


