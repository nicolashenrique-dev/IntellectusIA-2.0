import { createPrivateKey } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../backend/package.json', import.meta.url));
const { parse } = require('dotenv');
const root = new URL('../', import.meta.url);
const env = (directory) => {
  const values = {};
  for (const filename of ['.env', '.env.production.local']) {
    const file = new URL(directory + '/' + filename, root);
    if (existsSync(file)) Object.assign(values, parse(readFileSync(file)));
  }
  return values;
};
const frontend = env('frontend');
const backend = env('backend');
let errors = 0;
function check(condition, message) {
  console.log((condition ? 'OK: ' : 'FALTA: ') + message);
  if (!condition) errors++;
}
for (const name of [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
])
  check(Boolean(frontend[name]), name + ' no frontend');
try {
  check(new URL(frontend.VITE_API_URL).protocol === 'https:', 'VITE_API_URL usa HTTPS');
} catch {
  check(false, 'VITE_API_URL válida');
}
check(
  Boolean(backend.FIREBASE_PROJECT_ID) &&
    backend.FIREBASE_PROJECT_ID === frontend.VITE_FIREBASE_PROJECT_ID,
  'Frontend e backend usam o mesmo projeto Firebase',
);
let service;
try {
  service = JSON.parse(backend.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch {}
let validService = false;
try {
  validService =
    service?.type === 'service_account' &&
    Boolean(service.client_email) &&
    service.project_id === backend.FIREBASE_PROJECT_ID &&
    createPrivateKey(service.private_key).asymmetricKeyType === 'rsa';
} catch {}
check(validService, 'Conta de serviço Firebase válida para o projeto');
check(
  Boolean(
    backend.JWT_SECRET &&
      Buffer.byteLength(backend.JWT_SECRET) >= 32 &&
      backend.JWT_SECRET !== 'intelectusia-modern-app-secure-key-2024',
  ),
  'JWT_SECRET exclusiva para login interno',
);
for (const name of ['GEMINI_API_KEY', 'YOUTUBE_API_KEY'])
  console.log((backend[name] ? 'OK: ' : 'OPCIONAL AUSENTE: ') + name);
if (errors)
  console.log('Corrija os itens FALTA antes de publicar a API. Nenhuma chave foi exibida.');
else console.log('Configuração local validada. Verifique login e persistência no deploy de teste.');
process.exitCode = errors ? 1 : 0;
