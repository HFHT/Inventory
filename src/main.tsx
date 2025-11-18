import ReactDOM from 'react-dom/client';
import { Button, MantineProvider } from '@mantine/core';
import { theme } from './assets/theme';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate } from '@azure/msal-react';
import { PublicClientApplication, type Configuration } from '@azure/msal-browser';
import { GenericErrorFallback } from './components/Fallbacks';
import { App } from './App';
import { AzureContextProvider } from './components/auth';
import SignIn from './components/auth/SignIn';

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
  <MantineProvider
    theme={theme}
    forceColorScheme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
  >
    <ErrorBoundary FallbackComponent={GenericErrorFallback} onError={() => console.log('Top Level Error Boundary')}>
      <MsalProvider instance={pca}>
        <AuthenticatedTemplate>
          <AzureContextProvider >
            {/* <SettingsProvider>
          <DataProvider>
            <MainProvider >
              <CategoryProvider> */}
            <App />
            {/* </CategoryProvider>
            </MainProvider>
          </DataProvider>
        </SettingsProvider> */}
          </AzureContextProvider>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <SignIn />
        </UnauthenticatedTemplate>
      </MsalProvider>
    </ErrorBoundary>
  </MantineProvider>
);
