import classes from './../styles/Ribbon.module.css'
import { Center, Text } from "@mantine/core";
import { IconPackageExport } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';

export function UnloadPallet({ label, onClick, setTransferMode }: TableRibbonType) {
    const handleClick = () => {
        console.log('click')
        onClick && onClick()
        setTransferMode && setTransferMode('pallet')
    }
    return (
        <span className={classes.link} onClick={handleClick}>
            <Center>
                <IconPackageExport size={16} />
                <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{label}</Text>
            </Center>
        </span>
    )
}
