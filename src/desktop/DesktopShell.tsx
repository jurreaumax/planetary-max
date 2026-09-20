import { useUAL } from '../umbrella/UALProvider';
import { Dashboard } from './Dashboard';
import { IdentityViewer } from './IdentityViewer';
import { Console } from './Console';
import { BeeSim } from './BeeSim';

export function DesktopShell(): JSX.Element {
  const { state } = useUAL();
  return (
    <main>
      <header><h1>Portal OS</h1><p>Worker online</p></header>
      <section aria-label="Dashboard"><Dashboard /></section>
      <section aria-label="Identity"><IdentityViewer /></section>
      <section aria-label="Console"><Console /></section>
      <section aria-label="Bee simulation"><BeeSim /></section>
      <details><summary>UAL state</summary><pre>{JSON.stringify(state, null, 2)}</pre></details>
    </main>
  );
}

export default DesktopShell;
