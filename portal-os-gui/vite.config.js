import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const WORKERS_API_BASE_URL = 'https://planetary-max.jurreaumax.workers.dev';
const CUSTOM_API_BASE_URL = 'https://api.portal-os.com';

function resolveApiBaseUrl(configuredUrl, customDomainActive) {
  const normalizedUrl = (configuredUrl || WORKERS_API_BASE_URL).replace(
    /\/+$/,
    ''
  );

  if (
    normalizedUrl === CUSTOM_API_BASE_URL &&
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
      'import.meta.env.PORTAL_API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
    build: {
      outDir: 'dist',
    },
  };
});
