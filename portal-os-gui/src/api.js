// ============================================================
// Portal‑OS GUI — Umbrella API Binding (Final, Complete)
// ============================================================

// Bind GUI → the API URL selected and validated by vite.config.js.
// Trailing slash is removed for safety.
export const API_BASE_URL = (typeof __PORTAL_API_BASE_URL__ === 'string' ? __PORTAL_API_BASE_URL__ : '').replace(
  /\/$/,
  ''
);

// Core physics lanes plus the 8 licensed product lanes (SET 1–4).
export const UMBRELLA_LANES = [
  {
    path: '/api/umbrella/identity',
    code: 'ID',
    title: 'Identity Layer',
    summary: 'Inspect the classified subject, role, and capabilities.',
  },
  {
    path: '/api/umbrella/governance',
    code: 'GV',
    title: 'Governance Physics',
    summary: 'Inspect permissions, constraints, and active rules.',
  },
  {
    path: '/api/umbrella/structural',
    code: 'ST',
    title: 'Structural Physics',
    summary: 'Inspect the OS, engine, and simulation structure.',
  },
  {
    path: '/api/umbrella/physics',
    code: 'PH',
    title: 'Umbrella Physics',
    summary: 'Inspect the active physics layers and enforcement mode.',
  },
  {
    path: '/api/umbrella/routing',
    code: 'RT',
    title: 'Routing Physics',
    summary: 'Inspect lane selection and envelope dispatch.',
  },
  {
    path: '/api/umbrella/identity/license',
    code: 'IL',
    title: 'Identity Physics',
    summary: 'Resolve identity signatures and stability curvature.',
  },
  {
    path: '/api/umbrella/governance/license',
    code: 'GL',
    title: 'Governance Engine',
    summary: 'Inspect structures, alignment, and collapse vectors.',
  },
  {
    path: '/api/umbrella/apex/advisory',
    code: 'AP',
    title: 'Apex Advisory',
    summary: 'Generate deterministic apex alignment guidance.',
  },
  {
    path: '/api/umbrella/sim/pack',
    code: 'SM',
    title: 'SIM Pack',
    summary: 'Compose licensed simulation products into one pack.',
  },
  {
    path: '/api/umbrella/market/forecast',
    code: 'MK',
    title: 'Market Forecast',
    summary: 'Project trends, volatility, and market risk.',
  },
  {
    path: '/api/umbrella/identity/mirror',
    code: 'MR',
    title: 'Identity Mirror',
    summary: 'Mirror behavior and structural identity truth.',
  },
  {
    path: '/api/umbrella/crossworld/access',
    code: 'CW',
    title: 'Crossworld Access',
    summary: 'Map licensed traversal across reachable worlds.',
  },
  {
    path: '/api/umbrella/structural/truth/license',
    code: 'SL',
    title: 'Structural Truth',
    summary: 'License structural evidence and contradiction vectors.',
  },
];

// ============================================================
// Umbrella Lane Caller
// ============================================================

export async function callUmbrellaLane(path, body, bearerToken, apiBaseUrl = API_BASE_URL) {
  if (!apiBaseUrl) {
    throw new Error('API base URL is not configured.');
  }

  if (!bearerToken || !bearerToken.trim()) {
    throw new Error('Enter a bearer token before running an Umbrella lane.');
  }

  // Timeout protection
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : {
          ok: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: await response.text(),
          },
        };

    // Umbrella normalization: payload.ok === false → error
    if (!response.ok || payload?.ok === false) {
      const code = payload?.error?.code || `HTTP_${response.status}`;
      const message =
        payload?.error?.message ||
        response.statusText ||
        'Umbrella request failed';

      const error = new Error(`${code}: ${message}`);
      error.code = code;
      error.payload = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('The Worker did not respond within 15 seconds.');
      timeoutError.code = 'WORKER_TIMEOUT';
      throw timeoutError;
    }
    if (error?.code) throw error;
    const unavailableError = new Error('The Worker is unavailable or blocked by the network.');
    unavailableError.code = 'WORKER_UNAVAILABLE';
    throw unavailableError;
  } finally {
    window.clearTimeout(timeout);
  }
}
