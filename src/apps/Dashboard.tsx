import React from 'react';
import { useUAL } from '../umbrella/UALProvider';
const Status: React.FC = () => { const { state } = useUAL(); if (!state.token) return <p>Auth required</p>; if (!state.sessionValid) return <p>Session invalid</p>; if (!state.workerOnline) return <p>Worker offline</p>; return null; };
export const Dashboard: React.FC = () => { const { state } = useUAL(); return <article><h2>Dashboard</h2><Status /><pre>{JSON.stringify({ identity: state.identity, kernel: state.kernel, umbrella: state.umbrella }, null, 2)}</pre></article>; };
