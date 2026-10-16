import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
process.env.FIREBASE_SERVICE_ACCOUNT = '';
process.env.JWT_SECRET = 'test-only-exclusive-key-with-more-than-32-bytes';
const { admin } = await import('../src/config/firebase.js');
admin.auth().verifyIdToken = async () => {
  throw new Error('invalid');
};
const { autenticarToken, autenticarTokenOpcional, exigirAdministrador } = await import(
  '../src/middleware/auth.js'
);
const { registrarUsuario, realizarLogin, listarUsuarios, resetarSenha } = await import(
  '../src/controllers/authController.js'
);
const { inscreverTrilha, atualizarStatusNo } = await import(
  '../src/controllers/roadmapController.js'
);
const { MOCK_USERS } = await import('../src/config/mockDb.js');
function response() {
  return {
    code: 200,
    status(n) {
      this.code = n;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
const forged =
  Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url') +
  '.' +
  Buffer.from(JSON.stringify({ uid: 'victim', admin: true })).toString('base64url') +
  '.';
test('rejects unsigned tokens in required and optional authentication', async () => {
  for (const middleware of [autenticarToken, autenticarTokenOpcional]) {
    const req = { headers: { authorization: 'Bearer ' + forged } };
    const res = response();
    await middleware(req, res, () => {});
    assert.equal(req.user, null);
    if (middleware === autenticarToken) assert.equal(res.code, 401);
  }
});
test('regular accounts cannot list all users', () => {
  const res = response();
  let called = false;
  exigirAdministrador({ user: { uid: 'a' } }, res, () => {
    called = true;
  });
  assert.equal(res.code, 403);
  assert.equal(called, false);
});
test('registration rejects account identifiers and duplicate emails; responses omit hashes', async () => {
  const data = { nome: 'Test', email: 'test@example.com', password: 'a-valid-password' };
  let res = response();
  await registrarUsuario({ body: { ...data, uid: 'victim' } }, res);
  assert.equal(res.code, 400);
  res = response();
  await registrarUsuario({ body: data }, res);
  assert.equal(res.code, 201);
  assert.equal(res.body.user.password, undefined);
  res = response();
  await registrarUsuario({ body: data }, res);
  assert.equal(res.code, 409);
  res = response();
  await realizarLogin({ body: data }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.user.password, undefined);
  res = response();
  await listarUsuarios({}, res);
  assert.ok(res.body.users.every((user) => !('password' in user)));
  MOCK_USERS.length = 0;
});
test('legacy password reset never reports a change without verification', () => {
  const res = response();
  resetarSenha({ body: { token: forged, newPassword: 'anything' } }, res);
  assert.equal(res.code, 501);
  assert.equal(res.body.success, false);
});
test('locked modules cannot be skipped and completion bonus is awarded once', async () => {
  const uid = 'security-points-test';
  let res = response();
  await inscreverTrilha({ body: { uid, trilhaName: 'Fullstack Developer' } }, res);
  res = response();
  await atualizarStatusNo({ body: { uid, status: 'completed' }, params: { id: '4' } }, res);
  assert.equal(res.code, 409);
  for (let id = 1; id <= 4; id++) {
    res = response();
    await atualizarStatusNo(
      { body: { uid, status: 'completed' }, params: { id: String(id) } },
      res,
    );
    assert.equal(res.code, 200);
  }
  assert.equal(res.body.pontosGanhos, 300);
  res = response();
  await atualizarStatusNo({ body: { uid, status: 'completed' }, params: { id: '4' } }, res);
  assert.equal(res.body.pontosGanhos, 0);
  assert.equal(res.body.totalPontos, 600);
});

test('HTTP routes require ownership and do not expose reset operations', async () => {
  const { default: app } = await import('../app.js');
  const jwt = (await import('jsonwebtoken')).default;
  const { jwtSecret } = await import('../src/config/security.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const path of ['/autenticacao/usuarios', '/autenticacao/perfil/victim']) {
      const res = await fetch(base + path);
      assert.equal(res.status, 401);
    }
    for (const path of ['/trilhas/ranking/reset', '/api/ranking/reset']) {
      const res = await fetch(base + path, { method: 'POST' });
      assert.equal(res.status, 401);
    }
    const token = jwt.sign({ uid: 'owner' }, jwtSecret, { expiresIn: '1h' });
    const headers = { Authorization: 'Bearer ' + token };
    for (const path of ['/api/perfil/victim', '/api/pontos/victim', '/trilhas/pontos/victim']) {
      const res = await fetch(base + path, { headers });
      assert.equal(res.status, 403);
    }
    const res = await fetch(base + '/trilhas/ranking/reset', { method: 'POST', headers });
    assert.equal(res.status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
test('roadmap IDs resolve the selected catalog entry and reject missing entries', async () => {
  const { obterTrilhaPorId } = await import('../src/controllers/roadmapController.js');
  let res = response();
  await obterTrilhaPorId({ params: { id: '2' } }, res);
  assert.match(res.body.roadmap.title, /UI\/UX/);
  res = response();
  await obterTrilhaPorId({ params: { id: '999' } }, res);
  assert.equal(res.code, 404);
});
