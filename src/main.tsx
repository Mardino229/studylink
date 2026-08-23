import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/index.ts'
import App from './App.tsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {UserContextProvider} from "./components/layout/userContextProvider.tsx";
import {Toaster} from "sonner";
import { HelmetProvider } from 'react-helmet-async';

const LANDING_DOMAIN = import.meta.env.VITE_LANDING_DOMAIN;
const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;
const LANDING_ROUTES = new Set(['/', '/about', '/privacy', '/terms']);

if (LANDING_DOMAIN && APP_DOMAIN) {
    const host = window.location.hostname;
    const { pathname, search } = window.location;
    const isLandingRoute = LANDING_ROUTES.has(pathname);
    if (host === LANDING_DOMAIN && !isLandingRoute) {
        window.location.replace(`https://${APP_DOMAIN}${pathname}${search}`);
    } else if (host === APP_DOMAIN && isLandingRoute) {
        window.location.replace(`https://${LANDING_DOMAIN}${pathname}${search}`);
    }
}

const helmetContext = {};
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(

  <StrictMode>
      <QueryClientProvider client={queryClient} >
          <UserContextProvider>
              <HelmetProvider context={helmetContext}>
                <App />
                <Toaster richColors position={"top-center"} />
              </HelmetProvider>
          </UserContextProvider>
      </QueryClientProvider>
  </StrictMode>,
)
