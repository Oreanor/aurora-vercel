'use client';

import { ReactNode, Suspense } from 'react';
import AuthSessionProvider from './session-provider';
import { DeviceProvider } from '@/contexts/device-context';
import { TreeProvider } from '@/contexts/tree-context';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combines all app-level providers into a single component
 * This simplifies the layout and makes provider management easier
 */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthSessionProvider>
      <DeviceProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <TreeProvider>
            {children}
          </TreeProvider>
        </Suspense>
      </DeviceProvider>
    </AuthSessionProvider>
  );
}

