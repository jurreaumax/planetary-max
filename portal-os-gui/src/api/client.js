export const API = {
  base: import.meta.env.VITE_API_BASE_URL,

  async get(path) {
    const res = await fetch(`${API.base}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API.base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} failed`);
    return res.json();
  }
};
