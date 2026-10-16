import 'dotenv/config';
import { randomBytes } from 'node:crypto';

export function resolveJwtSecret(configured, production = false) {
  const valid =
    typeof configured === 'string' &&
    Buffer.byteLength(configured) >= 32 &&
    configured !== 'intelectusia-modern-app-secure-key-2024';
  if (valid) return configured;
  // Firebase authentication remains available even without an internal JWT key.
  if (production) return null;
  return randomBytes(32).toString('hex');
}

const configured = process.env.JWT_SECRET;
const production = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
export const jwtSecret = resolveJwtSecret(configured, production);
if (configured && jwtSecret !== configured) {
  console.warn(
    production
      ? 'JWT_SECRET insegura: login interno desativado; autenticacao Firebase continua disponivel.'
      : 'JWT_SECRET insegura ignorada: usando uma chave temporaria de desenvolvimento.',
  );
}
