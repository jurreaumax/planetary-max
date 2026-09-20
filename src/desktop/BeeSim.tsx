import { useUAL } from '../umbrella/UALProvider';
import { StatusMessage } from './StatusMessage';

export function BeeSim(): JSX.Element {
  const { state } = useUAL();
  return <article><h2>BeeSim</h2><StatusMessage /><pre>{JSON.stringify(state.sim, null, 2)}</pre></article>;
}

export default BeeSim;
