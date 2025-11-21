import { AppShell } from '@mantine/core';
import { Footer, Header } from '../components/app';
import { Notifications } from '@mantine/notifications';
import { useSyncIsMobileOrTablet } from '../hooks';
import { useNavigationStore, useThemeStore, type NavItem } from '../stores';
import { Navbar } from '../components/app/navigation/NavBar';

/**
 * Props for the {@link AppLayout} component.
 * @typedef {Object} AppLayoutProps
 * @property {React.ReactNode} children - Content to be rendered within the layout.
 * @property {NavItem[]} navStructure - Navigation structure for the Navbar.
 */

/**
 * The main layout component for the application.
 * 
 * This component provides a structural shell for your app using Mantine's {@link AppShell}.
 * It includes the application header, footer, responsive navigation, notifications, and dynamic layout
 * adjustments for mobile and tablet devices.
 * 
 * @param {AppLayoutProps} props - Component props.
 * @returns {JSX.Element} The AppShell layout filled with header, navigation, content and footer.
 */
export function AppLayout({ children, navStructure }: { children: React.ReactNode, navStructure: NavItem[] }) {
    // Synchronizes theme/UI state for mobile/tablet detection.
    useSyncIsMobileOrTablet();
    
    // Navigation store for navbar opened state and toggling.
    const { navbarOpened, toggleNavbar } = useNavigationStore();
    
    // Theme store for responsive UI flags.
    const { isMobileOrTablet, hiddenFrom } = useThemeStore()

    return (
        <>
            {/* Mantine notifications positioned top-right */}
            <Notifications position="top-right" />
            <AppShell
                header={{ height: isMobileOrTablet ? 110 : 70 }}
                navbar={{
                    width: { base: 200, md: 220, lg: 240 },
                    breakpoint: hiddenFrom,
                    collapsed: { mobile: !navbarOpened },
                }}
                padding="md"
            >
                <AppShell.Header>
                    {/* Top app bar with menu toggle */}
                    <Header opened={navbarOpened} toggle={toggleNavbar} />
                </AppShell.Header>
                <AppShell.Navbar>
                    {/* Side navigation with dynamic navigation tree */}
                    <Navbar navigationTree={navStructure} toggle={toggleNavbar} />
                </AppShell.Navbar>
                <AppShell.Main>
                    {/* Main application content */}
                    {children}
                </AppShell.Main>
                <AppShell.Footer>
                    {/* Application footer */}
                    <Footer />
                </AppShell.Footer>
            </AppShell>
        </>
    );
}