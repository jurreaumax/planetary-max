import React from 'react';

export const OfflineScreen: React.FC = () => (
  <div style={{ width: '100vw', height: '100vh', background: '#020617', color: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
    <div style={{ padding: '18px 22px', borderRadius: 12, border: '1px solid #1F2937', background: '#030712', boxShadow: '0 18px 40px rgba(0,0,0,0.6)', maxWidth: 420, textAlign: 'center' }}>
      <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Portal-OS</h2>
      <p style={{ marginTop: 8, marginBottom: 4, fontSize: '0.85rem', color: '#9CA3AF' }}>Worker offline</p>
      <p style={{ marginTop: 4, fontSize: '0.8rem', color: '#6B7280' }}>The Umbrella Worker is currently unreachable. Check your deployment or try again in a few moments.</p>
    </div>
  </div>
);
