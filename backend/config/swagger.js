const documentacao = {
    openapi: '3.0.0',
    info: {
        title: 'IntelectusIA API',
        version: '1.0.0',
        description: 'API para geração de trilhas de aprendizado personalizadas com IA (Ollama), integração YouTube e gestão de perfil via Firebase.',
    },
    servers: [
        { url: 'http://localhost:3000', description: 'Servidor local' },
        { url: 'https://backend-ten-ecru-93.vercel.app', description: 'Servidor de Produção (Vercel)' },
    ],
    // Protege as rotas globalmente no Swagger
    security: [
        {
            bearerAuth: [],
        },
    ],
    tags: [
        { name: 'Autenticação', description: 'Login, cadastro e recuperação de senha' },
        { name: 'Perfil', description: 'Dados de perfil do usuário' },
        { name: 'Trilhas', description: 'Gerenciamento, geração e progresso de trilhas de estudo' },
        { name: 'Inteligência Artificial', description: 'Recomendações via Ollama e integração com YouTube' },
        { name: 'Itens', description: 'Trilhas e destaques para o dashboard' },
    ],
    paths: {
        '/autenticacao/login': {
            post: {
                tags: ['Autenticação'],
                summary: 'Realiza login do usuário (retorna JWT Token)',
                security: [], // Rota pública
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoLogin' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Login realizado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaLogin' },
                            },
                        },
                    },
                    400: { description: 'Campos obrigatórios ausentes' },
                    401: { description: 'Credenciais inválidas' },
                },
            },
        },
        '/autenticacao/cadastro': {
            post: {
                tags: ['Autenticação'],
                summary: 'Registra um novo usuário',
                security: [], // Rota pública
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoCadastro' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Usuário registrado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaCadastro' },
                            },
                        },
                    },
                    400: { description: 'Dados inválidos' },
                },
            },
        },
        '/autenticacao/recuperar-senha': {
            post: {
                tags: ['Autenticação'],
                summary: 'Solicita e-mail de recuperação de senha',
                security: [], // Rota pública
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoRecuperacao' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Solicitação processada com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaRecuperacao' },
                            },
                        },
                    },
                    400: { description: 'E-mail obrigatório' },
                },
            },
        },
        '/autenticacao/resetar-senha': {
            post: {
                tags: ['Autenticação'],
                summary: 'Redefine a senha com base em um token de recuperação',
                security: [], // Rota pública
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoResetar' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Senha redefinida com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaResetar' },
                            },
                        },
                    },
                    400: { description: 'Campos obrigatórios ausentes' },
                },
            },
        },
        '/autenticacao/usuarios': {
            get: {
                tags: ['Autenticação'],
                summary: 'Lista todos os usuários cadastrados e simulados (Modo Mock)',
                security: [], // Rota pública para ajudar no desenvolvimento/teste
                responses: {
                    200: {
                        description: 'Lista de usuários obtida com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaListaUsuarios' },
                            },
                        },
                    },
                },
            },
        },
        '/autenticacao/perfil/{uid}': {
            get: {
                tags: ['Perfil'],
                summary: 'Obtém dados de perfil do usuário',
                parameters: [
                    {
                        name: 'uid',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        example: 'abc123firebaseuid',
                    },
                ],
                responses: {
                    200: {
                        description: 'Perfil encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaPerfil' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                    404: { description: 'Perfil não encontrado' },
                },
            },
        },
        '/trilhas/gerar': {
            post: {
                tags: ['Trilhas'],
                summary: 'Gera uma trilha de aprendizado personalizada com IA',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoGerarTrilha' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Trilha gerada com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaGerarTrilha' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                    400: { description: 'Dados do quiz inválidos' },
                },
            },
        },
        '/trilhas/usuario/{uid}': {
            get: {
                tags: ['Trilhas'],
                summary: 'Obtém a trilha salva de um usuário específico',
                parameters: [
                    {
                        name: 'uid',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Trilha do usuário retornada com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaTrilhaUsuario' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                    404: { description: 'Trilha não encontrada' },
                },
            },
        },
        '/trilhas/destaques': {
            get: {
                tags: ['Trilhas'],
                summary: 'Lista trilhas recomendadas ou em destaque',
                responses: {
                    200: {
                        description: 'Trilhas em destaque',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaDestaques' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                },
            },
        },
        '/trilhas/{id}': {
            get: {
                tags: ['Trilhas'],
                summary: 'Obtém detalhes de uma trilha específica por ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        example: '1',
                    },
                ],
                responses: {
                    200: {
                        description: 'Detalhes da trilha retornados',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaDetalheTrilha' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                },
            },
        },
        '/trilhas/no/{id}': {
            patch: {
                tags: ['Trilhas'],
                summary: 'Atualiza o status de conclusão de um nó da trilha',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        example: 2,
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoStatusNoTrilha' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Status do nó atualizado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaStatusNoTrilha' },
                            },
                        },
                    },
                    400: { description: 'Dados inválidos' },
                    401: { description: 'Não autorizado' },
                },
            },
        },
        '/ia/recomendar': {
            post: {
                tags: ['Inteligência Artificial'],
                summary: 'Gera uma recomendação direta via Ollama',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoRecomendacaoIA' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Recomendação de IA gerada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaRecomendacaoIA' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                },
            },
        },
        '/ia/videos': {
            get: {
                tags: ['Inteligência Artificial'],
                summary: 'Busca vídeos de apoio integrados com a API do YouTube',
                parameters: [
                    {
                        name: 'tema',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        example: 'React Hooks',
                    },
                    {
                        name: 'nivel',
                        in: 'query',
                        required: false,
                        schema: { type: 'string' },
                        example: 'Iniciante',
                    },
                ],
                responses: {
                    200: {
                        description: 'Vídeos encontrados',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaVideosYoutube' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                    400: { description: 'Tema ausente' },
                },
            },
        },
        '/itens': {
            get: {
                tags: ['Itens'],
                summary: 'Lista todos os itens disponíveis',
                responses: {
                    200: {
                        description: 'Lista de itens',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaItens' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                },
            },
        },
        '/itens/destaques': {
            get: {
                tags: ['Itens'],
                summary: 'Lista trilhas em destaque para exibição inicial',
                responses: {
                    200: {
                        description: 'Itens em destaque',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaDestaques' },
                            },
                        },
                    },
                    401: { description: 'Não autorizado' },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Insira o token JWT (sem a palavra Bearer) para autenticar as requisições.',
            },
        },
        schemas: {
            RequisicaoLogin: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@intelectus.com' },
                    password: { type: 'string', example: '123456' },
                },
            },
            RespostaLogin: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: {
                        type: 'object',
                        properties: {
                            email: { type: 'string', example: 'admin@intelectus.com' },
                            nome: { type: 'string', example: 'Usuário (Mock)' },
                            uid: { type: 'string', example: 'mock-user-uid' },
                        },
                    },
                },
            },
            RequisicaoCadastro: {
                type: 'object',
                required: ['nome', 'email', 'password'],
                properties: {
                    nome: { type: 'string', example: 'Nicolas Silva' },
                    email: { type: 'string', format: 'email', example: 'nicolas@email.com' },
                    password: { type: 'string', example: 'senha123' },
                },
            },
            RespostaCadastro: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Usuário registrado com segurança utilizando encriptação.' },
                    user: {
                        type: 'object',
                        properties: {
                            nome: { type: 'string', example: 'Nicolas Silva' },
                            email: { type: 'string', example: 'nicolas@email.com' },
                            uid: { type: 'string', example: 'node-uid-1718300000000' },
                        },
                    },
                },
            },
            RequisicaoRecuperacao: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'nicolas@email.com' },
                },
            },
            RespostaRecuperacao: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Se um usuário com este e-mail existir, instruções de recuperação foram enviadas.' },
                },
            },
            RequisicaoResetar: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                    token: { type: 'string', example: 'mock-recovery-token' },
                    newPassword: { type: 'string', example: 'novaSenha123' },
                },
            },
            RespostaResetar: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Senha redefinida com sucesso.' },
                },
            },
            RespostaPerfil: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    profile: {
                        type: 'object',
                        properties: {
                            nome: { type: 'string', example: 'Nicolas Silva' },
                            email: { type: 'string', example: 'nicolas@email.com' },
                        },
                    },
                },
            },
            ItemTrilha: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'React para Iniciantes' },
                    level: { type: 'string', example: 'Iniciante' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['React', 'Frontend'] },
                    progress: { type: 'integer', example: 45 },
                },
            },
            RespostaItens: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    itens: { type: 'array', items: { $ref: '#/components/schemas/ItemTrilha' } },
                },
            },
            RespostaDestaques: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    destaques: { type: 'array', items: { $ref: '#/components/schemas/ItemTrilha' } },
                },
            },
            PerfilQuiz: {
                type: 'object',
                required: ['interest'],
                properties: {
                    interest: { type: 'string', example: 'Tecnologia e Programação' },
                    experience: { type: 'string', example: 'Tenho alguma base' },
                    goal: { type: 'string', example: 'Conseguir o primeiro emprego' },
                },
            },
            RequisicaoGerarTrilha: {
                type: 'object',
                required: ['profile'],
                properties: {
                    profile: { $ref: '#/components/schemas/PerfilQuiz' },
                },
            },
            NoTrilha: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    label: { type: 'string', example: 'Introdução ao React' },
                    description: { type: 'string', example: 'Conceitos básicos de componentes e props.' },
                    status: { type: 'string', enum: ['completed', 'in_progress', 'locked'], example: 'in_progress' },
                    level: { type: 'string', example: 'Iniciante' },
                },
            },
            Trilha: {
                type: 'object',
                properties: {
                    title: { type: 'string', example: 'Trilha de Frontend React' },
                    description: { type: 'string', example: 'Trilha personalizada gerada por inteligência artificial.' },
                    nodes: { type: 'array', items: { $ref: '#/components/schemas/NoTrilha' } },
                    createdAt: { type: 'string', format: 'date-time', example: '2026-06-18T22:00:00.000Z' },
                    fonte: { type: 'string', enum: ['ollama', 'fallback'], example: 'ollama' },
                },
            },
            RespostaGerarTrilha: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    roadmap: { $ref: '#/components/schemas/Trilha' },
                },
            },
            RespostaTrilhaUsuario: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    roadmap: { $ref: '#/components/schemas/Trilha' },
                },
            },
            RespostaDetalheTrilha: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    roadmap: { $ref: '#/components/schemas/Trilha' },
                },
            },
            RequisicaoStatusNoTrilha: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['completed', 'in_progress', 'locked'], example: 'completed' },
                    uid: { type: 'string', example: 'abc123firebaseuid' },
                },
            },
            RespostaStatusNoTrilha: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Status atualizado com sucesso.' },
                    node: { $ref: '#/components/schemas/NoTrilha' },
                    roadmap: { $ref: '#/components/schemas/Trilha' },
                },
            },
            RequisicaoRecomendacaoIA: {
                type: 'object',
                required: ['interesse', 'nivel', 'objetivo'],
                properties: {
                    interesse: { type: 'string', example: 'Programação Web' },
                    nivel: { type: 'string', example: 'Intermediário' },
                    objetivo: { type: 'string', example: 'Primeiro emprego na área' },
                },
            },
            ModuloRecomendado: {
                type: 'object',
                properties: {
                    ordem: { type: 'integer', example: 1 },
                    nome: { type: 'string', example: 'CSS Grid e Flexbox' },
                    descricao: { type: 'string', example: 'Técnicas modernas de layout.' },
                    duracao: { type: 'string', example: '2 horas' },
                },
            },
            RecomendacaoIA: {
                type: 'object',
                properties: {
                    titulo: { type: 'string', example: 'Trilha Avançada de CSS Layouts' },
                    descricao: { type: 'string', example: 'Aprofunde-se em layouts responsivos.' },
                    duracao_estimada: { type: 'string', example: '8 horas' },
                    modulos: { type: 'array', items: { $ref: '#/components/schemas/ModuloRecomendado' } },
                    palavras_chave: { type: 'array', items: { type: 'string' }, example: ['css', 'frontend'] },
                },
            },
            RespostaRecomendacaoIA: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    recomendacao: { $ref: '#/components/schemas/RecomendacaoIA' },
                    fonte: { type: 'string', enum: ['ollama', 'padrao'], example: 'ollama' },
                    aviso: { type: 'string', example: '' },
                },
            },
            VideoYoutube: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'dQw4w9WgXcQ' },
                    titulo: { type: 'string', example: 'Aprenda React em 10 minutos' },
                    canal: { type: 'string', example: 'Código Fonte TV' },
                    thumbnail: { type: 'string', format: 'uri', example: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg' },
                    url: { type: 'string', format: 'uri', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                },
            },
            RespostaVideosYoutube: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    videos: { type: 'array', items: { $ref: '#/components/schemas/VideoYoutube' } },
                },
            },
            RespostaListaUsuarios: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    users: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                uid: { type: 'string', example: 'mock-user-uid' },
                                nome: { type: 'string', example: 'Usuário (Mock)' },
                                email: { type: 'string', example: 'admin@intelectus.com' },
                                createdAt: { type: 'string', format: 'date-time', example: '2026-06-18T22:00:00.000Z' }
                            }
                        }
                    }
                }
            },
        },
    },
};

export default documentacao;
