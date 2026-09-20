import React from 'react';

export const OfflineScreen: React.FC = () => (
  <div style={{ width: '100vw', height: '100vh', background: '#020617', color: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
    <div style={{ padding: '22px 26px', borderRadius: 14, border: '1px solid #1F2937', background: '#030712', boxShadow: '0 22px 48px rgba(0,0,0,0.65)', maxWidth: 440, textAlign: 'center' }}>
      <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Portal-OS</h2>
      <p style={{ marginTop: 10, marginBottom: 6, fontSize: '0.9rem', color: '#9CA3AF' }}>Worker offline</p>
      <p style={{ marginTop: 6, fontSize: '0.8rem', color: '#6B7280' }}>The Umbrella Worker is currently unreachable. Check your deployment or try again shortly.</p>
    </div>
  </div>
);
