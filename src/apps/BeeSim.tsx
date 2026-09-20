import React from 'react';
import { useUAL } from '../umbrella/UALProvider';

export const BeeSimApp: React.FC = () => {
  const { state } = useUAL();
  if (!state.sim) return <div style={{ color: '#9CA3AF' }}>Loading BeeSim…</div>;
  return <div><h3 style={{ marginBottom: 8 }}>Bee Simulation</h3><pre style={{ background: '#111827', color: '#E5E7EB', padding: 12, borderRadius: 8, maxHeight: 260, overflow: 'auto' }}>{JSON.stringify(state.sim, null, 2)}</pre></div>;
};
