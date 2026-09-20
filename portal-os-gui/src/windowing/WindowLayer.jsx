import React from "react";

export default function WindowLayer({ windows, manager, renderApp }) {
  return (
    <div className="window-layer">
      {windows.map(w => (
        <div
          key={w.id}
          className="window"
          style={{
            left: w.x,
            top: w.y,
            width: w.w,
            height: w.h
          }}
        >
          <div className="window-titlebar">
            <span>{w.title}</span>
            <button onClick={() => manager.closeWindow(w.id)}>×</button>
          </div>
          <div className="window-content">
            {renderApp(w.appId)}
          </div>
        </div>
      ))}
    </div>
  );
}
