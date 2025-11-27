import classes from './styles/Ribbon.module.css'
import { Container, Group } from "@mantine/core";
import type { JSX } from "react";
import { useTheme } from '../../hooks';
import { Add, EmptySlot, Export, Filter, Grid, Import, Refresh, UndoRedo } from './components';
import type { RibbonProps } from './types';

export function Ribbon({
    pagedRows,
    addRow,
    controls
}: RibbonProps): JSX.Element | null {
    const { isSmallScreen } = useTheme()
    const readOnly = false;
    console.log(controls, pagedRows)
    return (
        <header className={classes.header}>
            <Container fluid className={classes.container}>
                <div className={classes.inner}>
                    <Group gap={isSmallScreen ? 0 : 5} >
                        {/* {items} */}
                        {controls.add && <Add label='Add' />}
                        {controls.grid && (readOnly ? <EmptySlot /> : <Grid label='Grid' />)}
                        {controls.undoRedo && <UndoRedo />}
                        {controls.refresh && <Refresh label='Refresh' />}
                        {controls.export && <Export label='Export' />}
                        {controls.import && (readOnly ? <EmptySlot /> : <Import label='Import' />)}
                        {controls.filter && <Filter label='Filter' />}
                    </Group>
                </div>
            </Container>
        </header>)
}