import assert from 'node:assert/strict';
import test from 'node:test';

import { UMBRELLA_LANES, callUmbrellaLane } from './api.js';

const TEST_API = 'https://worker.test';

test('all GUI lanes use the authenticated /api/umbrella surface', () => {
  assert.ok(UMBRELLA_LANES.length >= 5);
  assert.deepEqual(
    UMBRELLA_LANES.slice(0, 5).map(({ path }) => path),
    [
      '/api/umbrella/identity',
      '/api/umbrella/governance',
      '/api/umbrella/structural',
      '/api/umbrella/physics',
      '/api/umbrella/routing',
    ],
  );
  assert.ok(UMBRELLA_LANES.every(({ path }) => path.startsWith('/api/umbrella/')));
});

test('GUI callers preserve unauthorized identity errors', async () => {
  globalThis.window = globalThis;
  globalThis.fetch = async () => Response.json({
    ok: false,
    error: { code: 'UNAUTHENTICATED', message: 'Invalid bearer token' },
  }, { status: 401 });

  await assert.rejects(
    callUmbrellaLane('/api/umbrella/identity', {}, 'invalid-token', TEST_API),
    (error) => error.code === 'UNAUTHENTICATED' && /Invalid bearer token/.test(error.message),
  );
});

test('GUI callers distinguish an unavailable kernel', async () => {
  globalThis.window = globalThis;
  globalThis.fetch = async () => Response.json({
    ok: false,
    error: { code: 'KERNEL_UNAVAILABLE', message: 'Kernel bridge unavailable' },
  }, { status: 503 });

  await assert.rejects(
    callUmbrellaLane('/api/umbrella/routing', {}, 'service-token', TEST_API),
    (error) => error.code === 'KERNEL_UNAVAILABLE' && /Kernel bridge unavailable/.test(error.message),
  );
});
