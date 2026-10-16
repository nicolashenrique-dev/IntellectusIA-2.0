import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validatePersonalizedRoadmap,
  validateSavedRoadmap,
} from '../src/utils/personalizedRoadmap.mjs'
const profile = { interestCode: 'MARKETING', experienceCode: 'BEGINNER', goalCode: 'JOB' }
const roadmap = () => ({
  title: 'Marketing',
  profile: { ...profile },
  nodes: [
    { id: 1, label: 'Marketing', status: 'in-progress' },
    { id: 2, label: 'Pesquisa de mercado', status: 'locked' },
  ],
})

test('accepts a personalized roadmap that was saved without changes', () => {
  const generated = roadmap()
  assert.doesNotThrow(() => validateSavedRoadmap(generated, structuredClone(generated), profile))
})
test('rejects the legacy frontend fallback returned for a business profile', () => {
  assert.throws(() =>
    validatePersonalizedRoadmap(
      { title: 'Fullstack', nodes: [{ label: 'HTML' }, { label: 'React' }] },
      profile,
    ),
  )
})
test('rejects changes to area, level or objective', () => {
  for (const [field, value] of [
    ['interestCode', 'TI'],
    ['experienceCode', 'ADVANCED'],
    ['goalCode', 'TRANSITION'],
  ]) {
    const data = roadmap()
    data.profile[field] = value
    assert.throws(() => validatePersonalizedRoadmap(data, profile))
  }
})
test('rejects stale saved modules even when the profile codes match', () => {
  const generated = roadmap()
  const saved = roadmap()
  saved.nodes[0].label = 'HTML & CSS Moderno'
  assert.throws(() => validateSavedRoadmap(generated, saved, profile))
})

test('accepts saved modules when storage changes object field order', () => {
  const generated = roadmap()
  const saved = roadmap()
  saved.nodes = saved.nodes.map((node) => ({ status: node.status, label: node.label, id: node.id }))
  assert.doesNotThrow(() => validateSavedRoadmap(generated, saved, profile))
})
