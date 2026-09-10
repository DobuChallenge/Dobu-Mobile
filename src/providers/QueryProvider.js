import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../api/queryClient';

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
