import React, { useState } from 'react';

type WindowDef = { id: string; title: string; content: React.ReactNode };
type Props = { windows: WindowDef[] };

export const WindowManager: React.FC<Props> = ({ windows }) => {
  const [order, setOrder] = useState(() => windows.map((window) => window.id));
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => Object.fromEntries(windows.map((window, index) => [window.id, { x: 60 + index * 50, y: 80 + index * 40 }])));
  function bringToFront(id: string) { setOrder((previous) => [...previous.filter((item) => item !== id), id]); }
  function onDrag(id: string, dx: number, dy: number) { setPositions((previous) => { const current = previous[id] ?? { x: 60, y: 80 }; return { ...previous, [id]: { x: current.x + dx, y: current.y + dy } }; }); }
  return <>{order.map((id, index) => { const definition = windows.find((window) => window.id === id); if (!definition) return null; const position = positions[id] ?? { x: 60, y: 80 }; return <DraggableWindow key={id} title={definition.title} x={position.x} y={position.y} zIndex={20 + index} onFocus={() => bringToFront(id)} onMove={(dx, dy) => onDrag(id, dx, dy)}>{definition.content}</DraggableWindow>; })}</>;
};

type DraggableProps = { title: string; x: number; y: number; zIndex: number; onFocus: () => void; onMove: (dx: number, dy: number) => void; children: React.ReactNode };
const DraggableWindow: React.FC<DraggableProps> = ({ title, x, y, zIndex, onFocus, onMove, children }) => {
  const [dragging, setDragging] = useState(false);
  const [last, setLast] = useState<{ x: number; y: number } | null>(null);
  function handleMouseDown(event: React.MouseEvent) { setDragging(true); setLast({ x: event.clientX, y: event.clientY }); onFocus(); }
  function handleMouseMove(event: React.MouseEvent) { if (!dragging || !last) return; onMove(event.clientX - last.x, event.clientY - last.y); setLast({ x: event.clientX, y: event.clientY }); }
  function handleMouseUp() { setDragging(false); setLast(null); }
  return <div style={{ position: 'absolute', left: x, top: y, width: 380, maxWidth: '80vw', background: '#030712', borderRadius: 12, border: '1px solid #1F2937', boxShadow: '0 22px 48px rgba(0,0,0,0.65)', overflow: 'hidden', zIndex }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
    <div style={{ padding: '8px 12px', background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid #1F2937', cursor: 'grab', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseDown={handleMouseDown}><span>{title}</span><span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Portal-OS</span></div>
    <div style={{ padding: '12px 14px', background: '#020617', fontSize: '0.85rem' }}>{children}</div>
  </div>;
};
