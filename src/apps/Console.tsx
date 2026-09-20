import React, { useState } from 'react';
import { useUAL } from '../umbrella/UALProvider';
export function runCommand(input: string, token: string | null): string { if (!token) return 'Auth required'; return input.trim() ? `Command queued: ${input.trim()}` : 'Enter a command'; }
export const ConsoleApp: React.FC = () => { const { state } = useUAL(); const [input, setInput] = useState(''); const [output, setOutput] = useState(''); return <article><h2>Console</h2><form onSubmit={(event) => { event.preventDefault(); setOutput(runCommand(input, state.token)); }}><input aria-label="Command" value={input} onChange={(event) => setInput(event.target.value)} /><button type="submit">Run</button></form><output>{output}</output></article>; };
