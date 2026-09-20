import { useUAL } from '../umbrella/UALProvider';
import { StatusMessage } from './StatusMessage';

export function Dashboard(): JSX.Element {
  const { state } = useUAL();
  return <article><h2>Dashboard</h2><StatusMessage /><pre>{JSON.stringify({ identity: state.identity, kernel: state.kernel, umbrella: state.umbrella }, null, 2)}</pre></article>;
}
