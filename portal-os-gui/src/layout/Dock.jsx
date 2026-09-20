import React from "react";

const apps = [
  { id: "dashboard", icon: "🏠" },
  { id: "identity", icon: "🧬" },
  { id: "console", icon: "⌨️" },
  { id: "beesim", icon: "🐝" }
];

export default function Dock({ onLaunch, openWindows }) {
  return (
    <div className="dock">
      {apps.map(app => {
        const isOpen = openWindows.some(w => w.appId === app.id);
        return (
          <button
            key={app.id}
            className={`dock-icon ${isOpen ? "open" : ""}`}
            onClick={() => onLaunch(app.id)}
          >
            <span>{app.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
