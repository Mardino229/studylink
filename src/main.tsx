import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {UserContextProvider} from "./components/layout/userContextProvider.tsx";
import {Toaster} from "sonner";
import { HelmetProvider } from 'react-helmet-async';

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
