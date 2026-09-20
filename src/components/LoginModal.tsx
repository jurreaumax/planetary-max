import React, { useState } from 'react';

type Props = { onSave: (token: string) => void };

export const LoginModal: React.FC<Props> = ({ onSave }) => {
  const [token, setToken] = useState('');
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = token.trim();
    if (trimmed) onSave(trimmed);
  }
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000 }}>
      <div style={{ width: 360, maxWidth: '90vw', background: '#020617', borderRadius: 12, padding: '20px 22px', boxShadow: '0 18px 40px rgba(0,0,0,0.6)', border: '1px solid #1F2937', color: '#F9FAFB' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Umbrella Access</h2>
        <p style={{ marginTop: 8, marginBottom: 16, fontSize: '0.85rem', color: '#9CA3AF' }}>Sign in to Portal-OS. Enter your Bearer token to connect to the Worker.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4, color: '#D1D5DB' }}>Bearer token</label>
          <input type="text" placeholder="Bearer token" value={token} onChange={(event) => setToken(event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #374151', background: '#020617', color: '#F9FAFB', fontSize: '0.8rem' }} />
          <button type="submit" style={{ marginTop: 14, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#F9FAFB', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Save token</button>
        </form>
      </div>
    </div>
  );
};
