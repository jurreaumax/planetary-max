import React from 'react';
import { useUAL } from '../umbrella/UALProvider';
export const BeeSimApp: React.FC = () => { const { state } = useUAL(); return <article><h2>BeeSim</h2><pre>{JSON.stringify(state.sim, null, 2)}</pre></article>; };
