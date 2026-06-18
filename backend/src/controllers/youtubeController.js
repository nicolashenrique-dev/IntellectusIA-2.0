import he from 'he';

export const buscarVideosYoutube = async (req, res) => {
    try {
        const { tema, nivel } = req.query;
        const chaveApi = process.env.YOUTUBE_API_KEY;

        if (!chaveApi) {
            return res.status(500).json({ success: false, message: 'Chave da API do YouTube não configurada.' });
        }

        if (!tema) {
            return res.status(400).json({ success: false, message: 'O parâmetro "tema" é obrigatório.' });
        }

        console.log(`Buscando vídeos para: ${tema} (${nivel || 'Não especificado'})`);

        // Montagem segura e limpa dos parâmetros da URL
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
            console.error('Erro API YouTube:', dados.error);
            throw new Error(dados.error?.message || 'Erro na API do YouTube');
        }

        // Garante que o retorno possui itens antes de mapear
        const listaItens = dados.items || [];

        const videos = listaItens.map(item => ({
            id: item.id.videoId,
            titulo: item.snippet?.title ? he.decode(item.snippet.title) : '', // Correção: Chamando a biblioteca he com segurança
            canal: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        console.log(`Encontrados ${videos.length} vídeos.`);
        return res.status(200).json({ success: true, videos });

    } catch (erro) {
        console.error('Erro ao buscar vídeos do YouTube:', erro.message);
        return res.status(500).json({ success: false, message: 'Erro ao buscar vídeos: ' + erro.message });
    }
};