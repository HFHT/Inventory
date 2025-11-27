import classes from './../styles/Ribbon.module.css'
import { Center, Text } from "@mantine/core";
import { IconGrid4x4 } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function Grid({ label }: TableRibbonType) {
  // const { grid, toggleGrid } = useTableGrid()
  const grid = false;
  return (
    <span className={grid ? classes.linkSelected : classes.link} onClick={() => console.log('click')/*toggleGrid()*/} >
      <Center>
        <IconGrid4x4 size={14} />
        <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{label}</Text>
      </Center>
    </span>
  )
}
