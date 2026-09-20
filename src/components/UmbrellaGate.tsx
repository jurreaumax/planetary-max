import React from 'react';
import { useUAL } from '../umbrella/UALProvider';
import { LoginModal } from './LoginModal';
import { OfflineScreen } from './OfflineScreen';

export const UmbrellaGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, setToken } = useUAL();
  if (!state.token || !state.sessionValid) return <LoginModal onSave={setToken} />;
  if (!state.workerOnline) return <OfflineScreen />;
  return <>{children}</>;
};

export default UmbrellaGate;
