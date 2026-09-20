export function createWindowManager() {
  let windows = [];
  let listeners = [];

  function notify() {
    listeners.forEach(fn => fn([...windows]));
  }

  return {
    subscribe(fn) {
      listeners.push(fn);
      fn([...windows]);
      return () => {
        listeners = listeners.filter(l => l !== fn);
      };
    },

    openWindow(appId, title) {
      const id = crypto.randomUUID();
      windows.push({ id, appId, title, x: 120, y: 120, w: 480, h: 360 });
      notify();
    },

    closeWindow(id) {
      windows = windows.filter(w => w.id !== id);
      notify();
    },

    moveWindow(id, x, y) {
      const w = windows.find(w => w.id === id);
      if (w) { w.x = x; w.y = y; notify(); }
    },

    resizeWindow(id, w2, h2) {
      const w = windows.find(w => w.id === id);
      if (w) { w.w = w2; w.h = h2; notify(); }
    }
  };
}
