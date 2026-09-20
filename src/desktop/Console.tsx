import { useState } from 'react';
import { useUAL } from '../umbrella/UALProvider';
import { StatusMessage } from './StatusMessage';

export function runCommand(input: string, token: string | null): string {
  if (!token) return 'Auth required';
  return input.trim() ? `Command queued: ${input.trim()}` : 'Enter a command';
}

export function Console(): JSX.Element {
  const { state } = useUAL();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  return <article><h2>Console</h2><StatusMessage /><form onSubmit={(event) => { event.preventDefault(); setOutput(runCommand(input, state.token)); }}><input value={input} onChange={(event) => setInput(event.target.value)} aria-label="Command" /><button type="submit">Run</button></form><output>{output}</output></article>;
}
