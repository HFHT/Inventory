import { Divider, NavLink, ScrollArea, Stack } from "@mantine/core";
import { useNavigationStore, type NavItem} from "../../../stores";

interface MainNavbarProps {
    navigationTree: NavItem[]
    navHeight: number
    toggle: () => void
}
export function Navbar({ navigationTree, navHeight, toggle }: MainNavbarProps) {
    const { navigation, setNavigation } = useNavigationStore();
    const handleNavClick = (selected: NavItem) => {
        setNavigation((prev: any) => ({ ...prev, page: selected.page, filter: selected.filter, key: selected.key }));
        toggle()
    };

    return (
        <ScrollArea h={navHeight}>
            <Stack gap="xs">
                {navigationTree.map((item) =>
                    item.children ? (
                        <NavLink key={item.label} label={item.label} childrenOffset={12}>
                            {item.children.map((child: any) => (
                                <div key={child.label}>
                                    {child.section === true && <Divider />}
                                    <NavLink
                                        key={child.label}
                                        label={child.label}
                                        active={navigation.key === child.key}
                                        onClick={() => handleNavClick(child)}
                                    />
                                </div>
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
        </ScrollArea>
    );
}
