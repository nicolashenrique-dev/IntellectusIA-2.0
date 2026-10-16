import test from 'node:test';
import assert from 'node:assert/strict';
// Explicit isolated configuration: never writes to a real Firebase project.
process.env.NODE_ENV = 'test';
process.env.FIREBASE_SERVICE_ACCOUNT = '';
process.env.GEMINI_API_KEY = '';
const { gerarTrilha, inscreverTrilha, obterTrilhaUsuario, atualizarStatusNo } = await import(
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
test('fallback respeita os interesses enviados pelo questionário', async () => {
  for (const [interest, match] of [
    ['Design de Produto & UI/UX', /design/i],
    ['Ciência de Dados & Analytics', /dados/i],
    ['Negócios, Produto & Marketing', /marketing/i],
  ]) {
    const r = await call(gerarTrilha, { uid: `test-${interest}`, profile: { interest } });
    assert.equal(r.code, 200);
    assert.match(r.body.roadmap.title, match);
    assert.equal(r.body.roadmap.nodes[0].status, 'in-progress');
    assert.ok(r.body.roadmap.nodes.slice(1).every((n) => n.status === 'locked'));
  }
});
test('conclusão desbloqueia o próximo módulo sem alterar outra inscrição', async () => {
  for (const uid of ['test-a', 'test-b'])
    await call(inscreverTrilha, { uid, trilhaName: 'Fullstack Developer' });
  const updated = await call(
    atualizarStatusNo,
    { uid: 'test-a', status: 'completed' },
    { id: '1' },
  );
  assert.equal(updated.body.roadmap.nodes[1].status, 'in-progress');
  const other = await call(obterTrilhaUsuario, {}, { uid: 'test-b' });
  assert.equal(other.body.roadmap.nodes[0].status, 'in-progress');
  assert.equal(other.body.roadmap.nodes[1].status, 'locked');
});
test('status inválido é rejeitado', async () => {
  const r = await call(atualizarStatusNo, { uid: 'test-a', status: 'invalid' }, { id: '1' });
  assert.equal(r.code, 400);
});
test('refazer questionário substitui a trilha retornada para a mesma conta', async () => {
  const uid = 'test-replacement';
  await call(gerarTrilha, {
    uid,
    profile: { interestCode: 'TI', experienceCode: 'BEGINNER', goalCode: 'JOB' },
  });
  const created = await call(gerarTrilha, {
    uid,
    profile: { interestCode: 'MARKETING', experienceCode: 'ADVANCED', goalCode: 'TRANSITION' },
  });
  const read = await call(obterTrilhaUsuario, {}, { uid });
  assert.deepEqual(read.body.roadmap, created.body.roadmap);
  assert.equal(read.body.roadmap.profile.interestCode, 'MARKETING');
  assert.match(read.body.roadmap.nodes[0].label, /crescimento/);
});
