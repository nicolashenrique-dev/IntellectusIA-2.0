import test from 'node:test';
import assert from 'node:assert/strict';
import { extrairVideosDaPaginaYoutube } from '../src/controllers/youtubeController.js';

test('extrai vídeos mesmo quando os resultados vêm em richItemRenderer', () => {
  const payload = {
    contents: {
      twoColumnSearchResultsRenderer: {
        primaryContents: {
          sectionListRenderer: {
            contents: [
              {
                itemSectionRenderer: {
                  contents: [
                    {
                      richItemRenderer: {
                        content: {
                          videoRenderer: {
                            videoId: 'abc123',
                            title: { runs: [{ text: 'Curso de JavaScript' }] },
                            ownerText: { runs: [{ text: 'Dev Brasil' }] },
                            thumbnail: {
                              thumbnails: [
                                { url: 'https://img.youtube.com/vi/abc123/mqdefault.jpg' },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  };

  const videos = extrairVideosDaPaginaYoutube(payload);

  assert.equal(videos.length, 1);
  assert.equal(videos[0].id, 'abc123');
  assert.equal(videos[0].titulo, 'Curso de JavaScript');
  assert.equal(videos[0].canal, 'Dev Brasil');
});

test('falhas externas não devolvem vídeos e títulos inventados', async () => {
  const { buscarVideosYoutube } = await import('../src/controllers/youtubeController.js');
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.YOUTUBE_API_KEY;
  try {
    process.env.YOUTUBE_API_KEY = 'test-only';
    globalThis.fetch = async () => {
      throw new Error('offline');
    };
    const res = {
      status(code) {
        this.code = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
    await buscarVideosYoutube({ query: { tema: 'Pesquisa UX', nivel: 'Avançado' } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body.videos, []);
    assert.equal(res.body.source, 'unavailable');
    assert.match(decodeURIComponent(res.body.searchUrl), /Pesquisa UX Avançado/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = originalKey;
  }
});
