import { Ollama } from 'ollama';
import { adminDb } from '../config/firebase.js';

// Memória local para armazenamento de mock quando o Firebase não está disponível (Mock Mode)
const MOCK_DB = {};

const TRILHAS_PADRAO = {
    'Tecnologia e Programação': {
        title: 'Desenvolvimento Web Fullstack',
        description: 'Uma trilha completa do HTML ao React, passando por Node.js.',
        nodes: [
            { id: 1, label: 'HTML & CSS Moderno', status: 'completed', level: 'Iniciante', description: 'Fundamentos de marcação e estilização.' },
            { id: 2, label: 'JavaScript ES6+', status: 'in-progress', level: 'Intermediário', description: 'Linguagem base para o desenvolvimento web.' },
            { id: 3, label: 'React.js', status: 'locked', level: 'Intermediário', description: 'Biblioteca para interfaces de usuário.' },
            { id: 4, label: 'Node.js & Express', status: 'locked', level: 'Avançado', description: 'Backend e APIs REST.' }
        ]
    },
    'Ciência de Dados': {
        title: 'Ciência de Dados com Python',
        description: 'Da análise exploratória ao Machine Learning aplicado.',
        nodes: [
            { id: 1, label: 'Python para Dados', status: 'completed', level: 'Iniciante', description: 'Sintaxe e bibliotecas base como NumPy.' },
            { id: 2, label: 'Pandas & Análise', status: 'in-progress', level: 'Intermediário', description: 'Manipulação de grandes volumes de dados.' },
            { id: 3, label: 'Machine Learning', status: 'locked', level: 'Avançado', description: 'Modelos preditivos e inteligência artificial.' }
        ]
    }
};

export const gerarTrilha = async (req, res) => {
    try {
        const { profile, uid } = req.body;

        // Destruturação segura para evitar quebra se profile for undefined
        const { interest, experience, goal } = profile || {};

        if (!interest) {
            return res.status(400).json({ success: false, message: 'O campo "interest" (Área de interesse) é obrigatório.' });
        }

        let trilhaFinal = null;
        let timeoutId = null;

        // 1. Tentar geração inteligente via AI local
        try {
            console.log(`Solicitando trilha personalizada ao Ollama para a área: ${interest}...`);

            // Defina a URL correta do seu servidor Ollama (ex: localhost ou IP da VPS)
            const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
            const ollama = new Ollama({ host: ollamaHost });

            // Promise de Timeout que permite limpeza posterior
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('Timeout Ollama (12s)')), 12000);
            });

            const aiPromise = ollama.chat({
                model: 'llama3.1',
                messages: [{
                    role: 'user',
                    content: `Gere uma trilha de estudos estruturada em JSON para: Área: ${interest}, Experiência: ${experience || 'Não informada'}, Objetivo: ${goal || 'Desenvolvimento Profissional'}. Formato estrito esperado: {"title":"...","description":"...","nodes":[{"id":1,"label":"...","description":"...","status":"locked","level":"Iniciante"}]}. Observação: O primeiro nó deve vir com status "in-progress" e os demais como "locked". Retorne APENAS o objeto JSON puro, sem markdown.`
                }],
            });

            // Executa a corrida
            const response = await Promise.race([aiPromise, timeoutPromise]);
            clearTimeout(timeoutId); // Evita o vazamento de memória se a IA responder a tempo

            const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const aiData = JSON.parse(jsonMatch[0]);
                trilhaFinal = {
                    ...aiData,
                    createdAt: new Date().toISOString(),
                    fonte: 'ollama'
                };
                console.log('Trilha customizada via AI gerada com sucesso.');
            }
        } catch (err) {
            if (timeoutId) clearTimeout(timeoutId); // Garante a limpeza caso ocorra outro erro antes do tempo
            console.error('Falha ao gerar trilha com AI (Ollama):', err.message);
        }

        // 2. Fallback resiliente
        if (!trilhaFinal) {
            console.log('Usando trilha padrão via Fallback do sistema.');
            const base = TRILHAS_PADRAO[interest] || TRILHAS_PADRAO['Tecnologia e Programação'];
            trilhaFinal = {
                ...base,
                createdAt: new Date().toISOString(),
                fonte: 'fallback'
            };
        }

        // 3. Persistir a trilha
        if (uid) {
            if (adminDb) {
                try {
                    await adminDb.collection('users').doc(uid).set({ trilha: trilhaFinal }, { merge: true });
                    console.log(`Trilha salva no Firestore para o usuário: ${uid}`);
                } catch (e) {
                    console.error('Erro ao salvar no firebase:', e);
                    MOCK_DB[uid] = trilhaFinal; // Fallback para Mock
                }
            } else {
                MOCK_DB[uid] = trilhaFinal;
                console.log(`Trilha salva no MockDB para o usuário: ${uid}`);
            }
        }

        // 4. Resposta para o cliente
        return res.status(200).json({
            success: true,
            roadmap: trilhaFinal
        });

    } catch (error) {
        console.error('Erro catastrófico no endpoint gerarTrilha:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao processar a requisição' });
    }
};

export const obterTrilhaUsuario = async (req, res) => {
    try {
        const { uid } = req.params;
        let trilha = null;

        if (adminDb) {
            try {
                const docUsuario = await adminDb.collection('users').doc(uid).get();
                if (docUsuario.exists && docUsuario.data().trilha) {
                    trilha = docUsuario.data().trilha;
                }
            } catch (e) {
                trilha = MOCK_DB[uid];
            }
        } else {
            trilha = MOCK_DB[uid];
        }

        if (!trilha) {
            return res.status(404).json({ success: false, message: 'Trilha não encontrada para este usuário.' });
        }

        return res.status(200).json({ success: true, roadmap: trilha });
    } catch (error) {
        console.error('Erro ao buscar trilha do usuário:', error);
        return res.status(500).json({ success: false, message: 'Erro ao buscar trilha do usuário.' });
    }
};

export const obterTrilhaPorId = async (req, res) => {
    const trilhaBase = Object.values(TRILHAS_PADRAO).find((trilha) => String(trilha.nodes?.[0]?.id) === req.params.id);

    if (trilhaBase) {
        return res.status(200).json({ success: true, roadmap: { id: req.params.id, ...trilhaBase } });
    }

    return res.status(200).json({
        success: true,
        roadmap: {
            id: req.params.id,
            title: 'Fullstack Web Development',
            description: 'Uma trilha completa para se tornar desenvolvedor fullstack.',
            nodes: TRILHAS_PADRAO['Tecnologia e Programação'].nodes
        }
    });
};

export const atualizarStatusNo = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, uid } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'O campo "status" é obrigatório.' });
        }

        const statusValidos = ['completed', 'in-progress', 'locked'];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status inválido. Use: ${statusValidos.join(', ')}`
            });
        }

        if (!uid) {
            return res.status(400).json({ success: false, message: 'UID do usuário é obrigatório.' });
        }

        let trilha = null;

        if (adminDb) {
            try {
                const docRef = adminDb.collection('users').doc(uid);
                const docUsuario = await docRef.get();
                if (docUsuario.exists) trilha = docUsuario.data().trilha;
            } catch (e) {
                trilha = MOCK_DB[uid];
            }
        } else {
            trilha = MOCK_DB[uid];
        }

        if (!trilha || !trilha.nodes) {
            return res.status(404).json({ success: false, message: 'Trilha do usuário não encontrada.' });
        }

        const indiceNo = trilha.nodes.findIndex((no) => String(no.id) === String(id));

        if (indiceNo === -1) {
            return res.status(404).json({ success: false, message: 'Nó da trilha não encontrado.' });
        }

        trilha.nodes[indiceNo].status = status;

        // Auto-unlock next module if completed
        if (status === 'completed' && indiceNo < trilha.nodes.length - 1) {
            if (trilha.nodes[indiceNo + 1].status === 'locked') {
                trilha.nodes[indiceNo + 1].status = 'in-progress';
            }
        }

        if (adminDb) {
            try {
                await adminDb.collection('users').doc(uid).set({ trilha }, { merge: true });
            } catch (e) {
                MOCK_DB[uid] = trilha;
            }
        } else {
            MOCK_DB[uid] = trilha;
        }

        return res.status(200).json({
            success: true,
            message: `Status do nó ${id} atualizado para ${status}`,
            node: trilha.nodes[indiceNo],
            roadmap: trilha
        });
    } catch (error) {
        console.error('Erro ao atualizar status do nó:', error);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar status do nó.' });
    }
};