import React from 'react';
import { UALProvider } from './umbrella/UALProvider';
import UmbrellaGate from './components/UmbrellaGate';
import { DesktopShell } from './desktop/DesktopShell';

export const App: React.FC = () => (
  <UALProvider>
    <UmbrellaGate>
      <DesktopShell />
    </UmbrellaGate>
  </UALProvider>
);
