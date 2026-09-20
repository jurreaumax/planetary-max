export type UALPermission = string;

export interface UALState {
  token: string | null;
  sessionValid: boolean;
  workerOnline: boolean;
  identity: Record<string, unknown> | null;
  kernel: Record<string, unknown> | null;
  umbrella: Record<string, unknown> | null;
  sim: Record<string, unknown> | null;
  health: Record<string, unknown> | null;
}

type UALEventMap = {
  'auth.changed': string | null;
  'identity.updated': Record<string, unknown> | null;
  'kernel.updated': Record<string, unknown> | null;
  'umbrella.updated': Record<string, unknown> | null;
  'sim.updated': Record<string, unknown> | null;
  'health.updated': Record<string, unknown> | null;
  'worker.online': undefined;
  'worker.offline': Error | undefined;
  'session.expired': undefined;
};

const TOKEN_KEY = 'portal_os_token';
const POLL_INTERVAL = 10_000;

const initialState: UALState = {
  token: null,
  sessionValid: false,
  workerOnline: false,
  identity: null,
  kernel: null,
  umbrella: null,
  sim: null,
  health: null,
};

function objectValue(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function responseData(value: unknown): Record<string, unknown> {
  const record = objectValue(value);
  return objectValue(record.data ?? value);
}

export class UAL {
  private readonly listeners = new Map<string, Set<(detail: unknown) => void>>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private state: UALState;

  constructor(private readonly baseUrl = '') {
    const token = typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
    this.state = { ...initialState, token, sessionValid: Boolean(token) };
  }

  getState(): UALState { return { ...this.state }; }

  on<K extends keyof UALEventMap>(event: K, listener: (detail: UALEventMap[K]) => void): () => void {
    const set = this.listeners.get(event) ?? new Set<(detail: unknown) => void>();
    set.add(listener as (detail: unknown) => void);
    this.listeners.set(event, set);
    return () => set.delete(listener as (detail: unknown) => void);
  }

  private emit<K extends keyof UALEventMap>(event: K, detail: UALEventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(detail));
  }

  setToken(token: string | null): void {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    this.state = { ...this.state, token, sessionValid: Boolean(token) };
    this.emit('auth.changed', token);
  }

  can(permission: UALPermission): boolean {
    const identity = this.state.identity;
    if (!this.state.sessionValid || !identity) return false;
    const permissions = identity.permissions ?? identity.capabilities;
    if (Array.isArray(permissions)) return permissions.includes(permission) || permissions.includes('*');
    const grants = objectValue(permissions);
    return grants[permission] === true || identity.role === 'admin' || identity.licenseTier === 'enterprise';
  }

  async safePost<T = unknown>(path: string, body: Record<string, unknown> = {}): Promise<T | null> {
    if (!this.state.token) return null;
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.state.token}` },
        body: JSON.stringify(body),
      });
      if (response.status === 401 || response.status === 403) {
        this.state = { ...this.state, sessionValid: false };
        this.emit('session.expired', undefined);
        return null;
      }
      if (!response.ok) throw new Error(`Worker request failed (${response.status})`);
      return await response.json() as T;
    } catch (error) {
      this.state = { ...this.state, workerOnline: false };
      this.emit('worker.offline', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async syncAll(): Promise<void> {
    if (!this.state.token) return;
    const requests = await Promise.all([
      this.safePost('/umbrella/identity/license'),
      this.safePost('/umbrella/kernel/state'),
      this.safePost('/umbrella/system/state'),
      this.safePost('/umbrella/sim/bees/state'),
      this.safePost('/umbrella/system/health'),
    ]);
    const [identity, kernel, umbrella, sim, health] = requests.map(responseData);
    if (!identity && !kernel && !umbrella && !sim && !health) return;
    this.state = { ...this.state, workerOnline: true, sessionValid: true, identity, kernel, umbrella, sim, health };
    this.emit('worker.online', undefined);
    this.emit('identity.updated', identity);
    this.emit('kernel.updated', kernel);
    this.emit('umbrella.updated', umbrella);
    this.emit('sim.updated', sim);
    this.emit('health.updated', health);
  }

  startPolling(): void {
    if (this.pollTimer) return;
    void this.syncAll();
    this.pollTimer = setInterval(() => void this.syncAll(), POLL_INTERVAL);
  }

  stopPolling(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
  }
}

export const ual = new UAL(typeof window === 'undefined' ? '' : (import.meta.env?.VITE_API_BASE_URL ?? ''));
