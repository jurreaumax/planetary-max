import { Hono } from 'hono';
import { cors } from 'hono/cors';

type KernelEnvelope = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  identity: IdentityEnvelope;
  governanceContext: Record<string, unknown>;
};

type IdentityRole = 'admin' | 'operator' | 'observer';

type IdentityEnvelope = {
  subject: string;
  role: IdentityRole;
  capabilities: string[];
  proof: string;
};

type KernelService = {
  fetch(request: Request): Promise<Response>;
};

type Bindings = {
  KERNEL_SERVICE?: KernelService;
  KERNEL_URL?: string;
  PLANETARY_MODE?: string;
  UMBRELLA_ENFORCEMENT?: string;
  PORTAL_SYSTEM_TOKEN?: string;
  PORTAL_SERVICE_TOKEN?: string;
  PORTAL_OBSERVER_TOKEN?: string;
};

type KernelResult = {
  ok?: boolean;
  messageId?: unknown;
  type?: unknown;
  identity?: unknown;
  route?: unknown;
  result?: unknown;
  error?: { code?: string; message?: string };
  [key: string]: unknown;
};

type UmbrellaOperation =
  | 'identity.physics.license'
  | 'governance.engine.license'
  | 'apex.alignment.advisory'
  | 'umbrella.sim.pack'
  | 'umbrella.market.forecast'
  | 'umbrella.identity.mirror'
  | 'umbrella.crossworld.access'
  | 'structural.truth.license'
  | 'umbrella.identity'
  | 'umbrella.governance'
  | 'umbrella.structural'
  | 'umbrella.physics'
  | 'umbrella.routing';

const ROLE_IDENTITIES: Record<IdentityRole, Omit<IdentityEnvelope, 'proof'>> = {
  admin: {
    subject: 'system',
    role: 'admin',
    capabilities: ['*'],
  },
  operator: {
    subject: 'portal-worker',
    role: 'operator',
    capabilities: ['umbrella:read', 'umbrella:operate', 'universe:read', 'universe:write'],
  },
  observer: {
    subject: 'observer',
    role: 'observer',
    capabilities: ['umbrella:read', 'universe:read'],
  },
};

const UMBRELLA_ROUTES: ReadonlyArray<readonly [string, UmbrellaOperation]> = [
  ['/umbrella/identity/license', 'identity.physics.license'],
  ['/umbrella/governance/license', 'governance.engine.license'],
  ['/umbrella/apex/advisory', 'apex.alignment.advisory'],
  ['/umbrella/sim/pack', 'umbrella.sim.pack'],
  ['/umbrella/market/forecast', 'umbrella.market.forecast'],
  ['/umbrella/identity/mirror', 'umbrella.identity.mirror'],
  ['/umbrella/crossworld/access', 'umbrella.crossworld.access'],
  ['/umbrella/structural/truth/license', 'structural.truth.license'],
  ['/api/umbrella/identity/license', 'identity.physics.license'],
  ['/api/umbrella/governance/license', 'governance.engine.license'],
  ['/api/umbrella/apex/advisory', 'apex.alignment.advisory'],
  ['/api/umbrella/sim/pack', 'umbrella.sim.pack'],
  ['/api/umbrella/market/forecast', 'umbrella.market.forecast'],
  ['/api/umbrella/identity/mirror', 'umbrella.identity.mirror'],
  ['/api/umbrella/crossworld/access', 'umbrella.crossworld.access'],
  ['/api/umbrella/structural/truth/license', 'structural.truth.license'],
  ['/api/umbrella/identity', 'umbrella.identity'],
  ['/api/umbrella/governance', 'umbrella.governance'],
  ['/api/umbrella/structural', 'umbrella.structural'],
  ['/api/umbrella/physics', 'umbrella.physics'],
  ['/api/umbrella/routing', 'umbrella.routing'],
];

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// ⭐ ROOT ROUTE — this fixes the 404 at /
app.get('/', (c) => {
  return c.json({
    status: 'Portal‑OS live',
    worker: 'planetary-max',
    mode: c.env.PLANETARY_MODE,
    umbrella: c.env.UMBRELLA_ENFORCEMENT
  });
});

app.get('/health', (c) => c.json({ status: 'ok', service: 'portal-os-worker' }));

app.post('/api/kernel/message', async (c) => {
  const authorization = c.req.header('Authorization');
  const identity = classifyIdentity(c.env, authorization);
  if (!identity) return identityError(authorization);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: { code: 'INVALID_JSON', message: 'Request body must be JSON' } }, 400);
  }
  if (!isRecord(body) || typeof body.type !== 'string') {
    return c.json({ ok: false, error: { code: 'INVALID_MESSAGE', message: 'type and object payload are required' } }, 400);
  }
  const payload = body.payload === undefined ? {} : body.payload;
  if (!isRecord(payload)) {
    return c.json({ ok: false, error: { code: 'INVALID_MESSAGE', message: 'type and object payload are required' } }, 400);
  }
  const envelope = createEnvelope(
    body.type,
    payload,
    identity,
    isRecord(body.governanceContext) ? body.governanceContext : {},
  );
  return kernelResponse(c.env, envelope);
});

app.get('/api/autonomy', async (c) => normalizedRequest(c.env, c.req.header('Authorization'), 'autonomy.state', {}));
app.get('/universe/state', async (c) => normalizedRequest(c.env, c.req.header('Authorization'), 'universe.state', {}));
app.get('/universe/umbrella', async (c) => normalizedRequest(c.env, c.req.header('Authorization'), 'universe.umbrella', {}));
for (const [path, operation] of UMBRELLA_ROUTES) {
  app.post(path, async (c) => umbrellaRequest(
    c.env,
    c.req.header('Authorization'),
    c.req.raw,
    operation,
  ));
}
app.post('/universe/tick', async (c) => {
  let payload: Record<string, unknown> = {};
  const contentType = c.req.header('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const body: unknown = await c.req.json();
      if (!isRecord(body)) return c.json({ ok: false, error: { code: 'INVALID_JSON', message: 'Tick payload must be an object' } }, 400);
      payload = body;
    } catch {
      return c.json({ ok: false, error: { code: 'INVALID_JSON', message: 'Request body must be JSON' } }, 400);
    }
  }
  return normalizedRequest(c.env, c.req.header('Authorization'), 'universe.tick', payload);
});

async function normalizedRequest(
  env: Bindings,
  authorization: string | undefined,
  type: string,
  payload: Record<string, unknown>,
): Promise<Response> {
  const identity = classifyIdentity(env, authorization);
  if (!identity) return identityError(authorization);
  return kernelResponse(env, createEnvelope(type, payload, identity, { surface: 'worker-api' }), true);
}

async function umbrellaRequest(
  env: Bindings,
  authorization: string | undefined,
  request: Request,
  type: UmbrellaOperation,
): Promise<Response> {
  const identity = classifyIdentity(env, authorization);
  if (!identity) return identityError(authorization);
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: { code: 'INVALID_JSON', message: 'Umbrella payload must be JSON' } }, { status: 400 });
  }
  if (!isRecord(payload)) {
    return Response.json({ ok: false, error: { code: 'INVALID_JSON', message: 'Umbrella payload must be an object' } }, { status: 400 });
  }
  return kernelResponse(
    env,
    createEnvelope(type, payload, identity, { surface: 'worker-umbrella' }),
    true,
  );
}

function createEnvelope(
  type: string,
  payload: Record<string, unknown>,
  identity: IdentityEnvelope,
  governanceContext: Record<string, unknown>,
): KernelEnvelope {
  return { id: crypto.randomUUID(), type, payload, identity, governanceContext };
}

async function kernelResponse(env: Bindings, envelope: KernelEnvelope, normalize = false): Promise<Response> {
  try {
    const response = await callKernel(env, envelope);
    const result = await response.json<KernelResult>();
    const status = result.ok === false ? kernelErrorStatus(result.error?.code) : response.status;
    if (result.ok === false || !normalize) return Response.json(result, { status });
    return Response.json(normalizeResponse(result, envelope), { status });
  } catch (error) {
    console.error('Worker to kernel bridge failed', error);
    return Response.json(
      { ok: false, error: { code: 'KERNEL_UNAVAILABLE', message: 'Kernel bridge unavailable' } },
      { status: 503 },
    );
  }
}

function normalizeResponse(result: KernelResult, envelope: KernelEnvelope): Record<string, unknown> {
  return {
    ok: true,
    data: extractLaneData(result),
    meta: {
      messageId: result.messageId ?? envelope.id,
      type: result.type ?? envelope.type,
      identity: result.identity ?? publicIdentity(envelope.identity),
      route: result.route ?? [],
    },
  };
}

function extractLaneData(response: unknown): unknown {
  if (!isRecord(response) || !isRecord(response.result)) return {};
  const lanes = response.result.lanes;
  if (!Array.isArray(lanes) || !isRecord(lanes[0]) || !isRecord(lanes[0].result)) return {};
  const results = lanes[0].result.results;
  if (!Array.isArray(results) || !isRecord(results[0]) || !isRecord(results[0].result)) return {};
  return results[0].result.data ?? {};
}

async function callKernel(env: Bindings, envelope: KernelEnvelope): Promise<Response> {
  const body = JSON.stringify(envelope);
  const request = new Request('http://kernel/api/kernel/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (env.KERNEL_SERVICE) return env.KERNEL_SERVICE.fetch(request);
  if (env.KERNEL_URL) {
    const target = `${env.KERNEL_URL.replace(/\/$/, '')}/api/kernel/message`;
    return fetch(target, { method: 'POST', headers: request.headers, body });
  }
  throw new Error('Configure KERNEL_SERVICE or KERNEL_URL');
}

function bearerToken(header: string | undefined): string | null {
  const match = /^Bearer\s+(.+)$/i.exec(header ?? '');
  return match?.[1]?.trim() || null;
}

function classifyIdentity(env: Bindings, authorization: string | undefined): IdentityEnvelope | null {
  const proof = bearerToken(authorization);
  if (!proof) return null;
  const matches: Array<Omit<IdentityEnvelope, 'proof'>> = [];
  if (env.PORTAL_SYSTEM_TOKEN && proof === env.PORTAL_SYSTEM_TOKEN) matches.push(ROLE_IDENTITIES.admin);
  if (env.PORTAL_SERVICE_TOKEN && proof === env.PORTAL_SERVICE_TOKEN) matches.push(ROLE_IDENTITIES.operator);
  if (env.PORTAL_OBSERVER_TOKEN && proof === env.PORTAL_OBSERVER_TOKEN) matches.push(ROLE_IDENTITIES.observer);
  if (matches.length !== 1) return null;
  return { ...matches[0], capabilities: [...matches[0].capabilities], proof };
}

function publicIdentity(identity: IdentityEnvelope): Omit<IdentityEnvelope, 'proof'> {
  return {
    subject: identity.subject,
    role: identity.role,
    capabilities: [...identity.capabilities],
  };
}

function identityError(authorization: string | undefined): Response {
  const message = bearerToken(authorization) ? 'Invalid bearer token' : 'Bearer token required';
  return Response.json({ ok: false, error: { code: 'UNAUTHENTICATED', message } }, { status: 401 });
}

function kernelErrorStatus(code: string | undefined): number {
  if (code === 'UNAUTHENTICATED') return 401;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'INVALID_MESSAGE' || code === 'INVALID_JSON') return 400;
  return 500;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export { app, classifyIdentity, createEnvelope, extractLaneData, normalizeResponse };
export default app;
