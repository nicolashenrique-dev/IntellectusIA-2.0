import { Ollama } from 'ollama';

// Mock de segurança caso não esteja importado globalmente
const TRILHAS_PADRAO = {
    'Tecnologia e Programação': {
        titulo: 'Desenvolvimento Web Fullstack',
        descricao: 'Uma trilha completa do HTML ao React, passando por Node.js.',
        duracao_estimada: '6 meses',
        modulos: [
            { ordem: 1, nome: 'HTML & CSS Moderno', descricao: 'Fundamentos de marcação e estilização.', duracao: '2 semanas' },
            { ordem: 2, nome: 'JavaScript ES6+', descricao: 'Linguagem base para o desenvolvimento web.', duracao: '4 semanas' },
            { ordem: 3, nome: 'React.js', descricao: 'Biblioteca para interfaces de usuário.', duracao: '6 semanas' }
        ]
    },
    'Ciência de Dados': {
        titulo: 'Ciência de Dados com Python',
        descricao: 'Da análise exploratória ao Machine Learning aplicado.',
        duracao_estimada: '8 meses',
        modulos: [
            { ordem: 1, nome: 'Python para Dados', descricao: 'Sintaxe e bibliotecas base como NumPy.', duracao: '3 semanas' },
            { ordem: 2, nome: 'Pandas & Análise', descricao: 'Manipulação de grandes volumes de dados.', duracao: '5 semanas' }
        ]
    }
};

export const recomendarTrilha = async (req, res) => {
    const { interesse, nivel, objetivo } = req.body;
    let timeoutId;

    try {
        console.log('Iniciando chamada ao Ollama...');
        const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        const ollama = new Ollama({ host: ollamaHost });

        // Promise de Timeout com limpeza de ID
        const timeout = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Ollama Timeout (10s)')), 10000);
        });

        const chatOllama = ollama.chat({
            model: 'llama3.1',
            messages: [{
                role: 'user',
                content: `Recomende trilha de estudos JSON para: Interesse: ${interesse}, Nível: ${nivel}, Objetivo: ${objetivo}. Formato: {"titulo":"...","descricao":"...","duracao_estimada":"...","modulos":[{"ordem":1,"nome":"...","descricao":"...","duracao":"..."}],"palavras_chave":["..."]}. Retorne APENAS o JSON Puro, sem formatação markdown ou blocos de código.`
            }],
        });

        // Executa a corrida
        const resposta = await Promise.race([chatOllama, timeout]);
        clearTimeout(timeoutId); // Limpa o timeout para evitar vazamento de memória

        console.log('Resposta do Ollama recebida com sucesso.');
        const conteudo = resposta.message.content.trim();
        const jsonMatch = conteudo.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error('JSON inválido retornado pela IA');

        const trilha = JSON.parse(jsonMatch[0]);

        // Retorno explícito mata a execução da função aqui
        return res.status(200).json({ success: true, recomendacao: trilha, fonte: 'ollama' });

    } catch (erroOllama) {
        clearTimeout(timeoutId); // Garante a limpeza em caso de erro/timeout
        if (erroOllama.message.includes('ECONNREFUSED')) {
            console.error('Falha no Ollama: Conexão recusada. Verifique o host.');
        } else {
            console.error('Falha no Ollama:', erroOllama.message);
        }

        // O fluxo continua naturalmente para o fallback apenas se cair aqui
    }

    // --- BLOCO FALLBACK ---
    console.log('Aplicando rota de Fallback...');
    const trilhaPadrao = TRILHAS_PADRAO[interesse] || {
        titulo: `Trilha de ${interesse || 'Tecnologia'}`,
        descricao: `Trilha personalizada para ${nivel || 'Iniciante'} com foco em ${objetivo || 'Estudo'}`,
        duracao_estimada: '4 meses',
        modulos: [
            { ordem: 1, nome: 'Fundamentos', descricao: 'Base essencial da área', duracao: '3 semanas' },
            { ordem: 2, nome: 'Prática Guiada', descricao: 'Projetos hands-on', duracao: '4 semanas' },
            { ordem: 3, nome: 'Projeto Real', descricao: 'Portfólio profissional', duracao: '5 semanas' },
        ]
    };

    return res.status(200).json({
        success: true,
        recomendacao: { ...trilhaPadrao, palavras_chave: [interesse, nivel] },
        fonte: 'padrao',
        aviso: 'Recomendação gerada via fallback (Ollama indisponível).'
    });
};