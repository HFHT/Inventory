import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import { theme } from './assets/theme';
import { ErrorBoundary } from 'react-error-boundary';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, type Configuration } from '@azure/msal-browser';
import { GenericErrorFallback } from './components/Fallbacks';
import { CategoryProvider, DataProvider, MainProvider, SettingsProvider } from './context';

const configuration: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSALCLIENTID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AUTH}`,
    redirectUri: "/",
    postLogoutRedirectUri: "/",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  }
};
const pca = new PublicClientApplication(configuration);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme} forceColorScheme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}>
    <ErrorBoundary FallbackComponent={GenericErrorFallback} onError={() => console.log('Top Level Error Boundary')}>
      <MsalProvider instance={pca}>
        <SettingsProvider>
          <DataProvider>
            <MainProvider >
              <CategoryProvider>
                <App />
              </CategoryProvider>
            </MainProvider>
          </DataProvider>
        </SettingsProvider>
      </MsalProvider>
    </ErrorBoundary>
  </MantineProvider>
);
