import { adminDb } from '../config/firebase.js';
import { localRoadmaps } from './localRoadmaps.js';
import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const directory = new URL('../../.local/', import.meta.url);
const file = new URL('users.json', directory);
const persistent = process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT;
const localUsers = Object.create(null);
if (
  persistent &&
  !adminDb &&
  process.env.NODE_ENV !== 'production' &&
  !process.env.VERCEL &&
  existsSync(file)
) {
  Object.assign(localUsers, JSON.parse(readFileSync(file, 'utf8')));
}
function localData(uid) {
  return structuredClone({
    ...localUsers[uid],
    ...(localRoadmaps[uid] ? { trilha: localRoadmaps[uid] } : {}),
  });
}
export async function lerUsuario(uid) {
  if (!adminDb) return localData(uid);
  const doc = await adminDb.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : {};
}
export async function listarDadosUsuarios() {
  if (adminDb)
    return (await adminDb.collection('users').get()).docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
  return [...new Set([...Object.keys(localUsers), ...Object.keys(localRoadmaps)])].map((uid) => ({
    uid,
    ...localData(uid),
  }));
}
// The callback is synchronous and can be retried by Firestore. No external effects inside it.
export async function atualizarUsuario(uid, transform) {
  if (adminDb) {
    const ref = adminDb.collection('users').doc(uid);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      const { patch, result } = transform(snapshot.exists ? snapshot.data() : {});
      if (snapshot.exists) tx.update(ref, patch);
      else tx.set(ref, patch);
      return result;
    });
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL)
    throw new Error('Configure o Firestore para salvar dados em producao.');
  const { patch, result } = transform(localData(uid));
  if (patch.trilha) localRoadmaps[uid] = patch.trilha;
  const { trilha, ...fields } = patch;
  localUsers[uid] = { ...localUsers[uid], ...fields };
  if (persistent) {
    mkdirSync(directory, { recursive: true });
    const temporary = fileURLToPath(file) + '.tmp';
    writeFileSync(temporary, JSON.stringify(localUsers, null, 2), { mode: 0o600 });
    renameSync(temporary, file);
  }
  return result;
}
