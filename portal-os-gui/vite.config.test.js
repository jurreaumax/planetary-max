import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveApiBaseUrl } from './vite.config.js';

const WORKERS_API_BASE_URL = 'https://planetary-max.jurreaumax.workers.dev';

for (const configuredUrl of [
  'https://API.PORTAL-OS.COM/',
  'https://api.portal-os.com:443',
  'https://API.PORTAL-OS.COM:443/v1/',
]) {
  test(`inactive custom-domain variant falls back: ${configuredUrl}`, () => {
    assert.equal(resolveApiBaseUrl(configuredUrl), WORKERS_API_BASE_URL);
  });
}

test('explicit activation permits the custom domain', () => {
  assert.equal(
    resolveApiBaseUrl('https://api.portal-os.com/', 'true'),
    'https://api.portal-os.com'
  );
});

test('a non-default port remains a distinct configured origin', () => {
  assert.equal(
    resolveApiBaseUrl('https://api.portal-os.com:8443/'),
    'https://api.portal-os.com:8443'
  );
});
