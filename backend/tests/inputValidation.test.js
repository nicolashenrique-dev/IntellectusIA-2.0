import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
process.env.FIREBASE_SERVICE_ACCOUNT = '';
process.env.GEMINI_API_KEY = '';
const { normalizeProfile } = await import('../src/services/learningProfile.js');
const { gerarTrilha, inscreverTrilha, obterTrilhaUsuario } = await import(
  '../src/controllers/roadmapController.js'
);
function response() {
  return {
    code: 200,
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
async function call(handler, body = {}, params = {}) {
  const res = response();
  await handler({ body, params }, res);
  return res;
}
test('quiz rejects inherited codes and non-string codes', () => {
  for (const field of ['interestCode', 'experienceCode', 'goalCode']) {
    for (const value of ['constructor', '__proto__', 'toString', ['TI'], {}]) {
      assert.throws(
        () => normalizeProfile({ interestCode: 'TI', [field]: value }),
        `${field}: ${JSON.stringify(value)}`,
      );
    }
  }
  for (const profile of [null, [], 'TI', 42]) assert.throws(() => normalizeProfile(profile));
});
test('inherited template names do not cause internal errors', async () => {
  for (const trilhaName of ['constructor', '__proto__', 'toString']) {
    const res = await call(inscreverTrilha, { uid: 'test-unusual-name', trilhaName });
    assert.equal(res.code, 200);
    assert.equal(res.body.roadmap.title, trilhaName);
    assert.equal(res.body.roadmap.nodes[0].status, 'in-progress');
  }
});
test('invalid quiz codes return 400 without saving a roadmap', async () => {
  const uid = 'test-invalid-profile';
  const res = await call(gerarTrilha, { uid, profile: { interestCode: 'constructor' } });
  assert.equal(res.code, 400);
  assert.equal((await call(obterTrilhaUsuario, {}, { uid })).code, 404);
});
