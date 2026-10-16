import he from 'he';

const extrairTexto = (valor) => {
  if (!valor) return '';

  if (typeof valor === 'string') return valor.trim();

  if (Array.isArray(valor)) {
    return valor.map((item) => extrairTexto(item)).join('');
  }

  if (valor.runs) {
    return valor.runs.map((run) => extrairTexto(run.text)).join('');
  }

  if (valor.accessibility?.accessibilityData?.label) {
    return extrairTexto(valor.accessibility.accessibilityData.label);
  }

  if (valor.simpleText) {
    return extrairTexto(valor.simpleText);
  }

  return '';
};

export const extrairVideosDaPaginaYoutube = (data) => {
  if (!data || typeof data !== 'object') return [];

  const itens = [];
  const visitar = (nodo) => {
    if (!nodo) return;

    const lista = Array.isArray(nodo) ? nodo : [nodo];

    for (const item of lista) {
      if (!item || typeof item !== 'object') continue;

      const renderers = [
        item.videoRenderer,
        item.gridVideoRenderer,
        item.reelItemRenderer,
        item?.richItemRenderer?.content?.videoRenderer,
        item?.richItemRenderer?.content?.reelItemRenderer,
        item?.shortsLockupViewModel?.videoRenderer,
      ].filter(Boolean);

      for (const videoRenderer of renderers) {
        const videoId = videoRenderer.videoId;
        const titulo = extrairTexto(videoRenderer.title);
        const canal =
          extrairTexto(videoRenderer.ownerText) || extrairTexto(videoRenderer.longBylineText);
        const thumbnail =
          videoRenderer.thumbnail?.thumbnails?.at(-1)?.url ||
          videoRenderer.thumbnail?.thumbnails?.[0]?.url ||
          `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

        if (videoId && titulo) {
          itens.push({
            id: videoId,
            titulo,
            canal,
            thumbnail,
            url: `https://www.youtube.com/watch?v=${videoId}`,
          });
        }
      }

      if (itens.length >= 4) return;

      for (const chave of [
        'children',
        'contents',
        'content',
        'itemSectionRenderer',
        'sectionListRenderer',
        'richItemRenderer',
      ]) {
        if (item[chave]) {
          visitar(item[chave]);
        }
      }
    }
  };

  const containers =
    data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents ||
    data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.richGridRenderer?.contents ||
    data.onResponseReceivedCommands?.flatMap(
      (cmd) => cmd?.appendContinuationItemsAction?.continuationItems || [],
    ) ||
    [];

  visitar(containers);

  return Array.from(new Map(itens.map((video) => [video.id, video])).values()).slice(0, 4);
};

const buscarVideosScraper = async (tema, nivel) => {
  try {
    const query = tema;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!res.ok) throw new Error('Status ' + res.status);

    const html = await res.text();
    const match = html.match(
      /(?:var\s+ytInitialData|window\["ytInitialData"\]|ytInitialData)\s*=\s*({[\s\S]+?});/,
    );
    if (!match) throw new Error('ytInitialData não encontrado');

    const data = JSON.parse(match[1]);
    const videos = extrairVideosDaPaginaYoutube(data);

    return videos.length > 0 ? videos : null;
  } catch (err) {
    console.error('Busca de vídeos na página do YouTube indisponível:', err.message);
    return null;
  }
};

export const buscarVideosYoutube = async (req, res) => {
  const tema = typeof req.query.tema === 'string' ? req.query.tema.trim() : '';
  const nivel = typeof req.query.nivel === 'string' ? req.query.nivel.trim() : '';
  if (!tema || tema.length > 250 || nivel.length > 100) {
    return res
      .status(400)
      .json({ success: false, message: 'Informe um tema válido para buscar vídeos.' });
  }
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${tema} ${nivel} aula português`)}`;
  const chaveApi = process.env.YOUTUBE_API_KEY;
  if (chaveApi) {
    try {
      const parametros = new URLSearchParams({
        part: 'snippet',
        q: tema,
        type: 'video',
        maxResults: '4',
        relevanceLanguage: 'pt',
        key: chaveApi,
      });
      const resposta = await fetch(`https://www.googleapis.com/youtube/v3/search?${parametros}`, {
        signal: AbortSignal.timeout(6000),
      });
      if (!resposta.ok) throw new Error(`YouTube API: HTTP ${resposta.status}`);
      const dados = await resposta.json();
      const videos = (dados.items || [])
        .filter((item) => item.id?.videoId && item.snippet?.title)
        .map((item) => ({
          id: item.id.videoId,
          titulo: he.decode(item.snippet.title),
          canal: item.snippet.channelTitle || '',
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
      if (videos.length)
        return res.status(200).json({ success: true, videos, source: 'youtube-api', searchUrl });
    } catch (error) {
      console.warn('Busca oficial de vídeos indisponível:', error.message);
    }
  }
  const videos = await buscarVideosScraper(tema, nivel);
  if (videos?.length)
    return res.status(200).json({ success: true, videos, source: 'youtube-search', searchUrl });
  return res.status(200).json({
    success: true,
    videos: [],
    source: 'unavailable',
    searchUrl,
    message:
      'A busca automática está indisponível. Você pode pesquisar este módulo diretamente no YouTube.',
  });
};
