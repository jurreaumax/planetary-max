import React from 'react';
import { useUAL } from '../umbrella/UALProvider';
import { WindowManager } from './WindowManager';
import { Dashboard } from '../apps/Dashboard';
import { IdentityViewer } from '../apps/IdentityViewer';
import { ConsoleApp } from '../apps/Console';
import { BeeSimApp } from '../apps/BeeSim';

export const DesktopShell: React.FC = () => {
  const { state } = useUAL();
  return <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(circle at top, #0F172A 0, #020617 55%, #000 100%)', color: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1F2937', background: 'rgba(15,23,42,0.85)', fontSize: '0.8rem' }}><span>Portal-OS</span><span style={{ color: '#9CA3AF' }}>Worker: {state.workerOnline ? 'online' : 'offline'} · Session: {state.sessionValid ? 'valid' : 'invalid'}</span></div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}><WindowManager windows={[{ id: 'dashboard', title: 'Dashboard', content: <Dashboard /> }, { id: 'identity', title: 'Identity', content: <IdentityViewer /> }, { id: 'console', title: 'Console', content: <ConsoleApp /> }, { id: 'beesim', title: 'BeeSim', content: <BeeSimApp /> }]} /></div>
  </div>;
};
