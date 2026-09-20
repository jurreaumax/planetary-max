import React from 'react';
import { useUAL } from '../umbrella/UALProvider';

export const IdentityViewer: React.FC = () => {
  const { state } = useUAL();
  if (!state.identity) return <div style={{ color: '#9CA3AF' }}>Loading identity…</div>;
  return <div><h3 style={{ marginBottom: 8 }}>Identity License</h3><pre style={{ background: '#111827', color: '#E5E7EB', padding: 12, borderRadius: 8, maxHeight: 260, overflow: 'auto' }}>{JSON.stringify(state.identity, null, 2)}</pre></div>;
};
