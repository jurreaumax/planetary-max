import React, { useState } from 'react';
import { useUAL } from '../umbrella/UALProvider';

export const ConsoleApp: React.FC = () => {
  const { state } = useUAL();
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<Array<{ id: number; input: string; output: string; error?: boolean }>>([]);
  function handleSubmit(event: React.FormEvent) { event.preventDefault(); const command = input.trim(); if (!command) return; const output = state.token ? `Command queued: ${command}` : 'Auth required'; setEntries((previous) => [...previous, { id: Date.now(), input: command, output, error: !state.token }]); setInput(''); }
  return <div><h3 style={{ marginBottom: 8 }}>Umbrella Console</h3><div style={{ background: '#111827', color: '#E5E7EB', padding: 10, borderRadius: 8, height: 220, overflow: 'auto', marginBottom: 10, fontSize: '0.8rem' }}>{entries.map((entry) => <div key={entry.id} style={{ marginBottom: 8 }}><div style={{ color: '#9CA3AF' }}>$ {entry.input}</div><pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: entry.error ? '#F97373' : '#D1FAE5' }}>{entry.output}</pre></div>)}</div><form onSubmit={handleSubmit}><input type="text" placeholder="Type a command…" value={input} onChange={(event) => setInput(event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #374151', background: '#111827', color: '#F9FAFB', fontSize: '0.8rem' }} /></form></div>;
};
