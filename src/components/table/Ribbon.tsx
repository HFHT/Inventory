import classes from './styles/Ribbon.module.css'
import { Container, Group } from "@mantine/core";
import { type JSX } from "react";
import { useTheme } from '../../hooks';
import { Add, EmptySlot, Export, Filter, Grid, Import, Palletize, Refresh, RestockPallet, StartParcel, Transfer, UndoRedo, UnloadPallet } from './components';
import type { RibbonProps } from './types';
import { InlineDialog } from '../display';
import { IconAdjustmentsExclamation } from '@tabler/icons-react';

export function Ribbon({
    pagedRows,
    emptyRow,
    checkbox,
    controls,
    reload,
    openDrawer,
    mode,
    setMode,
    setFilterValue,
    handleClose,
    handleToggleModal,
    modalButtonLabel
}: RibbonProps): JSX.Element | null {
    const { isSmallScreen } = useTheme()
    const readOnly = false;
    const buttonText = () => {
        return checkbox?.noneSelected ? '...none selected' : `${modalButtonLabel} ${checkbox?.numSelected} item(s)`
    }
    const handleTransferClick = (newTransferMode: any) => {
        console.log(mode, newTransferMode)
        setFilterValue(newTransferMode === 'restock' ? 'Chuck' : '')
        if (mode === newTransferMode || mode === null) {
            checkbox?.handleToggleCheckboxes()
        }
        /** Close the overlay if the same selection is made. */
        if (mode === newTransferMode) {
            setMode(null)
            setFilterValue('')
        } else {
            setMode(newTransferMode)
        }
    }
    const handleToggleOverlay = (newTransferMode: any) => {
        if (mode === newTransferMode) {
            setMode(null)
        } else {
            setMode(newTransferMode)
        }
        handleToggleModal()
    }
    // const handleClose = () => {
    //     checkbox?.handleToggleCheckboxes()
    //     clearSelectedRowIds()
    //     setMode(null)
    // }
    console.log(mode, controls, pagedRows, checkbox)
    return (
        <header className={classes.header}>
            <Container fluid className={classes.container}>
                <div className={classes.inner}>
                    <Group gap={isSmallScreen ? 0 : 5} >
                        {/* {items} */}
                        {controls.add && <Add label='Add' emptyRow={emptyRow} openDrawer={openDrawer} />}
                        {controls.start && <StartParcel label='Start Construction' onClick={() => handleTransferClick('startParcel')} />}
                        {controls.deviations && <><IconAdjustmentsExclamation /><div>Differences</div></>}
                        {controls.transfer && <Transfer label='Transfer' onClick={() => handleTransferClick('transfer')} />}
                        {controls.pallet && <Palletize label='Palletize' onClick={() => handleTransferClick('palletize')} />}
                        {controls.restock && <RestockPallet label='Restock' onClick={() => handleTransferClick('restock')} />}
                        {controls.unload && <UnloadPallet label='Unload' onClick={() => handleTransferClick('unload')} />}
                        {controls.grid && (readOnly ? <EmptySlot /> : <Grid label='Grid' />)}
                        {controls.undoRedo && <UndoRedo />}
                        {controls.refresh && <Refresh label='Refresh' reload={reload} />}
                        {controls.export && <Export label='Export' data={pagedRows} />}
                        {controls.import && (readOnly ? <EmptySlot /> : <Import label='Import' />)}
                        {controls.filter && <Filter label='Filter' />}
                    </Group>
                </div>
            </Container>
            {mode !== null &&
                <InlineDialog classes={classes} buttonText={buttonText()} title={mode}
                    checkbox={checkbox} handleClose={() => handleClose()} handleToggleModal={handleToggleModal}
                />
            }
        </header>
    )
}