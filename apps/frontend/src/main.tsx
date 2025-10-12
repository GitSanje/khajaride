import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { env } from "@/config/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/clerk-react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import router from './router.tsx';
import { RestaurantsDataProvider } from './hooks/use-restaturants.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
if (!env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const clerkPubKey = env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RestaurantsDataProvider>
      <ClerkProvider publishableKey={clerkPubKey}>

      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
           <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
    </RestaurantsDataProvider>
  </StrictMode>,
)
