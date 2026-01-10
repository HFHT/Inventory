import classes from './../styles/Ribbon.module.css'
import { Center, Text } from "@mantine/core";
import { IconTruck } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function Transfer({ label, onClick }: TableRibbonType) {
    const handleClick = () => {
        console.log('click')
        onClick && onClick()
    }
    return (
        <span className={classes.link} onClick={handleClick}>
            <Center>
                <IconTruck size={16} />
                <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{label}</Text>
            </Center>
        </span>
    )
}
