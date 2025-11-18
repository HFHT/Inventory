import { Title as MantineTitle } from '@mantine/core';
export function Title({ children }: { children: React.ReactNode }) {
    return <MantineTitle order={4}>{children}</MantineTitle>;
}