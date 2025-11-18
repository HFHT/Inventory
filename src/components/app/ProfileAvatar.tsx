import { Avatar, Loader, Tooltip, type MantineSize } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { useAzureUser } from "../auth/context/AzureContext";

// Helper for initials (from name/email)
function getInitials(name?: string, email?: string) {
    if (!name && !email) return "";
    const str = name || email || "";
    const parts = str.split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}
interface ProfileAvatarProps {
    size?: number | string
    radius?: any
    visibleFrom?: MantineSize
}
export function ProfileAvatar({ size = "md", radius = "xl", visibleFrom = "md" }: ProfileAvatarProps) {
    const { name, username, photoUrl, isLoading } = useAzureUser()

    if (isLoading) {
        return (
            <Avatar size={size} radius={radius}>
                <Loader size="sm" />
            </Avatar>
        );
    }

    if (photoUrl) {
        return (
            <Tooltip label={name} >
                <Avatar src={photoUrl} size={size} radius={radius} />
            </Tooltip>
        )
    }

    // Fallback: show initials, or fallback icon if unavailable
    const initials = getInitials(name, username);
    return (
        <Avatar size={size} radius={radius} color="gray" hiddenFrom={visibleFrom}>
            {initials || <IconUser size="1.3em" />}
        </Avatar>
    );
}