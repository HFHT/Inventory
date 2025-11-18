import { NavLink, Stack } from "@mantine/core";
import { useNavigationStore } from "../../../stores";
import type { NavItem, NavStructure } from "./types";

interface MainNavbarProps {
    navigationTree: NavStructure
    toggle: () => void
}
export function Navbar({ navigationTree, toggle }: MainNavbarProps) {
    const { navigation, setNavigation } = useNavigationStore();
    const handleNavClick = (selected: NavItem) => {
        setNavigation((prev: any) => ({ ...prev, page: selected.page, filter: selected.filter, key: selected.key }));
        toggle()
    };

    return (
        <Stack gap="xs">
            {navigationTree.map((item) =>
                item.children ? (
                    <NavLink key={item.label} label={item.label} childrenOffset={12}>
                        {item.children.map((child: any) => (
                            <NavLink
                                key={child.label}
                                label={child.label}
                                active={navigation.key === child.key}
                                onClick={() => handleNavClick(child)}
                            />
                        ))}
                    </NavLink>
                ) : (
                    <NavLink
                        key={item.label}
                        label={item.label}
                        active={navigation.key === item.key}
                        onClick={() => handleNavClick(item)}
                    />
                )
            )}
        </Stack>
    );
}
