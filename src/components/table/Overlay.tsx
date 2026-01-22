import { Modal } from "@mantine/core";
import type { ReactNode } from "react";

interface OverlayProps {
    opened: boolean;
    close: () => void;
    title: string | null | undefined;
    children: ReactNode | undefined;
}

export function Overlay({ opened, close, title, children }: OverlayProps) {
    if (!children) return <></>
    return (
        <Modal opened={opened} onClose={close} title={title} size='xl' closeOnClickOutside={false}>
            {children}
        </Modal>
    )
}
