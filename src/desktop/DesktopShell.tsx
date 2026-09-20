import { useUAL } from '../umbrella/UALProvider';

export function DesktopShell(): JSX.Element {
  const { state } = useUAL();
  return <main><h1>Portal OS</h1><p>Worker online. Identity, kernel, umbrella, and SIM state are synchronized.</p><pre>{JSON.stringify({ identity: state.identity, kernel: state.kernel, umbrella: state.umbrella, sim: state.sim }, null, 2)}</pre></main>;
}

export default DesktopShell;
