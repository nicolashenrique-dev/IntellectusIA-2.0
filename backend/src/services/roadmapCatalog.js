export const TRILHAS_PADRAO = {
  'Negócios e Marketing': {
    title: 'Primeiros passos em Negócios e Marketing',
    level: 'Iniciante',
    nodes: [
      {
        id: 1,
        label: 'Fundamentos de marketing',
        description: 'Público, proposta de valor e posicionamento.',
        level: 'Iniciante',
      },
      {
        id: 2,
        label: 'Pesquisa de mercado e clientes',
        description: 'Entenda necessidades e valide ideias.',
        level: 'Iniciante',
      },
      {
        id: 3,
        label: 'Conteúdo e canais digitais',
        description: 'Planeje uma campanha para um projeto.',
        level: 'Iniciante',
      },
      {
        id: 4,
        label: 'Métricas de marketing',
        description: 'Avalie resultados e aprimore sua estratégia.',
        level: 'Iniciante',
      },
    ],
  },
  'Tecnologia e Programação': {
    title: 'Desenvolvimento Web Fullstack',
    description: 'Uma trilha completa do HTML ao React, passando por Node.js.',
    level: 'Intermediário',
    nodes: [
      {
        id: 1,
        label: 'HTML & CSS Moderno',
        level: 'Iniciante',
        description: 'Fundamentos de marcação e estilização.',
      },
      {
        id: 2,
        label: 'JavaScript ES6+',
        level: 'Intermediário',
        description: 'Linguagem base para o desenvolvimento web.',
      },
      {
        id: 3,
        label: 'React.js',
        level: 'Intermediário',
        description: 'Biblioteca para interfaces de usuário.',
      },
      { id: 4, label: 'Node.js & Express', level: 'Avançado', description: 'Backend e APIs REST.' },
    ],
  },
  'Ciência de Dados': {
    title: 'Ciência de Dados com Python',
    description: 'Da análise exploratória ao Machine Learning aplicado.',
    level: 'Intermediário',
    nodes: [
      {
        id: 1,
        label: 'Python para Dados',
        level: 'Iniciante',
        description: 'Sintaxe e bibliotecas base como NumPy.',
      },
      {
        id: 2,
        label: 'Pandas & Análise',
        level: 'Intermediário',
        description: 'Manipulação de grandes volumes de dados.',
      },
      {
        id: 3,
        label: 'Machine Learning',
        level: 'Avançado',
        description: 'Modelos preditivos e inteligência artificial.',
      },
    ],
  },
  'Fullstack Developer': {
    title: 'Fullstack Developer',
    description: 'Formação completa em frontend e backend com React, Node.js e SQL.',
    level: 'Intermediário',
    nodes: [
      {
        id: 1,
        label: 'Lógica e JavaScript ES6+',
        level: 'Iniciante',
        description: 'Fundamentos de programação e ES6+.',
      },
      {
        id: 2,
        label: 'React.js Moderno',
        level: 'Intermediário',
        description: 'Componentes, hooks e estado global.',
      },
      {
        id: 3,
        label: 'Backend com Node.js & Express',
        level: 'Intermediário',
        description: 'Construção de APIs REST robustas.',
      },
      {
        id: 4,
        label: 'Banco de Dados SQL & ORM',
        level: 'Avançado',
        description: 'Modelagem, PostgreSQL e Sequelize.',
      },
    ],
  },
  'UI/UX Specialist': {
    title: 'UI/UX Specialist',
    description: 'Domine wireframing, prototipagem, pesquisa de usuário e testes.',
    level: 'Intermediário',
    nodes: [
      {
        id: 1,
        label: 'Fundamentos de Design & UX',
        level: 'Iniciante',
        description: 'Princípios visuais e usabilidade.',
      },
      {
        id: 2,
        label: 'Pesquisa com Usuários (UX Research)',
        level: 'Intermediário',
        description: 'Entrevistas, personas e mapeamento de jornada.',
      },
      {
        id: 3,
        label: 'Prototipagem no Figma',
        level: 'Intermediário',
        description: 'Criação de interfaces interativas e design systems.',
      },
      {
        id: 4,
        label: 'Testes de Usabilidade & Heurísticas',
        level: 'Avançado',
        description: 'Validação e melhoria contínua da experiência.',
      },
    ],
  },
  'Python para Data Science': {
    title: 'Python para Data Science',
    description: 'Domine Python, Pandas, visualização de dados e Machine Learning.',
    level: 'Intermediário',
    nodes: [
      {
        id: 1,
        label: 'Fundamentos de Python',
        level: 'Iniciante',
        description: 'Sintaxe básica, estruturas de repetição e funções.',
      },
      {
        id: 2,
        label: 'Bibliotecas NumPy & Pandas',
        level: 'Intermediário',
        description: 'Manipulação e análise exploratória de dados.',
      },
      {
        id: 3,
        label: 'Visualização de Dados',
        level: 'Intermediário',
        description: 'Matplotlib e Seaborn para gráficos dinâmicos.',
      },
      {
        id: 4,
        label: 'Modelos de Machine Learning',
        level: 'Avançado',
        description: 'Algoritmos de classificação e regressão.',
      },
    ],
  },
  'UI/UX Design Moderno': {
    title: 'UI/UX Design Moderno',
    description: 'Aprenda do zero a projetar interfaces incríveis e focadas no usuário.',
    level: 'Iniciante',
    nodes: [
      {
        id: 1,
        label: 'Introdução ao Design Visual',
        level: 'Iniciante',
        description: 'Cores, tipografia e grids.',
      },
      {
        id: 2,
        label: 'Prototipagem de Alta Fidelidade',
        level: 'Intermediário',
        description: 'Usando componentes e auto-layout no Figma.',
      },
      {
        id: 3,
        label: 'Design Emocional e Negócios',
        level: 'Avançado',
        description: 'UX aplicado a conversão e métricas.',
      },
    ],
  },
  'DevOps & Cloud na prática': {
    title: 'DevOps & Cloud na prática',
    description: 'Aprenda Docker, CI/CD, containers e infraestrutura de nuvem na AWS.',
    level: 'Avançado',
    nodes: [
      {
        id: 1,
        label: 'Fundamentos de Linux e Shell Script',
        level: 'Iniciante',
        description: 'Administração de servidores e automação de comandos.',
      },
      {
        id: 2,
        label: 'Containers com Docker',
        level: 'Intermediário',
        description: 'Criação de imagens, volumes e orquestração básica.',
      },
      {
        id: 3,
        label: 'Pipelines CI/CD',
        level: 'Intermediário',
        description: 'Automação de testes e deploy com GitHub Actions.',
      },
      {
        id: 4,
        label: 'Provedores de Cloud (AWS & GCP)',
        level: 'Avançado',
        description: 'Instâncias, VPCs e serviços de storage gerenciados.',
      },
    ],
  },
  'Fundamentos de IA': {
    title: 'Fundamentos de IA',
    description: 'Aprenda como funcionam redes neurais, inteligência artificial generativa e LLMs.',
    level: 'Avançado',
    nodes: [
      {
        id: 1,
        label: 'Matemática para Inteligência Artificial',
        level: 'Iniciante',
        description: 'Álgebra linear e probabilidade básica.',
      },
      {
        id: 2,
        label: 'Redes Neurais Artificiais',
        level: 'Intermediário',
        description: 'Perceptron, backpropagation e redes convolucionais.',
      },
      {
        id: 3,
        label: 'Engenharia de Prompt e LLMs',
        level: 'Avançado',
        description: 'Funcionamento de transformers e tuning.',
      },
    ],
  },
};
