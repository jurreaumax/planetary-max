import { useUAL } from '../umbrella/UALProvider';

export function StatusMessage(): JSX.Element | null {
  const { state } = useUAL();
  if (!state.token) return <p role="alert">Auth required</p>;
  if (!state.sessionValid) return <p role="alert">Session invalid</p>;
  if (!state.workerOnline) return <p role="alert">Worker offline</p>;
  return null;
}
