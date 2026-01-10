import { Button, CloseButton, Container, Text, Tooltip } from "@mantine/core";
import type { TableCheckbox } from "../table/types";
interface InlineDialogProps {
    classes: CSSModuleClasses;
    title: string;
    buttonText: string;
    checkbox: TableCheckbox | undefined;
    handleClose: () => void;
    handleToggleModal: () => void;
}
export function InlineDialog({ buttonText, checkbox, classes, handleClose, handleToggleModal, title }: InlineDialogProps) {
    return (
        <Container fluid className={classes.container}>
            <div className={classes.inner}>
                <Tooltip label='Close and Clear selections.' >
                    <CloseButton onClick={handleClose} />
                </Tooltip>
                <Text>Select items to {title}&nbsp;</Text>
                <Button variant='outline' disabled={checkbox?.noneSelected} onClick={handleToggleModal}>
                    {buttonText}
                </Button>
            </div>
        </Container>
    )
}
