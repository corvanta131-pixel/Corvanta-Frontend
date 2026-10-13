import { QueryClientProvider, queryClient, ReactQueryDevtools } from '../../queryClient';
import { Provider } from 'react-redux';
import { store } from '../../store';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="top-right" closeButton />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </Provider>
  );
}
