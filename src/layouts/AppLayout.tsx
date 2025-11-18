import { AppShell } from '@mantine/core';
import { Footer, Header } from '../components/app';
import { Notifications } from '@mantine/notifications';
import { useSyncIsMobileOrTablet } from '../hooks';
import { useNavigationStore, useThemeStore } from '../stores';
import { Navbar } from '../components/app/navigation/NavBar';
import { navStructure } from '../components/app/navigation/navStructure';

/**
 * AppShell layout with Header, Footer, and content slot.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
    useSyncIsMobileOrTablet();
    const { navbarOpened, toggleNavbar } = useNavigationStore();
    const { isMobileOrTablet, hiddenFrom } = useThemeStore()

    return (
        <>
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
                    <Header opened={navbarOpened} toggle={toggleNavbar} />
                </AppShell.Header>
                <AppShell.Navbar>
                    <Navbar navigationTree={navStructure} toggle={toggleNavbar} />
                </AppShell.Navbar>
                <AppShell.Main>
                    {children}
                </AppShell.Main>
                <AppShell.Footer>
                    <Footer />
                </AppShell.Footer>
            </AppShell>
        </>
    );
}