import React from 'react';
import { useUAL } from '../umbrella/UALProvider';

export const Dashboard: React.FC = () => {
  const { state } = useUAL();
  return <div><h3 style={{ marginBottom: 8 }}>Portal-OS Dashboard</h3><ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}><li>Worker: {state.workerOnline ? 'online' : 'offline'}</li><li>Session: {state.sessionValid ? 'valid' : 'invalid'}</li><li>Identity status: {String(state.identity?.status ?? 'unknown')}</li><li>Kernel state: {String(state.kernel?.state ?? 'unknown')}</li><li>Umbrella state: {String(state.umbrella?.state ?? 'unknown')}</li></ul></div>;
};
