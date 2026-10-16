import { gerarJsonGemini } from '../services/gemini.js';

const TRILHAS_PADRAO = {
  'Tecnologia e Programação': {
    titulo: 'Desenvolvimento Web Fullstack',
    descricao: 'Uma trilha completa do HTML ao React, passando por Node.js.',
    duracao_estimada: '6 meses',
    modulos: [
      {
        ordem: 1,
        nome: 'HTML & CSS Moderno',
        descricao: 'Fundamentos de marcação e estilização.',
        duracao: '2 semanas',
      },
      {
        ordem: 2,
        nome: 'JavaScript ES6+',
        descricao: 'Linguagem base para o desenvolvimento web.',
        duracao: '4 semanas',
      },
      {
        ordem: 3,
        nome: 'React.js',
        descricao: 'Biblioteca para interfaces de usuário.',
        duracao: '6 semanas',
      },
    ],
  },
  'Ciência de Dados': {
    titulo: 'Ciência de Dados com Python',
    descricao: 'Da análise exploratória ao Machine Learning aplicado.',
    duracao_estimada: '8 meses',
    modulos: [
      {
        ordem: 1,
        nome: 'Python para Dados',
        descricao: 'Sintaxe e bibliotecas base como NumPy.',
        duracao: '3 semanas',
      },
      {
        ordem: 2,
        nome: 'Pandas & Análise',
        descricao: 'Manipulação de grandes volumes de dados.',
        duracao: '5 semanas',
      },
    ],
  },
};

export const recomendarTrilha = async (req, res) => {
  const { interesse, nivel, objetivo } = req.body;

  try {
    const prompt = `Recomende uma trilha de estudos em formato JSON para: Interesse: ${interesse || 'Tecnologia'}, Nível: ${nivel || 'Iniciante'}, Objetivo: ${objetivo || 'Aprender e crescer profissionalmente'}. Formato exato esperado (sem markdown, apenas JSON puro): {"titulo":"...","descricao":"...","duracao_estimada":"...","modulos":[{"ordem":1,"nome":"...","descricao":"...","duracao":"..."}],"palavras_chave":["..."]}. Retorne APENAS o objeto JSON, sem nenhum texto extra, sem \`\`\`json.`;

    const trilha = await gerarJsonGemini(prompt);

    return res.status(200).json({ success: true, recomendacao: trilha, fonte: 'gemini' });
  } catch (erroGemini) {
    console.error('Falha na API do Gemini:', erroGemini.message);
  }

  // --- BLOCO FALLBACK ---
  console.log('Aplicando rota de Fallback padrão...');
  const trilhaPadrao = TRILHAS_PADRAO[interesse] || {
    titulo: `Trilha de ${interesse || 'Tecnologia'}`,
    descricao: `Trilha personalizada para ${nivel || 'Iniciante'} com foco em ${objetivo || 'Estudo'}`,
    duracao_estimada: '4 meses',
    modulos: [
      { ordem: 1, nome: 'Fundamentos', descricao: 'Base essencial da área', duracao: '3 semanas' },
      { ordem: 2, nome: 'Prática Guiada', descricao: 'Projetos hands-on', duracao: '4 semanas' },
      { ordem: 3, nome: 'Projeto Real', descricao: 'Portfólio profissional', duracao: '5 semanas' },
    ],
  };

  return res.status(200).json({
    success: true,
    recomendacao: { ...trilhaPadrao, palavras_chave: [interesse, nivel] },
    fonte: 'padrao',
    aviso: 'Recomendação gerada via fallback (Gemini indisponível ou sem chave configurada).',
  });
};
