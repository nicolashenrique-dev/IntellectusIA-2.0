import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarJsonGemini } from '../src/services/gemini.js';

function configure(t) {
  const oldKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key';
  t.after(() => {
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
  });
}

test('Gemini service preserves request contract and extracts JSON wrapped in markdown', async (t) => {
  configure(t);
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.match(url, /gemini-flash-latest:generateContent$/);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['X-goog-api-key'], 'test-key');
    assert.deepEqual(JSON.parse(options.body), {
      contents: [{ parts: [{ text: 'test prompt' }] }],
    });
    assert.ok(options.signal instanceof AbortSignal);
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '```json\n{"title":"Web"}\n```' }] } }],
      }),
    };
  });
  assert.deepEqual(await gerarJsonGemini('test prompt'), { title: 'Web' });
});

test('Gemini service rejects HTTP errors without including sensitive response bodies', async (t) => {
  configure(t);
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 429 }));
  await assert.rejects(gerarJsonGemini('prompt'), /429/);
});

test('Gemini service rejects empty or malformed content so callers can use fallback', async (t) => {
  configure(t);
  for (const text of ['', 'not JSON', '{invalid}']) {
    t.mock.method(globalThis, 'fetch', async () => ({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
    }));
    await assert.rejects(gerarJsonGemini('prompt'));
    t.mock.restoreAll();
  }
});

test('Gemini service does not call the network without a key', async (t) => {
  configure(t);
  delete process.env.GEMINI_API_KEY;
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    assert.fail('unexpected network request'),
  );
  await assert.rejects(gerarJsonGemini('prompt'));
  assert.equal(fetchMock.mock.callCount(), 0);
});
