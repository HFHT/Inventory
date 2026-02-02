import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import classes from './styles/App.module.css'
import { AppLayout } from './layouts';
import PageManager from './components/app/PageManager';
import { navStructure } from './layouts/navigation/NavStructure';
import { useFetchSettings } from './stores';
import { useEffect } from 'react';

export function App() {
  const fetchSettings = useFetchSettings();
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  return (
    <AppLayout navStructure={navStructure}>
      <div className={classes.disabledInput}>
        <PageManager />
      </div>
    </AppLayout >
  );
}
