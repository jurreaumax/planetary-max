import { FormEvent, useState } from 'react';
import { useUAL } from '../umbrella/UALProvider';

export interface LoginModalProps { onSave?: (token: string) => void; }

export function LoginModal({ onSave }: LoginModalProps): JSX.Element {
  const { setToken } = useUAL();
  const [token, setValue] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = token.trim();
    if (value) { setToken(value); onSave?.(value); }
  };
  return <form onSubmit={submit} role="dialog" aria-label="Login">
    <h1>UMBRELLA ACCESS</h1>
    <label>Bearer token<input type="password" value={token} onChange={(event) => setValue(event.target.value)} /></label>
    <button type="submit">Enter</button>
  </form>;
}

export default LoginModal;
