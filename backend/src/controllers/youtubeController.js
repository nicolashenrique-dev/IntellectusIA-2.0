import he from 'he';

const obterVideosFallback = (tema, nivel) => {
    return [
        {
            id: 'Ke90Tje7VS0',
            titulo: `Curso de ${tema} Completo - Do Zero ao Avançado`,
            canal: 'Rocketseat',
            thumbnail: 'https://img.youtube.com/vi/Ke90Tje7VS0/mqdefault.jpg',
            url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0'
        },
        {
            id: 'IP4z566vO9U',
            titulo: `${tema} para Iniciantes - Passo a Passo em Português`,
            canal: 'Curso em Vídeo',
            thumbnail: 'https://img.youtube.com/vi/IP4z566vO9U/mqdefault.jpg',
            url: 'https://www.youtube.com/watch?v=IP4z566vO9U'
        },
        {
            id: 'S9uPNppGsGo',
            titulo: `O que você precisa saber sobre ${tema} em 2026`,
            canal: 'Filipe Deschamps',
            thumbnail: 'https://img.youtube.com/vi/S9uPNppGsGo/mqdefault.jpg',
            url: 'https://www.youtube.com/watch?v=S9uPNppGsGo'
        },
        {
            id: 'Fsv47zT2TFY',
            titulo: `Prática Guiada de ${tema}: Criando um Projeto Real`,
            canal: 'DevMedia',
            thumbnail: 'https://img.youtube.com/vi/Fsv47zT2TFY/mqdefault.jpg',
            url: 'https://www.youtube.com/watch?v=Fsv47zT2TFY'
        }
    ];
};

const buscarVideosScraper = async (tema, nivel) => {
    try {
        const query = `${tema} ${nivel || ''} tutorial completo portugues`;
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        
        if (!res.ok) throw new Error('Status ' + res.status);
        
        const html = await res.text();
        const match = html.match(/ytInitialData\s*=\s*({.+?});/);
        if (!match) throw new Error('ytInitialData não encontrado');
        
        const data = JSON.parse(match[1]);
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
        
        const videos = [];
        for (const item of contents) {
            if (videos.length >= 4) break;
            
            const videoRenderer = item.videoRenderer;
            if (!videoRenderer) continue;
            
            const videoId = videoRenderer.videoId;
            const titulo = videoRenderer.title?.runs?.[0]?.text || '';
            const canal = videoRenderer.ownerText?.runs?.[0]?.text || '';
            const thumbnail = videoRenderer.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            
            if (videoId && titulo) {
                videos.push({
                    id: videoId,
                    titulo,
                    canal,
                    thumbnail,
                    url: `https://www.youtube.com/watch?v=${videoId}`
                });
            }
        }
        
        return videos.length > 0 ? videos : null;
    } catch (err) {
        console.error('Erro no YouTube Scraper (usando fallback mock):', err.message);
        return null;
    }
};

export const buscarVideosYoutube = async (req, res) => {
    const { tema, nivel } = req.query;

    if (!tema) {
        return res.status(400).json({ success: false, message: 'O parâmetro "tema" é obrigatório.' });
    }

    try {
        const chaveApi = process.env.YOUTUBE_API_KEY;

        if (!chaveApi) {
            console.log(`Buscando vídeos para: ${tema} (Fallback Scraper - Chave não configurada)`);
            const scrapedVideos = await buscarVideosScraper(tema, nivel);
            if (scrapedVideos) {
                return res.status(200).json({ success: true, videos: scrapedVideos });
            }
            return res.status(200).json({ success: true, videos: obterVideosFallback(tema, nivel) });
        }

        console.log(`Buscando vídeos para: ${tema} (${nivel || 'Não especificado'}) via YouTube API`);

        const parametros = new URLSearchParams({
            part: 'snippet',
            q: `${tema} ${nivel || ''} tutorial completo português`,
            type: 'video',
            maxResults: '4',
            relevanceLanguage: 'pt',
            key: chaveApi
        });

        const url = `https://www.googleapis.com/youtube/v3/search?${parametros.toString()}`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!resposta.ok) {
            console.error('Erro API YouTube (usando fallback scraper/mock):', dados.error);
            const scrapedVideos = await buscarVideosScraper(tema, nivel);
            if (scrapedVideos) {
                return res.status(200).json({ success: true, videos: scrapedVideos });
            }
            return res.status(200).json({ success: true, videos: obterVideosFallback(tema, nivel) });
        }

        const listaItens = dados.items || [];

        const videos = listaItens.map(item => ({
            id: item.id.videoId,
            titulo: item.snippet?.title ? he.decode(item.snippet.title) : '',
            canal: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        console.log(`Encontrados ${videos.length} vídeos via API.`);
        return res.status(200).json({ success: true, videos });

    } catch (erro) {
        console.error('Erro ao buscar vídeos do YouTube (usando fallback scraper/mock):', erro.message);
        const scrapedVideos = await buscarVideosScraper(tema, nivel);
        if (scrapedVideos) {
            return res.status(200).json({ success: true, videos: scrapedVideos });
        }
        return res.status(200).json({ success: true, videos: obterVideosFallback(tema, nivel) });
    }
};