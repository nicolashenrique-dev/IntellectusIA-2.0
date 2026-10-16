import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
process.env.FIREBASE_SERVICE_ACCOUNT = '';
process.env.GEMINI_API_KEY = '';
const { inscreverTrilha, gerarTrilha, atualizarStatusNo, obterPontosUsuario, obterRanking } =
  await import('../src/controllers/roadmapController.js');
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
async function call(handler, uid, body = {}, params = {}) {
  const res = response();
  await handler({ body: { uid, ...body }, params, user: { uid, nome: 'Points test' } }, res);
  assert.equal(res.code, 200, JSON.stringify(res.body));
  return res.body;
}
async function enroll(uid, name) {
  return call(inscreverTrilha, uid, { trilhaName: name });
}
async function complete(uid, id) {
  return call(atualizarStatusNo, uid, { status: 'completed' }, { id: String(id) });
}
async function points(uid) {
  return call(obterPontosUsuario, uid, {}, { uid });
}

test('points and ranking survive a new catalog enrollment and continue accumulating', async () => {
  const uid = 'cumulative-catalog';
  await enroll(uid, 'Fullstack Developer');
  for (let id = 1; id <= 4; id++) await complete(uid, id);
  assert.equal((await points(uid)).pontos, 600);
  await enroll(uid, 'Negocios');
  assert.equal((await points(uid)).pontos, 600);
  const updated = await complete(uid, 1);
  assert.equal(updated.totalPontos, 700);
  assert.equal(updated.pontosGanhos, 100);
  const ranking = await call(obterRanking, uid);
  assert.equal(ranking.ranking.find((u) => u.uid === uid).pontos, 700);
});

test('retaking the quiz preserves previously earned points', async () => {
  const uid = 'cumulative-quiz';
  await enroll(uid, 'Fullstack Developer');
  await complete(uid, 1);
  await call(gerarTrilha, uid, {
    profile: { interestCode: 'MARKETING', experienceCode: 'BEGINNER', goalCode: 'JOB' },
  });
  assert.equal((await points(uid)).pontos, 100);
  assert.equal((await complete(uid, 1)).totalPontos, 200);
});

test('undo and redo never pay the same module or completion bonus twice', async () => {
  const uid = 'cumulative-toggle';
  await enroll(uid, 'Fullstack Developer');
  for (let id = 1; id <= 4; id++) await complete(uid, id);
  await call(atualizarStatusNo, uid, { status: 'in-progress' }, { id: '4' });
  assert.equal((await points(uid)).pontos, 600);
  const again = await complete(uid, 4);
  assert.equal(again.pontosGanhos, 0);
  assert.equal(again.totalPontos, 600);
});

test('restarting the same content cannot farm extra points', async () => {
  const uid = 'cumulative-repeat';
  await enroll(uid, 'Fullstack Developer');
  for (let id = 1; id <= 4; id++) await complete(uid, id);
  await enroll(uid, 'Fullstack Developer');
  for (let id = 1; id <= 4; id++) {
    const r = await complete(uid, id);
    assert.equal(r.pontosGanhos, 0);
  }
  assert.equal((await points(uid)).pontos, 600);
});

test('concurrent completion requests award a module only once', async () => {
  const uid = 'cumulative-concurrent';
  await enroll(uid, 'Fullstack Developer');
  const results = await Promise.all([complete(uid, 1), complete(uid, 1)]);
  assert.equal(
    results.reduce((sum, r) => sum + r.pontosGanhos, 0),
    100,
  );
  assert.equal((await points(uid)).pontos, 100);
});
