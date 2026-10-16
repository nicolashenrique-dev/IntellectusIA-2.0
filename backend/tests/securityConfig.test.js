import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveJwtSecret } from '../src/config/security.js';

test('weak or missing keys do not prevent startup and are never accepted', () => {
  for (const configured of [undefined, 'short', 'intelectusia-modern-app-secure-key-2024']) {
    const local = resolveJwtSecret(configured, false);
    assert.equal(Buffer.byteLength(local), 64);
    assert.notEqual(local, configured);
    assert.equal(resolveJwtSecret(configured, true), null);
  }
  assert.notEqual(resolveJwtSecret('short'), resolveJwtSecret('short'));
});

test('an exclusive key is preserved in development and production', () => {
  const key = 'exclusive-key-for-tests-with-more-than-32-bytes';
  assert.equal(resolveJwtSecret(key, false), key);
  assert.equal(resolveJwtSecret(key, true), key);
});
