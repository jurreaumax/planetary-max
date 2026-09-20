import { useUAL } from '../umbrella/UALProvider';
import { StatusMessage } from './StatusMessage';

export function IdentityViewer(): JSX.Element {
  const { state } = useUAL();
  return <article><h2>Identity</h2><StatusMessage /><pre>{JSON.stringify(state.identity, null, 2)}</pre></article>;
}
