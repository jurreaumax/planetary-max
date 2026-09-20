import { useState, type FormEvent } from 'react';

export interface LoginModalProps {
  onSave: (token: string) => void;
}

export function LoginModal({ onSave }: LoginModalProps): JSX.Element {
  const [token, setToken] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = token.trim();
    if (value) onSave(value);
  };

  return (
    <form onSubmit={submit} role="dialog" aria-label="UMBRELLA ACCESS">
      <h1>UMBRELLA ACCESS</h1>
      <label>
        Bearer token
        <input type="password" value={token} onChange={(event) => setToken(event.target.value)} />
      </label>
      <button type="submit">Enter</button>
    </form>
  );
}

export default LoginModal;
