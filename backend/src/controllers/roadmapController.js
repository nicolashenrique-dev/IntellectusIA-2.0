import { TRILHAS_DESTAQUE } from './itensController.js';
import {
  normalizeProfile,
  buildFallback,
  normalizeGeneratedRoadmap,
} from '../services/learningProfile.js';
import { TRILHAS_PADRAO } from '../services/roadmapCatalog.js';
import {
  carregarTrilhaComPontuacao,
  salvarTrilha,
  atualizarProgresso,
} from '../services/roadmapRepository.js';
import { gerarJsonGemini } from '../services/gemini.js';
import { sincronizarPontosUsuario, obterRankingGeral } from '../services/pointsService.js';

export const gerarTrilha = async (req, res) => {
  try {
    const { profile, uid } = req.body;

    let normalized;
    try {
      normalized = normalizeProfile(profile);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    const { interest, experience, goal } = normalized;

    let trilhaFinal = null;

    try {
      const prompt = `Gere uma trilha de estudos estruturada em JSON para: Área: ${interest}, Experiência: ${experience || 'Não informada'}, Objetivo: ${goal || 'Desenvolvimento Profissional'}. Formato estrito esperado: {"title":"...","description":"...","nodes":[{"id":1,"label":"...","description":"...","status":"locked","level":"Iniciante"}]}. Observação: O primeiro nó deve vir com status "in-progress" e os demais como "locked". Retorne APENAS o objeto JSON puro, sem markdown e sem wrap de \`\`\`json.`;

      const aiData = await gerarJsonGemini(prompt);
      trilhaFinal = {
        ...normalizeGeneratedRoadmap(aiData, normalized),
        createdAt: new Date().toISOString(),
        fonte: 'gemini',
      };
    } catch (err) {
      console.error('Falha ao gerar trilha com AI (Gemini):', err.message);
    }

    if (!trilhaFinal) {
      console.log('Usando trilha padrão via Fallback do sistema.');
      trilhaFinal = {
        ...buildFallback(normalized),
        createdAt: new Date().toISOString(),
        fonte: 'fallback',
      };
    }
    trilhaFinal.profile = normalized;

    if (uid) {
      try {
        await salvarTrilha(uid, trilhaFinal);
      } catch (error) {
        console.error('Erro ao salvar trilha:', error);
        return res.status(503).json({
          success: false,
          message: 'Sua nova trilha não pôde ser salva. Tente novamente.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      roadmap: trilhaFinal,
    });
  } catch (error) {
    console.error('Erro catastrófico no endpoint gerarTrilha:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Erro interno ao processar a requisição' });
  }
};

export const obterTrilhaUsuario = async (req, res) => {
  try {
    const { uid } = req.params;
    const { trilha, pontuacao } = await carregarTrilhaComPontuacao(uid);

    if (!trilha) {
      return res
        .status(404)
        .json({ success: false, message: 'Trilha não encontrada para este usuário.', pontuacao });
    }

    return res.status(200).json({ success: true, roadmap: trilha, pontuacao });
  } catch (error) {
    console.error('Erro ao buscar trilha do usuário:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar trilha do usuário.' });
  }
};

export const obterTrilhaPorId = async (req, res) => {
  const destaque = TRILHAS_DESTAQUE.find((item) => String(item.id) === req.params.id);
  const template = destaque && TRILHAS_PADRAO[destaque.name];
  if (!template) return res.status(404).json({ success: false, message: 'Trilha não encontrada.' });
  return res.json({
    success: true,
    roadmap: {
      ...template,
      id: destaque.id,
      nodes: template.nodes.map((node, index) => ({
        ...node,
        status: index === 0 ? 'in-progress' : 'locked',
      })),
    },
  });
};

export const atualizarStatusNo = async (req, res) => {
  const { id } = req.params;
  const { status, uid } = req.body;
  if (!['completed', 'in-progress', 'locked'].includes(status))
    return res
      .status(400)
      .json({ success: false, message: 'Status inválido. Use completed, in-progress ou locked.' });
  if (!uid)
    return res.status(400).json({ success: false, message: 'UID do usuário é obrigatório.' });
  try {
    const result = await atualizarProgresso(uid, id, status, req.user?.nome);
    return res
      .status(200)
      .json({
        success: true,
        message: `Status do nó ${id} atualizado para ${status}`,
        ...result,
        totalPontos: result.pontos,
        badge: '🌱',
      });
  } catch (error) {
    if (error.statusCode)
      return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error('Erro ao salvar progresso e pontos:', error);
    return res
      .status(503)
      .json({ success: false, message: 'Não foi possível salvar seu progresso. Tente novamente.' });
  }
};

export const obterRanking = async (req, res) => {
  try {
    const currentUserUid = req.user?.uid || null;
    const resultado = await obterRankingGeral(currentUserUid);
    return res.status(200).json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    return res.status(500).json({ success: false, message: 'Erro ao carregar ranking.' });
  }
};

export const obterPontosUsuario = async (req, res) => {
  try {
    const uid = req.params.uid || req.user?.uid;
    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID obrigatório.' });
    }
    const nome = req.user?.nome || null;
    const dados = await sincronizarPontosUsuario(uid, nome);
    return res.status(200).json({
      success: true,
      ...dados,
    });
  } catch (error) {
    console.error('Erro ao obter pontos do usuário:', error);
    return res.status(500).json({ success: false, message: 'Erro ao carregar pontuação.' });
  }
};

export const inscreverTrilha = async (req, res) => {
  try {
    const { uid, trilhaName } = req.body;

    if (!uid || typeof trilhaName !== 'string' || !trilhaName.trim() || trilhaName.length > 200) {
      return res
        .status(400)
        .json({ success: false, message: 'UID e nome da trilha são obrigatórios.' });
    }

    // Tenta achar nos templates padrão
    let template = Object.hasOwn(TRILHAS_PADRAO, trilhaName) ? TRILHAS_PADRAO[trilhaName] : null;
    if (!template) {
      // Tenta mapeamento flexível
      const normalized = trilhaName.toLowerCase();
      if (/neg[oó]cios|marketing|produto/.test(normalized)) {
        template = TRILHAS_PADRAO['Negócios e Marketing'];
      } else if (normalized.includes('fullstack') || normalized.includes('full stack')) {
        template = TRILHAS_PADRAO['Fullstack Developer'];
      } else if (
        normalized.includes('ui/ux') ||
        normalized.includes('ux') ||
        normalized.includes('design')
      ) {
        template = TRILHAS_PADRAO['UI/UX Specialist'];
      } else if (
        normalized.includes('data science') ||
        normalized.includes('dados') ||
        normalized.includes('python')
      ) {
        template = TRILHAS_PADRAO['Python para Data Science'];
      } else if (normalized.includes('devops') || normalized.includes('cloud')) {
        template = TRILHAS_PADRAO['DevOps & Cloud na prática'];
      } else if (
        normalized.includes('ia') ||
        normalized.includes('inteligência') ||
        normalized.includes('inteligencia')
      ) {
        template = TRILHAS_PADRAO['Fundamentos de IA'];
      } else if (
        normalized.includes('introdução') ||
        normalized.includes('introducao') ||
        normalized.includes('lógica') ||
        normalized.includes('logica')
      ) {
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
          {
            id: 1,
            label: `Introdução ao ${trilhaName}`,
            status: 'in-progress',
            level: 'Iniciante',
            description: 'Conceitos iniciais e fundamentos.',
          },
          {
            id: 2,
            label: `Conceitos Intermediários de ${trilhaName}`,
            status: 'locked',
            level: 'Intermediário',
            description: 'Tópicos de nível médio e prática.',
          },
          {
            id: 3,
            label: `Tópicos Avançados de ${trilhaName}`,
            status: 'locked',
            level: 'Avançado',
            description: 'Domínio avançado e arquitetura.',
          },
        ],
      };
    }

    const trilhaFinal = {
      ...template,
      nodes: template.nodes.map((node, i) => ({
        ...node,
        status: i === 0 ? 'in-progress' : 'locked',
      })),
      createdAt: new Date().toISOString(),
      fonte: 'pre-programada',
    };

    await salvarTrilha(uid, trilhaFinal);

    return res.status(200).json({
      success: true,
      message: 'Inscrição na trilha realizada com sucesso.',
      roadmap: trilhaFinal,
    });
  } catch (error) {
    console.error('Erro ao inscrever na trilha:', error);
    return res.status(500).json({ success: false, message: 'Erro ao se inscrever na trilha.' });
  }
};
