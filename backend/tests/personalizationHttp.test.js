import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
process.env.FIREBASE_SERVICE_ACCOUNT = '';
process.env.GEMINI_API_KEY = '';
process.env.JWT_SECRET = 'personalization-isolated-test-secret-more-than-32-bytes';
const { default: app } = await import('../app.js');
const { default: jwt } = await import('jsonwebtoken');
const { jwtSecret } = await import('../src/config/security.js');

test('HTTP completion saves progress and ranking keeps points after switching courses', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const uid = 'progress-ranking-http-test';
  const token = jwt.sign({ uid }, jwtSecret, { expiresIn: '5m' });
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };
  async function request(path, method = 'GET', body) {
    const response = await fetch(base + path, {
      method, headers, ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    assert.equal(response.status, 200, JSON.stringify(data));
    return data;
  }
  try {
    await request('/trilhas/inscrever', 'POST', { trilhaName: 'Fullstack Developer' });
    const completed = await request('/trilhas/no/1', 'PATCH', { status: 'completed' });
    assert.equal(completed.node.status, 'completed');
    assert.equal(completed.roadmap.nodes[1].status, 'in-progress');
    assert.equal(completed.totalPontos, 100);
    assert.equal((await request('/trilhas/usuario/' + uid)).roadmap.nodes[0].status, 'completed');
    await request('/trilhas/inscrever', 'POST', { trilhaName: 'Negócios e Marketing' });
    const saved = await request('/trilhas/usuario/' + uid);
    assert.equal(saved.pontuacao.pontos, 100);
    assert.equal(saved.roadmap.nodes[0].status, 'in-progress');
    assert.equal((await request('/trilhas/ranking')).usuarioAtual.pontos, 100);
    assert.equal((await request('/trilhas/no/1', 'PATCH', { status: 'completed' })).totalPontos, 200);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test('HTTP profile changes replace saved content, difficulty and objective on the same account', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const uid = 'personalization-http-test';
  const token = jwt.sign({ uid }, jwtSecret, { expiresIn: '5m' });
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };
  const cases = [
    ['TI', 'BEGINNER', 'JOB', /programa/i],
    ['MARKETING', 'BEGINNER', 'JOB', /marketing/i],
    ['DESIGN', 'BEGINNER', 'JOB', /design/i],
    ['DATA', 'BEGINNER', 'JOB', /python/i],
    ['MARKETING', 'ADVANCED', 'SPECIALIZATION', /crescimento/i],
  ];
  try {
    for (const [interestCode, experienceCode, goalCode, firstModule] of cases) {
      const profile = { interestCode, experienceCode, goalCode };
      const generatedResponse = await fetch(base + '/trilhas/gerar', {
        method: 'POST',
        headers,
        body: JSON.stringify({ uid, profile }),
      });
      assert.equal(generatedResponse.status, 200);
      const generated = (await generatedResponse.json()).roadmap;
      const savedResponse = await fetch(base + '/trilhas/usuario/' + uid, { headers });
      assert.equal(savedResponse.status, 200);
      const saved = (await savedResponse.json()).roadmap;
      assert.deepEqual(saved, generated);
      assert.equal(saved.profile.interestCode, interestCode);
      assert.equal(saved.profile.experienceCode, experienceCode);
      assert.equal(saved.profile.goalCode, goalCode);
      assert.match(saved.nodes[0].label, firstModule);
      assert.equal(saved.nodes[0].status, 'in-progress');
      assert.ok(saved.nodes.slice(1).every((node) => node.status === 'locked'));
      if (interestCode === 'MARKETING')
        assert.ok(saved.nodes.every((node) => !/html|css|react|frontend/i.test(node.label)));
    }
    for (const trilhaName of ['Negocios', 'Marketing Digital', 'Produto e Negócios']) {
      const response = await fetch(base + '/trilhas/inscrever', {
        method: 'POST',
        headers,
        body: JSON.stringify({ uid, trilhaName }),
      });
      assert.equal(response.status, 200);
      const roadmap = (await response.json()).roadmap;
      assert.match(roadmap.nodes[0].label, /marketing/i);
    }
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
