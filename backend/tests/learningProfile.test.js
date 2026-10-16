import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeProfile,
  buildFallback,
  normalizeGeneratedRoadmap,
} from '../src/services/learningProfile.js';
test('as 36 combinações do questionário geram conteúdos diferentes', () => {
  const variations = new Set();
  for (const interestCode of ['TI', 'DESIGN', 'DATA', 'MARKETING']) {
    const levelContents = new Set();
    for (const experienceCode of ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']) {
      for (const goalCode of ['JOB', 'TRANSITION', 'SPECIALIZATION']) {
        const profile = normalizeProfile({ interestCode, experienceCode, goalCode });
        const trail = buildFallback(profile);
        variations.add(JSON.stringify(trail.nodes.map((n) => [n.label, n.description])));
        levelContents.add(JSON.stringify(trail.nodes.slice(0, 4).map((n) => n.label)));
        assert.equal(trail.level, profile.experience);
        assert.equal(trail.nodes[0].status, 'in-progress');
        assert.ok(trail.nodes.slice(1).every((n) => n.status === 'locked'));
      }
    }
    assert.equal(levelContents.size, 3);
  }
  assert.equal(variations.size, 36);
});
test('respostas antigas e novas são compatíveis e interesses desconhecidos são rejeitados', () => {
  const profile = normalizeProfile({
    interest: 'Design de Produto & UI/UX',
    experience: 'Avançado (Busca refinamento técnico e arquitetura)',
    goal: 'Transição estratégica de carreira',
  });
  assert.equal(profile.interestCode, 'DESIGN');
  assert.equal(profile.experienceCode, 'ADVANCED');
  assert.equal(profile.goalCode, 'TRANSITION');
  assert.throws(() => normalizeProfile({ interest: 'desconhecido' }));
});
test('respostas incompletas da IA não são salvas como trilhas válidas', () => {
  const p = normalizeProfile({ interestCode: 'TI' });
  for (const bad of [
    null,
    {},
    { title: 'Vazia', nodes: [] },
    { title: 'Inválida', nodes: [{ label: 'a' }, {}] },
  ])
    assert.throws(() => normalizeGeneratedRoadmap(bad, p));
  const trail = normalizeGeneratedRoadmap(
    {
      title: 'Web',
      nodes: [
        { id: 9, label: 'A', status: 'completed' },
        { id: 9, label: 'B', status: 'completed' },
      ],
    },
    p,
  );
  assert.deepEqual(
    trail.nodes.map((n) => [n.id, n.status]),
    [
      [1, 'in-progress'],
      [2, 'locked'],
    ],
  );
});
