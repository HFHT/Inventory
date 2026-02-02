import classes from './../styles/Ribbon.module.css'
import { Button, Menu, Text } from "@mantine/core";
import { IconHomePlus } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function StartParcel({ label, onClick }: TableRibbonType) {
    const handleClick = () => {
        console.log('click')
        onClick && onClick()
    }
    return (
        <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal >
            <Menu.Target >
                <span className={classes.link}>
                    <Button leftSection={<IconHomePlus size={20} />} onClick={() => handleClick()}>
                        <Text size='sm' visibleFrom='sm'>{label}</Text>
                    </Button>
                </span>
            </Menu.Target>
        </Menu>
    )
}
