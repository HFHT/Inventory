import classes from './../styles/Ribbon.module.css'
import { Center, Text } from "@mantine/core";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function UndoRedo({ undo, redo }: TableRibbonType) {
  return (<>
    <span className={classes.link}>
      <Center>
        <IconArrowBackUp size={14} color={undo ? 'blue' : undefined} />
        <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{'Undo'}</Text>
      </Center>
    </span>

    <span className={classes.link}>
      <Center>
        <IconArrowForwardUp size={14} color={redo ? 'blue' : undefined} />
        <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{'Redo'}</Text>
      </Center>
    </span>
  </>

  )
}

