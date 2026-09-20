import { describe, expect, it } from 'vitest';

import app, { extractLaneData } from '../src/index';

type KernelEnvelope = {
  id: string;
  type: string;
  identity: {
    subject: string;
    role: string;
    capabilities: string[];
    proof: string;
  };
  payload: Record<string, unknown>;
};

const TOKENS = {
  PORTAL_SYSTEM_TOKEN: 'shared-system-token',
  PORTAL_SERVICE_TOKEN: 'shared-service-token',
  PORTAL_OBSERVER_TOKEN: 'observer-token',
};

function successResponse(envelope: KernelEnvelope): Response {
  return Response.json({
    ok: true,
    messageId: envelope.id,
    type: envelope.type,
    identity: {
      id: envelope.identity.subject,
      subject: envelope.identity.subject,
      role: envelope.identity.role,
      roles: [envelope.identity.role],
      capabilities: envelope.identity.capabilities,
    },
    route: ['orchestration'],
    result: {
      lanes: [{
        lane: 'orchestration',
        result: {
          results: [{ result: { data: { operation: envelope.type, payload: envelope.payload } } }],
        },
      }],
    },
  });
}

function bindings(
  handler: (envelope: KernelEnvelope) => Response | Promise<Response>,
  tokens: Record<string, string> = TOKENS,
) {
  return {
    ...tokens,
    KERNEL_SERVICE: {
      async fetch(request: Request): Promise<Response> {
        return handler(await request.json<KernelEnvelope>());
      },
    },
  };
}

describe('normalized Worker integration routes', () => {
  it('exposes the public edge health contract', async () => {
    const response = await app.request('/health', { headers: { Origin: 'https://portal-os.com' } });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(await response.json()).toEqual({ status: 'ok', service: 'portal-os-worker' });
  });

  it.each([
    ['GET', '/api/autonomy', 'autonomy.state'],
    ['GET', '/universe/state', 'universe.state'],
    ['GET', '/universe/umbrella', 'universe.umbrella'],
    ['POST', '/universe/tick', 'universe.tick'],
    ['POST', '/umbrella/identity/license', 'identity.physics.license'],
    ['POST', '/umbrella/governance/license', 'governance.engine.license'],
    ['POST', '/umbrella/apex/advisory', 'apex.alignment.advisory'],
    ['POST', '/umbrella/sim/pack', 'umbrella.sim.pack'],
    ['POST', '/umbrella/market/forecast', 'umbrella.market.forecast'],
    ['POST', '/umbrella/identity/mirror', 'umbrella.identity.mirror'],
    ['POST', '/umbrella/crossworld/access', 'umbrella.crossworld.access'],
    ['POST', '/umbrella/structural/truth/license', 'structural.truth.license'],
    ['POST', '/api/umbrella/identity/license', 'identity.physics.license'],
    ['POST', '/api/umbrella/governance/license', 'governance.engine.license'],
    ['POST', '/api/umbrella/identity', 'umbrella.identity'],
    ['POST', '/api/umbrella/governance', 'umbrella.governance'],
    ['POST', '/api/umbrella/structural', 'umbrella.structural'],
    ['POST', '/api/umbrella/physics', 'umbrella.physics'],
    ['POST', '/api/umbrella/routing', 'umbrella.routing'],
  ])('normalizes %s %s lane data', async (method, path, type) => {
    let forwarded: KernelEnvelope | undefined;
    const response = await app.request(path, {
      method,
      headers: {
        Authorization: 'Bearer shared-service-token',
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      body: method === 'POST' ? JSON.stringify({ changes: { population: 1 } }) : undefined,
    }, bindings((envelope) => {
      forwarded = envelope;
      return successResponse(envelope);
    }));

    expect(response.status).toBe(200);
    expect(forwarded).toMatchObject({
      type,
      identity: {
        subject: 'portal-worker',
        role: 'operator',
        capabilities: ['umbrella:read', 'umbrella:operate', 'universe:read', 'universe:write'],
        proof: 'shared-service-token',
      },
    });
    expect(await response.json()).toEqual({
      ok: true,
      data: { operation: type, payload: method === 'POST' ? { changes: { population: 1 } } : {} },
      meta: {
        messageId: forwarded?.id,
        type,
        identity: {
          id: 'portal-worker',
          subject: 'portal-worker',
          role: 'operator',
          roles: ['operator'],
          capabilities: ['umbrella:read', 'umbrella:operate', 'universe:read', 'universe:write'],
        },
        route: ['orchestration'],
      },
    });
  });

  it('rejects a missing bearer token before calling the kernel', async () => {
    let called = false;
    const response = await app.request('/universe/state', {}, bindings(() => {
      called = true;
      return Response.json({ ok: true });
    }));

    expect(response.status).toBe(401);
    expect(called).toBe(false);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'Bearer token required' },
    });
  });

  it('rejects an unconfigured bearer token before calling the kernel', async () => {
    let called = false;
    const response = await app.request('/api/umbrella/identity', {
      method: 'POST',
      headers: { Authorization: 'Bearer unconfigured-token', 'Content-Type': 'application/json' },
      body: '{}',
    }, bindings(() => {
      called = true;
      return Response.json({ ok: true });
    }));

    expect(response.status).toBe(401);
    expect(called).toBe(false);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'Invalid bearer token' },
    });
  });

  it.each([
    ['shared-system-token', 'system', 'admin', ['*']],
    ['shared-service-token', 'portal-worker', 'operator', ['umbrella:read', 'umbrella:operate', 'universe:read', 'universe:write']],
    ['observer-token', 'observer', 'observer', ['umbrella:read', 'universe:read']],
  ])('classifies the configured %s identity before dispatch', async (token, subject, role, capabilities) => {
    const response = await app.request('/api/umbrella/identity', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
    }, bindings((envelope) => {
      expect(envelope.identity).toEqual({ subject, role, capabilities, proof: token });
      return successResponse(envelope);
    }));

    expect(response.status).toBe(200);
  });

  it('preserves a kernel rejection for an invalid bearer token', async () => {
    const response = await app.request('/api/autonomy', {
      headers: { Authorization: 'Bearer not-registered' },
    }, { ...bindings(() => Response.json({
      ok: false,
      messageId: 'rejected-1',
      error: { code: 'UNAUTHENTICATED', message: 'invalid identity token' },
    }, { status: 401 })), PORTAL_SERVICE_TOKEN: 'not-registered' });

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'invalid identity token' },
    });
  });

  it('preserves observer denial details for universe tick', async () => {
    const response = await app.request('/universe/tick', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer observer-token',
        'Content-Type': 'application/json',
      },
      body: '{}',
    }, bindings(() => Response.json({
      ok: false,
      messageId: 'denied-1',
      error: { code: 'FORBIDDEN', message: 'not authorized for universe.tick' },
    }, { status: 403 })));

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: { code: 'FORBIDDEN', message: 'not authorized for universe.tick' },
    });
  });

  it('forwards an over-tier request unchanged and normalizes the kernel cap', async () => {
    const response = await app.request('/umbrella/identity/license', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer basic-license-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier: 'enterprise', input: { subject: 'alpha' } }),
    }, bindings((envelope) => {
      expect(envelope.identity).toMatchObject({
        subject: 'observer',
        role: 'observer',
        proof: 'basic-license-token',
      });
      expect(envelope.payload).toEqual({ tier: 'enterprise', input: { subject: 'alpha' } });
      return Response.json({
        ok: true,
        messageId: envelope.id,
        type: envelope.type,
        identity: { id: 'licensed-observer', roles: ['observer'] },
        route: ['orchestration'],
        result: {
          lanes: [{
            result: {
              results: [{ result: { data: {
                tier: 'basic',
                requestedTier: 'enterprise',
                authorizedTier: 'basic',
                tierCapped: true,
                identitySignature: 'idp_v1_example',
              } } }],
            },
          }],
        },
      });
    }, { ...TOKENS, PORTAL_OBSERVER_TOKEN: 'basic-license-token' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      data: {
        tier: 'basic',
        requestedTier: 'enterprise',
        authorizedTier: 'basic',
        tierCapped: true,
      },
      meta: { type: 'identity.physics.license', route: ['orchestration'] },
    });
  });

  it('rejects malformed license payloads before calling the kernel', async () => {
    let called = false;
    const response = await app.request('/umbrella/governance/license', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer shared-service-token',
        'Content-Type': 'application/json',
      },
      body: '[]',
    }, bindings(() => {
      called = true;
      return Response.json({ ok: true });
    }));

    expect(response.status).toBe(400);
    expect(called).toBe(false);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'INVALID_JSON', message: 'Umbrella payload must be an object' },
    });
  });

  it('reports an unavailable kernel distinctly from an unauthorized identity', async () => {
    const response = await app.request('/api/umbrella/routing', {
      method: 'POST',
      headers: { Authorization: 'Bearer shared-service-token', 'Content-Type': 'application/json' },
      body: '{}',
    }, TOKENS);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'KERNEL_UNAVAILABLE', message: 'Kernel bridge unavailable' },
    });
  });

  it('allows browser preflight requests for Umbrella routes', async () => {
    const response = await app.request('/umbrella/crossworld/access', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://portal-os.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
  });

  it('allows browser preflight for authenticated API routes', async () => {
    const response = await app.request('/api/autonomy', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://portal-os.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
  });
});

describe('extractLaneData', () => {
  it('extracts the nested TEC lane payload', () => {
    expect(extractLaneData({
      result: { lanes: [{ result: { results: [{ result: { data: { tick: 7 } } }] } }] },
    })).toEqual({ tick: 7 });
  });

  it('returns an empty object for a malformed kernel envelope', () => {
    expect(extractLaneData({ result: { lanes: [] } })).toEqual({});
  });
});
