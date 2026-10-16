const catalog = {
  TI: {
    name: 'Desenvolvimento Web',
    tracks: [
      [
        'Lógica de programação',
        'HTML semântico e CSS responsivo',
        'JavaScript: funções e eventos',
        'Git e publicação do primeiro site',
      ],
      [
        'JavaScript assíncrono e APIs',
        'React: componentes e estado',
        'Node.js e APIs REST',
        'Testes de aplicações web',
      ],
      [
        'Arquitetura de aplicações web',
        'Segurança de APIs e autenticação',
        'Performance e observabilidade',
        'Sistemas distribuídos e escalabilidade',
      ],
    ],
    project: 'uma aplicação web',
  },
  DESIGN: {
    name: 'Design de Produto e UX',
    tracks: [
      [
        'Fundamentos de design visual',
        'Pesquisa com usuários: primeiros passos',
        'Wireframes e fluxos de navegação',
        'Protótipos interativos no Figma',
      ],
      [
        'Entrevistas e síntese de pesquisa UX',
        'Arquitetura da informação',
        'Design systems no Figma',
        'Testes de usabilidade e acessibilidade',
      ],
      [
        'Estratégia de design de produto',
        'Governança de design systems',
        'Métricas de experiência e experimentação',
        'Liderança e operações de design',
      ],
    ],
    project: 'um estudo de caso de UX',
  },
  DATA: {
    name: 'Ciência de Dados',
    tracks: [
      [
        'Python para análise de dados',
        'Estatística descritiva',
        'Limpeza de dados com Pandas',
        'Gráficos e análise exploratória',
      ],
      [
        'SQL para análise de dados',
        'Inferência estatística e testes de hipótese',
        'Modelos de aprendizado supervisionado',
        'Validação de modelos e comunicação de resultados',
      ],
      [
        'Engenharia de atributos e prevenção de vazamento',
        'Otimização e interpretação de modelos',
        'Pipelines de machine learning e MLOps',
        'Monitoramento de modelos em produção',
      ],
    ],
    project: 'uma análise de dados reproduzível',
  },
  MARKETING: {
    name: 'Negócios e Marketing',
    tracks: [
      [
        'Fundamentos de marketing e proposta de valor',
        'Pesquisa de mercado e público-alvo',
        'Planejamento de conteúdo digital',
        'Métricas básicas de campanhas',
      ],
      [
        'Segmentação e posicionamento de marca',
        'SEO e aquisição de clientes',
        'Funil de vendas e CRM',
        'Experimentos de conversão e análise de campanhas',
      ],
      [
        'Estratégia de crescimento de negócios',
        'Modelos de atribuição e economia unitária',
        'Experimentação e retenção de clientes',
        'Gestão de orçamento e liderança de marketing',
      ],
    ],
    project: 'um plano de marketing',
  },
};
const levelNames = { BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediário', ADVANCED: 'Avançado' };
const goals = {
  JOB: 'Primeiro emprego',
  TRANSITION: 'Transição de carreira',
  SPECIALIZATION: 'Especialização',
};
const clean = (value) => (typeof value === 'string' ? value.trim() : '');
export function normalizeProfile(profile = {}) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile))
    throw new Error('Perfil deve ser um objeto.');
  for (const field of ['interestCode', 'experienceCode', 'goalCode']) {
    if (
      profile[field] !== undefined &&
      (typeof profile[field] !== 'string' || !profile[field].trim())
    )
      throw new Error('Os códigos do perfil devem ser strings válidas.');
  }
  const interest = clean(profile.interest);
  const text = interest.toLowerCase();
  const area =
    profile.interestCode ||
    (Object.hasOwn(catalog, interest)
      ? interest
      : /design|ux/.test(text)
        ? 'DESIGN'
        : /dados|data|analytics/.test(text)
          ? 'DATA'
          : /neg[oó]cios|marketing|produto/.test(text)
            ? 'MARKETING'
            : /software|web|programa|tecnologia/.test(text)
              ? 'TI'
              : null);
  const exp = clean(profile.experience).toLowerCase();
  const level =
    profile.experienceCode ||
    (/avan|advanced/.test(exp) ? 'ADVANCED' : /interm/.test(exp) ? 'INTERMEDIATE' : 'BEGINNER');
  const goalText = clean(profile.goal).toLowerCase();
  const goal =
    profile.goalCode ||
    (/transi/.test(goalText)
      ? 'TRANSITION'
      : /especial|specialization|lider/.test(goalText)
        ? 'SPECIALIZATION'
        : 'JOB');
  if (
    !Object.hasOwn(catalog, area) ||
    !Object.hasOwn(levelNames, level) ||
    !Object.hasOwn(goals, goal)
  )
    throw new Error('Escolha uma área, um nível e um objetivo válidos.');
  return {
    interestCode: area,
    experienceCode: level,
    goalCode: goal,
    interest: catalog[area].name,
    experience: levelNames[level],
    goal: goals[goal],
  };
}
export function buildFallback(profile) {
  const area = catalog[profile.interestCode];
  const levelIndex = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].indexOf(profile.experienceCode);
  const labels = area.tracks[levelIndex];
  const finalTask = {
    JOB: {
      label: `Portfólio: ${area.project}`,
      description: `Prepare ${area.project} para apresentar em uma candidatura. Documente decisões, resultados e o que aprendeu.`,
    },
    TRANSITION: {
      label: `Projeto de transição: ${area.project}`,
      description: `Conecte sua experiência anterior com ${area.project}. Identifique competências transferíveis e valide seu interesse na nova área.`,
    },
    SPECIALIZATION: {
      label: `Aprofundamento: ${area.project}`,
      description: `Desenvolva ${area.project} com critérios de qualidade, comparação de alternativas e uma revisão técnica das decisões.`,
    },
  }[profile.goalCode];
  return {
    title: `${area.name} · ${profile.experience} · ${profile.goal}`,
    description: `Estude ${area.name.toLowerCase()} a partir do nível ${profile.experience.toLowerCase()}, com foco em ${profile.goal.toLowerCase()}.`,
    level: profile.experience,
    nodes: [
      ...labels.map((label) => ({
        label,
        description: `Estude ${label.toLowerCase()} e pratique os conceitos em ${area.project}.`,
      })),
      finalTask,
    ].map((node, i) => ({
      ...node,
      id: i + 1,
      level: profile.experience,
      status: i === 0 ? 'in-progress' : 'locked',
    })),
  };
}
export function normalizeGeneratedRoadmap(data, profile) {
  if (
    !data ||
    typeof data.title !== 'string' ||
    !data.title.trim() ||
    !Array.isArray(data.nodes) ||
    data.nodes.length < 2 ||
    data.nodes.length > 20 ||
    data.nodes.some((n) => !n || typeof n.label !== 'string' || !n.label.trim())
  )
    throw new Error('A IA retornou uma trilha incompleta.');
  return {
    title: data.title.trim(),
    description: typeof data.description === 'string' ? data.description : '',
    level: profile.experience,
    nodes: data.nodes.map((n, i) => ({
      id: i + 1,
      label: n.label.trim(),
      description: typeof n.description === 'string' ? n.description : '',
      level: profile.experience,
      status: i === 0 ? 'in-progress' : 'locked',
    })),
  };
}
