const TRILHAS_DESTAQUE = [
    {
        id: 1,
        name: 'Introdução à Programação',
        level: 'Iniciante',
        tags: ['Lógica', 'Algoritmos'],
        progress: 0
    },
    {
        id: 2,
        name: 'Estrutura de Dados',
        level: 'Intermediário',
        tags: ['Arrays', 'Listas', 'Árvores'],
        progress: 0
    },
    {
        id: 3,
        name: 'Fullstack Developer',
        level: 'Intermediário',
        tags: ['React', 'Node.js', 'SQL'],
        progress: 60
    },
    {
        id: 4,
        name: 'UI/UX Specialist',
        level: 'Intermediário',
        tags: ['Figma', 'Research', 'Testing'],
        progress: 30
    }
];

export const listarItens = (req, res) => {
    res.status(200).json({ success: true, itens: TRILHAS_DESTAQUE });
};

export const listarDestaques = (req, res) => {
    res.status(200).json({
        success: true,
        destaques: TRILHAS_DESTAQUE.filter((item) => item.id >= 3)
    });
};
