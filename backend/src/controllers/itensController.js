export const TRILHAS_DESTAQUE = [
  {
    id: 1,
    name: 'Python para Data Science',
    level: 'Intermediário',
    tags: ['Python', 'Pandas', 'ML'],
    progress: 71,
  },
  {
    id: 2,
    name: 'UI/UX Design Moderno',
    level: 'Iniciante',
    tags: ['Design', 'Figma', 'UX'],
    progress: 54,
  },
  {
    id: 3,
    name: 'Fullstack Developer',
    level: 'Intermediário',
    tags: ['React', 'Node.js', 'SQL'],
    progress: 60,
  },
  {
    id: 4,
    name: 'UI/UX Specialist',
    level: 'Intermediário',
    tags: ['Figma', 'Research', 'Testing'],
    progress: 30,
  },
  {
    id: 5,
    name: 'DevOps & Cloud na prática',
    level: 'Avançado',
    tags: ['AWS', 'Docker', 'CI/CD'],
    progress: 38,
  },
  {
    id: 6,
    name: 'Fundamentos de IA',
    level: 'Avançado',
    tags: ['IA', 'Redes Neurais', 'LLMs'],
    progress: 62,
  },
];

export const listarItens = (req, res) => {
  res.status(200).json({ success: true, itens: TRILHAS_DESTAQUE });
};

export const listarDestaques = (req, res) => {
  res.status(200).json({
    success: true,
    destaques: TRILHAS_DESTAQUE,
  });
};
