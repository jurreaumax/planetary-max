import React, { useState, useEffect } from "react";
import { createWindowManager } from "../windowing/WindowManager";
import WindowLayer from "../windowing/WindowLayer";
import Dock from "./Dock";
import "../windowing/window.css";

const manager = createWindowManager();

export default function Shell() {
  const [windows, setWindows] = useState([]);

  useEffect(() => {
    return manager.subscribe(setWindows);
  }, []);

  function launch(appId) {
    const titles = {
      dashboard: "Dashboard",
      identity: "Identity Viewer",
      console: "Console",
      beesim: "Bee Simulation"
    };
    manager.openWindow(appId, titles[appId] || "App");
  }

  return (
    <div className="desktop-shell">
      <Dock onLaunch={launch} openWindows={windows} />
      <WindowLayer
        windows={windows}
        manager={manager}
        renderApp={(id) => <div>{id} app</div>}
      />
    </div>
  );
}
