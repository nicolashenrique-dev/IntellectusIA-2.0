import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const directory = new URL('../../.local/', import.meta.url);
const file = new URL('roadmaps.json', directory);
const persistent = process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT;
let data = Object.create(null);
if (
  persistent &&
  process.env.NODE_ENV !== 'production' &&
  !process.env.VERCEL &&
  existsSync(file)
) {
  try {
    data = Object.assign(Object.create(null), JSON.parse(readFileSync(file, 'utf8')));
  } catch (error) {
    throw new Error(
      'Armazenamento local inv?lido. Preserve o arquivo e restaure um backup antes de iniciar.',
      { cause: error },
    );
  }
}
// Development storage survives restarts. Production must use Firestore.
export const localRoadmaps = new Proxy(data, {
  set(target, key, value) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL)
      throw new Error('Configure o Firestore para salvar trilhas em produção.');
    target[key] = value;
    if (persistent) {
      mkdirSync(directory, { recursive: true });
      const temporary = `${fileURLToPath(file)}.tmp`;
      writeFileSync(temporary, JSON.stringify(target), { mode: 0o600 });
      renameSync(temporary, file);
    }
    return true;
  },
});
