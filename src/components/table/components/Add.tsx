import classes from './../styles/Ribbon.module.css'
import { Button, Menu, Text } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
interface AddProps {
  label: string
}

export function Add({ label }: AddProps) {

  const handleClick = () => {
    // addRow()
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
