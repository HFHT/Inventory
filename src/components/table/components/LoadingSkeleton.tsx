import { Skeleton } from "@mantine/core";

export function LoadingSkeleton() {
    return (
        <>
            <Skeleton height={120} mt={6} radius="md" />
            <Skeleton height={300} mt={16} radius="md" />
            <Skeleton height={40} mt={16} radius="md" />
        </>
    )
}
