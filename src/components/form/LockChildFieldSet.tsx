import { ActionIcon, Fieldset, Flex, Stack, Text, Tooltip } from "@mantine/core"
import { IconLock, IconLockOpen2 } from "@tabler/icons-react"
import { useState, type ReactNode } from "react"

interface LockChildFieldSetProps {
    unlocked?: boolean,
    label: string | undefined,
    lockText?: ReactNode | string | undefined
    children: ReactNode
}

export function LockChildFieldSet({ label, unlocked = false, lockText, children }: LockChildFieldSetProps) {
    const [locked, setLocked] = useState(!unlocked)
    const LockedText = () => {
        if (!locked) return <Text size='sm'>Lock the information.</Text>
        return <>
            <Stack gap={0} justify='center' align='center'>
                <Text size='sm'><b>Important Note:</b></Text>
                {lockText ?
                    lockText :
                    <>
                        <Text size='sm'>Updating this information should only be used to correct errors.</Text>
                        <Text size='sm'>Use the Transfer or Palletize actions to move items from one location to another.</Text>
                    </>
                }
            </Stack>
        </>
    }
    return (
        <Stack gap={0}>
            <Flex>
                {label && (
                    <Text mt="xs" ml='xs' fw={500} size="sm">
                        {label}
                    </Text>
                )}
                <Tooltip label={<LockedText />}>
                    <ActionIcon variant='transparent' mt={6} onClick={() => setLocked(!locked)}>
                        {locked ?
                            <IconLock size={18} />
                            :
                            <IconLockOpen2 size={18} />
                        }
                    </ActionIcon>
                </Tooltip>
            </Flex>
            <Fieldset disabled={locked} p='xs'>
                {children}
            </Fieldset>
        </Stack>
    )
}
