import type { ReactNode } from 'react';
import { useUAL } from '../umbrella/UALProvider';

export interface UmbrellaGateProps {
  children: ReactNode;
  login?: ReactNode;
  offline?: ReactNode;
}

/** Protects the desktop surface until authentication and the worker are ready. */
export function UmbrellaGate({ children, login, offline }: UmbrellaGateProps): JSX.Element {
  const { state } = useUAL();
  if (!state.token || !state.sessionValid) {
    return <>{login ?? <div role="dialog" aria-label="Login">Please sign in to Portal-OS.</div>}</>;
  }
  if (!state.workerOnline) {
    return <>{offline ?? <div role="alert">Portal-OS worker is offline.</div>}</>;
  }
  return <>{children}</>;
}

export default UmbrellaGate;
