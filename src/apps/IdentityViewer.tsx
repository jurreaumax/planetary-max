import React from 'react';
import { useUAL } from '../umbrella/UALProvider';
export const IdentityViewer: React.FC = () => { const { state } = useUAL(); return <article><h2>Identity</h2><pre>{JSON.stringify(state.identity, null, 2)}</pre></article>; };
