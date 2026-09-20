import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const WORKERS_API_BASE_URL = 'https://planetary-max.jurreaumax.workers.dev';
const CUSTOM_API_BASE_URL = 'https://api.portal-os.com';
const CUSTOM_API_ORIGIN = new URL(CUSTOM_API_BASE_URL).origin;

function getOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function resolveApiBaseUrl(configuredUrl, customDomainActive) {
  const normalizedUrl = (configuredUrl || WORKERS_API_BASE_URL).replace(
    /\/+$/,
    ''
  );

  if (
    getOrigin(normalizedUrl) === CUSTOM_API_ORIGIN &&
    customDomainActive !== 'true'
  ) {
    return WORKERS_API_BASE_URL;
  }

  return normalizedUrl;
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '');
  const configuredUrl =
    process.env.VITE_API_BASE_URL ||
    process.env.API_BASE_URL ||
    fileEnv.VITE_API_BASE_URL ||
    fileEnv.API_BASE_URL;
  const apiBaseUrl = resolveApiBaseUrl(
    configuredUrl,
    process.env.PORTAL_OS_CUSTOM_DOMAIN_ACTIVE ||
      fileEnv.PORTAL_OS_CUSTOM_DOMAIN_ACTIVE
  );

  return {
    plugins: [react()],
    define: {
      __PORTAL_API_BASE_URL__: JSON.stringify(apiBaseUrl),
    },
    build: {
      outDir: 'dist',
    },
  };
});
