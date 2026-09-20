import type { ReactNode } from 'react';
import { LoginModal } from './LoginModal';
import { useUAL } from '../umbrella/UALProvider';

export interface UmbrellaGateProps {
  children: ReactNode;
  login?: ReactNode;
  offline?: ReactNode;
}

export function UmbrellaGate({ children, login, offline }: UmbrellaGateProps): JSX.Element {
  const { state, setToken } = useUAL();
  if (!state.token || !state.sessionValid) {
    return <>{login ?? <LoginModal onSave={setToken} />}</>;
  }
  if (!state.workerOnline) {
    return <>{offline ?? <div role="alert">Worker offline</div>}</>;
  }
  return <>{children}</>;
}

export default UmbrellaGate;
