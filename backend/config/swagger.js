const documentacao = {
    openapi: '3.0.0',
    info: {
        title: 'IntelectusIA API',
        version: '1.0.0',
        description: 'API para geração de trilhas de aprendizado personalizadas com IA (Ollama), integração YouTube e gestão de perfil via Firebase.',
    },
    servers: [
        { url: 'https://projeto-sem.vercel.app', description: 'Servidor de Produção (Vercel)' },
        { url: 'http://localhost:3000', description: 'Servidor local' },
    ],
    tags: [
        { name: 'Autenticação', description: 'RF01 - Login e cadastro' },
        { name: 'Perfil', description: 'RF02 - Dados do usuário' },
        { name: 'Trilhas', description: 'RF04, RF06, RF07, RF08, RF09 - Trilhas de aprendizado' },
        { name: 'Itens', description: 'Listagem de trilhas e destaques' },
        { name: 'Inteligência Artificial', description: 'Recomendações via Ollama e vídeos do YouTube' },
    ],
    paths: {       '/autenticacao/login': {
            post: {
                tags: ['Autenticação'],
                summary: 'RF01 - Realiza login do usuário',
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
                summary: 'Registra um novo usuário (mock para integração mobile)',
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
                        description: 'Usuário registrado',
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
        '/autenticacao/perfil/{uid}': {
            get: {
                tags: ['Perfil'],
                summary: 'RF02 - Obtém perfil do usuário no Firestore',
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
                    404: { description: 'Perfil não encontrado' },
                    500: { description: 'Erro interno' },
                },
            },
        },
        '/itens': {
            get: {
                tags: ['Itens'],
                summary: 'Lista trilhas disponíveis para exibição',
                responses: {
                    200: {
                        description: 'Lista de itens/trilhas',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaItens' },
                            },
                        },
                    },
                },
            },
        },
        '/itens/destaques': {
            get: {
                tags: ['Itens'],
                summary: 'Lista trilhas em destaque para o dashboard',
                responses: {
                    200: {
                        description: 'Trilhas em destaque',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaDestaques' },
                            },
                        },
                    },
                },
            },
        },
        '/trilhas/gerar': {
            post: {
                tags: ['Trilhas'],
                summary: 'RF04 - Gera trilha personalizada com base no quiz/perfil',
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
                    400: { description: 'Perfil inválido ou interest ausente' },
                    500: { description: 'Erro interno ao gerar trilha' },
                },
            },
        },
        '/trilhas/usuario/{uid}': {
            get: {
                tags: ['Trilhas'],
                summary: 'RF06 - Obtém a trilha salva do usuário no Firestore',
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
                        description: 'Trilha do usuário',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaTrilhaUsuario' },
                            },
                        },
                    },
                    404: { description: 'Trilha não encontrada' },
                },
            },
        },
        '/trilhas/destaques': {
            get: {
                tags: ['Trilhas'],
                summary: 'Lista trilhas em destaque',
                responses: {
                    200: {
                        description: 'Trilhas em destaque',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaDestaques' },
                            },
                        },
                    },
                },
            },
        },
        '/trilhas/{id}': {
            get: {
                tags: ['Trilhas'],
                summary: 'RF07/RF08 - Obtém detalhes de uma trilha por ID',
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
                        description: 'Detalhes da trilha',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaDetalheTrilha' },
                            },
                        },
                    },
                },
            },
        },
        '/trilhas/no/{id}': {
            patch: {
                tags: ['Trilhas'],
                summary: 'RF09 - Atualiza status de conclusão de um nó da trilha',
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
                        description: 'Status atualizado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaStatusNoTrilha' },
                            },
                        },
                    },
                    400: { description: 'Status inválido' },
                    404: { description: 'Trilha ou nó não encontrado' },
                },
            },
        },
        '/ia/recomendar': {
            post: {
                tags: ['Inteligência Artificial'],
                summary: 'Gera recomendação de trilha via Ollama (llama3.1)',
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
                        description: 'Recomendação gerada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaRecomendacaoIA' },
                            },
                        },
                    },
                },
            },
        },
        '/ia/videos': {
            get: {
                tags: ['Inteligência Artificial'],
                summary: 'Busca vídeos educacionais no YouTube',
                parameters: [
                    {
                        name: 'tema',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        example: 'JavaScript ES6',
                    },
                    {
                        name: 'nivel',
                        in: 'query',
                        required: false,
                        schema: { type: 'string' },
                        example: 'Intermediário',
                    },
                ],
                responses: {
                    200: {
                        description: 'Lista de vídeos',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespostaVideosYoutube' },
                            },
                        },
                    },
                    400: { description: 'Parâmetro tema ausente' },
                    500: { description: 'Erro na API do YouTube ou chave não configurada' },
                },
            },
        },
        '/api/login': {
            post: {
                tags: ['Autenticação'],
                summary: 'Alias mobile - Login',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoLogin' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Login realizado com sucesso' },
                    401: { description: 'Credenciais inválidas' },
                },
            },
        },
        '/api/cadastro': {
            post: {
                tags: ['Autenticação'],
                summary: 'Alias mobile - Cadastro',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoCadastro' },
                        },
                    },
                },
                responses: {
                    201: { description: 'Usuário registrado' },
                },
            },
        },
        '/api/perfil/{uid}': {
            get: {
                tags: ['Perfil'],
                summary: 'Alias mobile - Perfil do usuário',
                parameters: [
                    { name: 'uid', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Perfil encontrado' },
                    404: { description: 'Perfil não encontrado' },
                },
            },
        },
        '/api/trilhas/gerar': {
            post: {
                tags: ['Trilhas'],
                summary: 'Alias mobile - Gerar trilha',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoGerarTrilha' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Trilha gerada' },
                },
            },
        },
        '/api/trilhas/usuario/{uid}': {
            get: {
                tags: ['Trilhas'],
                summary: 'Alias mobile - Trilha do usuário',
                parameters: [
                    { name: 'uid', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Trilha encontrada' },
                    404: { description: 'Trilha não encontrada' },
                },
            },
        },
        '/api/ia/recomendar': {
            post: {
                tags: ['Inteligência Artificial'],
                summary: 'Alias mobile - Recomendação IA',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RequisicaoRecomendacaoIA' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Recomendação gerada' },
                },
            },
        },
        '/api/ia/videos': {
            get: {
                tags: ['Inteligência Artificial'],
                summary: 'Alias mobile - Vídeos YouTube',
                parameters: [
                    { name: 'tema', in: 'query', required: true, schema: { type: 'string' } },
                    { name: 'nivel', in: 'query', required: false, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Vídeos encontrados' },
                },
            },
        },
        '/api/itens': {
            get: {
                tags: ['Itens'],
                summary: 'Alias mobile - Lista de itens',
                responses: {
                    200: { description: 'Lista de trilhas' },
                },
            },
        },
        '/api/health': {
            get: {
                tags: ['Sistema'],
                summary: 'Alias mobile - Health check',
                responses: {
                    200: { description: 'API operacional' },
                },
            },
        },
    },
    components: {
        schemas: {
            RespostaSaude: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                },
            },
            RequisicaoLogin: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'nicolas@gmail.com' },
                    password: { type: 'string', example: '12345678' },
                },
            },
            RespostaLogin: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'mock-jwt-token' },
                    user: {
                        type: 'object',
                        properties: {
                            email: { type: 'string' },
                            nome: { type: 'string' },
                            uid: { type: 'string' },
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
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: {
                        type: 'object',
                        properties: {
                            nome: { type: 'string' },
                            email: { type: 'string' },
                            uid: { type: 'string' },
                        },
                    },
                },
            },
            RespostaPerfil: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    profile: { type: 'object', additionalProperties: true },
                },
            },
            ItemTrilha: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    level: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    progress: { type: 'integer' },
                },
            },
            RespostaItens: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    itens: { type: 'array', items: { $ref: '#/components/schemas/ItemTrilha' } },
                },
            },
            RespostaDestaques: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
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
                    id: { type: 'integer' },
                    label: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['completed', 'in-progress', 'locked'] },
                    level: { type: 'string' },
                },
            },
            Trilha: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    nodes: { type: 'array', items: { $ref: '#/components/schemas/NoTrilha' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    fonte: { type: 'string', enum: ['ollama', 'fallback'] },
                },
            },
            RespostaGerarTrilha: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    roadmap: { $ref: '#/components/schemas/Trilha' },
                },
            },
            RespostaTrilhaUsuario: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    roadmap: { $ref: '#/components/schemas/Trilha' },
                },
            },
            RespostaDetalheTrilha: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    roadmap: { $ref: '#/components/schemas/Trilha' },
                },
            },
            RequisicaoStatusNoTrilha: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['completed', 'in-progress', 'locked'] },
                    uid: { type: 'string', description: 'UID Firebase para persistir no Firestore' },
                },
            },
            RespostaStatusNoTrilha: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
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
                    ordem: { type: 'integer' },
                    nome: { type: 'string' },
                    descricao: { type: 'string' },
                    duracao: { type: 'string' },
                },
            },
            RecomendacaoIA: {
                type: 'object',
                properties: {
                    titulo: { type: 'string' },
                    descricao: { type: 'string' },
                    duracao_estimada: { type: 'string' },
                    modulos: { type: 'array', items: { $ref: '#/components/schemas/ModuloRecomendado' } },
                    palavras_chave: { type: 'array', items: { type: 'string' } },
                },
            },
            RespostaRecomendacaoIA: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    recomendacao: { $ref: '#/components/schemas/RecomendacaoIA' },
                    fonte: { type: 'string', enum: ['ollama', 'padrao'] },
                    aviso: { type: 'string' },
                },
            },
            VideoYoutube: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    titulo: { type: 'string' },
                    canal: { type: 'string' },
                    thumbnail: { type: 'string', format: 'uri' },
                    url: { type: 'string', format: 'uri' },
                },
            },
            RespostaVideosYoutube: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    videos: { type: 'array', items: { $ref: '#/components/schemas/VideoYoutube' } },
                },
            },
        },
    },
};

export default documentacao;
