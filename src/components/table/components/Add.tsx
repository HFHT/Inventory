import classes from './../styles/Ribbon.module.css'
import { Button, Menu, Text } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
import { useSelectedRowStore } from '../../../stores';
interface AddProps {
  label: string;
  emptyRow: any;
  openDrawer: () => void;
}

export function Add({ label, emptyRow, openDrawer }: AddProps) {
  const setSelectedRow = useSelectedRowStore((state) => state.setSelectedRow);

  const handleClick = () => {
    openDrawer()
    setSelectedRow({ ...emptyRow })
  }
  return (
    <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal >
      <Menu.Target >
        <span className={classes.link}>
          <Button leftSection={<IconCirclePlus size={20} />} onClick={() => handleClick()}>
            <Text size='sm' visibleFrom='sm'>{label}</Text>
          </Button>
        </span>
      </Menu.Target>
    </Menu>
  )
}
