import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { UAL, ual as defaultUAL, type UALState } from './UAL';

interface UALContextValue {
  state: UALState;
  setToken: (token: string | null) => void;
  can: (permission: string) => boolean;
}

const UALContext = createContext<UALContextValue | null>(null);
const events = ['auth.changed', 'identity.updated', 'kernel.updated', 'umbrella.updated', 'sim.updated', 'health.updated', 'worker.online', 'worker.offline', 'session.expired'] as const;

export function UALProvider({ children, client = defaultUAL }: { children: ReactNode; client?: UAL }): JSX.Element {
  const [state, setState] = useState<UALState>(client.getState());
  useEffect(() => {
    const unsubscribe = events.map((event) => client.on(event, () => setState(client.getState())));
    client.startPolling();
    return () => { unsubscribe.forEach((off) => off()); client.stopPolling(); };
  }, [client]);
  const value = useMemo(() => ({ state, setToken: (token: string | null) => client.setToken(token), can: (permission: string) => client.can(permission) }), [client, state]);
  return <UALContext.Provider value={value}>{children}</UALContext.Provider>;
}

export function useUAL(): UALContextValue {
  const context = useContext(UALContext);
  if (!context) throw new Error('useUAL must be used inside UALProvider');
  return context;
}
