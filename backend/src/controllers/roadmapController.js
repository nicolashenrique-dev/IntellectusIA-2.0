import { adminDb } from '../config/firebase.js';

// Memória local para armazenamento de mock quando o Firebase não está disponível (Mock Mode)
const MOCK_DB = {};

const TRILHAS_PADRAO = {
    'Tecnologia e Programação': {
        title: 'Desenvolvimento Web Fullstack',
        description: 'Uma trilha completa do HTML ao React, passando por Node.js.',
        level: 'Intermediário',
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
        level: 'Intermediário',
        nodes: [
            { id: 1, label: 'Python para Dados', status: 'completed', level: 'Iniciante', description: 'Sintaxe e bibliotecas base como NumPy.' },
            { id: 2, label: 'Pandas & Análise', status: 'in-progress', level: 'Intermediário', description: 'Manipulação de grandes volumes de dados.' },
            { id: 3, label: 'Machine Learning', status: 'locked', level: 'Avançado', description: 'Modelos preditivos e inteligência artificial.' }
        ]
    },
    'Fullstack Developer': {
        title: 'Fullstack Developer',
        description: 'Formação completa em frontend e backend com React, Node.js e SQL.',
        level: 'Intermediário',
        nodes: [
            { id: 1, label: 'Lógica e JavaScript ES6+', status: 'in-progress', level: 'Iniciante', description: 'Fundamentos de programação e ES6+.' },
            { id: 2, label: 'React.js Moderno', status: 'locked', level: 'Intermediário', description: 'Componentes, hooks e estado global.' },
            { id: 3, label: 'Backend com Node.js & Express', status: 'locked', level: 'Intermediário', description: 'Construção de APIs REST robustas.' },
            { id: 4, label: 'Banco de Dados SQL & ORM', status: 'locked', level: 'Avançado', description: 'Modelagem, PostgreSQL e Sequelize.' }
        ]
    },
    'UI/UX Specialist': {
        title: 'UI/UX Specialist',
        description: 'Domine wireframing, prototipagem, pesquisa de usuário e testes.',
        level: 'Intermediário',
        nodes: [
            { id: 1, label: 'Fundamentos de Design & UX', status: 'in-progress', level: 'Iniciante', description: 'Princípios visuais e usabilidade.' },
            { id: 2, label: 'Pesquisa com Usuários (UX Research)', status: 'locked', level: 'Intermediário', description: 'Entrevistas, personas e mapeamento de jornada.' },
            { id: 3, label: 'Prototipagem no Figma', status: 'locked', level: 'Intermediário', description: 'Criação de interfaces interativas e design systems.' },
            { id: 4, label: 'Testes de Usabilidade & Heurísticas', status: 'locked', level: 'Avançado', description: 'Validação e melhoria contínua da experiência.' }
        ]
    },
    'Python para Data Science': {
        title: 'Python para Data Science',
        description: 'Domine Python, Pandas, visualização de dados e Machine Learning.',
        level: 'Intermediário',
        nodes: [
            { id: 1, label: 'Fundamentos de Python', status: 'in-progress', level: 'Iniciante', description: 'Sintaxe básica, estruturas de repetição e funções.' },
            { id: 2, label: 'Bibliotecas NumPy & Pandas', status: 'locked', level: 'Intermediário', description: 'Manipulação e análise exploratória de dados.' },
            { id: 3, label: 'Visualização de Dados', status: 'locked', level: 'Intermediário', description: 'Matplotlib e Seaborn para gráficos dinâmicos.' },
            { id: 4, label: 'Modelos de Machine Learning', status: 'locked', level: 'Avançado', description: 'Algoritmos de classificação e regressão.' }
        ]
    },
    'UI/UX Design Moderno': {
        title: 'UI/UX Design Moderno',
        description: 'Aprenda do zero a projetar interfaces incríveis e focadas no usuário.',
        level: 'Iniciante',
        nodes: [
            { id: 1, label: 'Introdução ao Design Visual', status: 'in-progress', level: 'Iniciante', description: 'Cores, tipografia e grids.' },
            { id: 2, label: 'Prototipagem de Alta Fidelidade', status: 'locked', level: 'Intermediário', description: 'Usando componentes e auto-layout no Figma.' },
            { id: 3, label: 'Design Emocional e Negócios', status: 'locked', level: 'Avançado', description: 'UX aplicado a conversão e métricas.' }
        ]
    },
    'DevOps & Cloud na prática': {
        title: 'DevOps & Cloud na prática',
        description: 'Aprenda Docker, CI/CD, containers e infraestrutura de nuvem na AWS.',
        level: 'Avançado',
        nodes: [
            { id: 1, label: 'Fundamentos de Linux e Shell Script', status: 'in-progress', level: 'Iniciante', description: 'Administração de servidores e automação de comandos.' },
            { id: 2, label: 'Containers com Docker', status: 'locked', level: 'Intermediário', description: 'Criação de imagens, volumes e orquestração básica.' },
            { id: 3, label: 'Pipelines CI/CD', status: 'locked', level: 'Intermediário', description: 'Automação de testes e deploy com GitHub Actions.' },
            { id: 4, label: 'Provedores de Cloud (AWS & GCP)', status: 'locked', level: 'Avançado', description: 'Instâncias, VPCs e serviços de storage gerenciados.' }
        ]
    },
    'Fundamentos de IA': {
        title: 'Fundamentos de IA',
        description: 'Aprenda como funcionam redes neurais, inteligência artificial generativa e LLMs.',
        level: 'Avançado',
        nodes: [
            { id: 1, label: 'Matemática para Inteligência Artificial', status: 'in-progress', level: 'Iniciante', description: 'Álgebra linear e probabilidade básica.' },
            { id: 2, label: 'Redes Neurais Artificiais', status: 'locked', level: 'Intermediário', description: 'Perceptron, backpropagation e redes convolucionais.' },
            { id: 3, label: 'Engenharia de Prompt e LLMs', status: 'locked', level: 'Avançado', description: 'Funcionamento de transformers e tuning.' }
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

        // 1. Tentar geração inteligente via API do Gemini
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY não configurada no arquivo .env');
            }

            console.log(`Solicitando trilha personalizada ao Gemini para a área: ${interest}...`);
            const prompt = `Gere uma trilha de estudos estruturada em JSON para: Área: ${interest}, Experiência: ${experience || 'Não informada'}, Objetivo: ${goal || 'Desenvolvimento Profissional'}. Formato estrito esperado: {"title":"...","description":"...","nodes":[{"id":1,"label":"...","description":"...","status":"locked","level":"Iniciante"}]}. Observação: O primeiro nó deve vir com status "in-progress" e os demais como "locked". Retorne APENAS o objeto JSON puro, sem markdown e sem wrap de \`\`\`json.`;

            const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Erro na API do Gemini: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonMatch = contentText.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const aiData = JSON.parse(jsonMatch[0]);
                trilhaFinal = {
                    ...aiData,
                    createdAt: new Date().toISOString(),
                    fonte: 'gemini'
                };
                console.log('Trilha customizada via Gemini gerada com sucesso.');
            }
        } catch (err) {
            console.error('Falha ao gerar trilha com AI (Gemini):', err.message);
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

export const inscreverTrilha = async (req, res) => {
    try {
        const { uid, trilhaName } = req.body;

        if (!uid || !trilhaName) {
            return res.status(400).json({ success: false, message: 'UID e nome da trilha são obrigatórios.' });
        }

        // Tenta achar nos templates padrão
        let template = TRILHAS_PADRAO[trilhaName];
        if (!template) {
            // Tenta mapeamento flexível
            const normalized = trilhaName.toLowerCase();
            if (normalized.includes('fullstack') || normalized.includes('full stack')) {
                template = TRILHAS_PADRAO['Fullstack Developer'] || TRILHAS_PADRAO['Tecnologia e Programação'];
            } else if (normalized.includes('ui/ux') || normalized.includes('ux') || normalized.includes('design')) {
                template = TRILHAS_PADRAO['UI/UX Specialist'] || TRILHAS_PADRAO['UI/UX Design Moderno'];
            } else if (normalized.includes('data science') || normalized.includes('dados') || normalized.includes('python')) {
                template = TRILHAS_PADRAO['Python para Data Science'] || TRILHAS_PADRAO['Ciência de Dados'];
            } else if (normalized.includes('devops') || normalized.includes('cloud')) {
                template = TRILHAS_PADRAO['DevOps & Cloud na prática'];
            } else if (normalized.includes('ia') || normalized.includes('inteligência') || normalized.includes('inteligencia')) {
                template = TRILHAS_PADRAO['Fundamentos de IA'];
            } else if (normalized.includes('introdução') || normalized.includes('introducao') || normalized.includes('lógica') || normalized.includes('logica')) {
                template = TRILHAS_PADRAO['Tecnologia e Programação'];
            }
        }

        if (!template) {
            // Fallback genérico se não achou nada
            template = {
                title: trilhaName,
                description: `Trilha de estudos em ${trilhaName}.`,
                level: 'Iniciante',
                nodes: [
                    { id: 1, label: `Introdução ao ${trilhaName}`, status: 'in-progress', level: 'Iniciante', description: 'Conceitos iniciais e fundamentos.' },
                    { id: 2, label: `Conceitos Intermediários de ${trilhaName}`, status: 'locked', level: 'Intermediário', description: 'Tópicos de nível médio e prática.' },
                    { id: 3, label: `Tópicos Avançados de ${trilhaName}`, status: 'locked', level: 'Avançado', description: 'Domínio avançado e arquitetura.' }
                ]
            };
        }

        const trilhaFinal = {
            ...template,
            createdAt: new Date().toISOString(),
            fonte: 'pre-programada'
        };

        if (adminDb) {
            await adminDb.collection('users').doc(uid).set({ trilha: trilhaFinal }, { merge: true });
        } else {
            MOCK_DB[uid] = trilhaFinal;
        }

        return res.status(200).json({
            success: true,
            message: 'Inscrição na trilha realizada com sucesso.',
            roadmap: trilhaFinal
        });
    } catch (error) {
        console.error('Erro ao inscrever na trilha:', error);
        return res.status(500).json({ success: false, message: 'Erro ao se inscrever na trilha.' });
    }
};