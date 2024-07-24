import { LofikProvider } from "@lofik/react";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Ideally we would use the LofikProvider in DashboardLayout.astro directly
// But the wrapper is needed because .astro files can't pass react components as props (understandable)
// Therefore we wouldn't be able to pass down the loader

// TODO: this might need another workaround because it seems the LofikProvider is initialized on SPA routing.. (always brief loading)

// There is another issue - we still can't use LofikProviderWrapper in DashboardLayout.astro
// If we do, we get: No QueryClient set, use QueryClientProvider to set one
// No idea why, probably.. https://github.com/TanStack/query/issues/3595
// Therefore the workaround is to wrap every page component with LofikProviderWrapper individually..

export const LofikProviderWrapper = ({ children }: Props) => (
  <LofikProvider
    loader={<div aria-busy="true" />}
    databaseInit={[
      "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
      "CREATE TABLE IF NOT EXISTS transactions (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', pubKeyHex TEXT NOT NULL, categoryId VARCHAR(40), deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
    ]}
    websocketServerUrl={import.meta.env.PUBLIC_WS_URL}
  >
    {children}
  </LofikProvider>
);
