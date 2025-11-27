import classes from './../styles/Ribbon.module.css'
import { Center, Text } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function Refresh({ label }: TableRibbonType) {
  // const refresh = useTableDataRefresh()
  return (
    <span className={classes.link} onClick={() => /* refresh()*/console.log('click')}>
      <Center>
        <IconRefresh size={14} />
        <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{label}</Text>
      </Center>
    </span>
  )
}

