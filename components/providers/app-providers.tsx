'use client';

import { ReactNode, Suspense } from 'react';
import AuthSessionProvider from './session-provider';
import I18nProvider from './i18n-provider';
import ThemeProvider from './theme-provider';
import { DeviceProvider } from '@/contexts/device-context';
import { TreeProvider } from '@/contexts/tree-context';

interface AppProvidersProps {
  children: ReactNode;
}

function ProvidersLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-400 dark:border-gray-700 dark:border-t-green-400" />
    </div>
  );
}

/**
 * Combines all app-level providers into a single component
 * This simplifies the layout and makes provider management easier
 */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthSessionProvider>
          <DeviceProvider>
            <Suspense fallback={<ProvidersLoadingFallback />}>
              <TreeProvider>{children}</TreeProvider>
            </Suspense>
          </DeviceProvider>
        </AuthSessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

