import test from 'node:test';
import assert from 'node:assert/strict';
import { roadmapOwner } from '../src/middleware/roadmapOwner.js';
function run(req) {
  let status,
    called = false;
  roadmapOwner(
    req,
    {
      status(n) {
        status = n;
        return this;
      },
      json() {},
    },
    () => {
      called = true;
    },
  );
  return { status, called };
}
test('não permite ler nem modificar a trilha de outra conta', () => {
  assert.equal(run({ user: { uid: 'a' }, params: { uid: 'b' } }).status, 403);
  assert.equal(run({ user: { uid: 'a' }, params: {}, body: { uid: 'b' } }).status, 403);
});
test('exige autenticação e usa a identidade verificada', () => {
  assert.equal(run({ params: {} }).status, 401);
  const req = { user: { uid: 'a' }, params: {}, body: {} };
  assert.equal(run(req).called, true);
  assert.equal(req.body.uid, 'a');
});
