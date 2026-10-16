import { lerUsuario, atualizarUsuario } from './userRepository.js';
import { creditarProgresso, camposPontuacao, resumoPontuacao } from './gamification.js';

export async function carregarTrilha(uid) {
  return (await lerUsuario(uid)).trilha;
}
export async function carregarTrilhaComPontuacao(uid) {
  const data = await lerUsuario(uid);
  return { trilha: data.trilha, pontuacao: resumoPontuacao(data) };
}
export async function salvarTrilha(uid, trilha) {
  return atualizarUsuario(uid, (data) => {
    // Preserve the previous course's rewards before replacing its progress.
    const { pontuacao } = creditarProgresso(data, data.trilha);
    return { patch: { trilha, ...camposPontuacao(data, pontuacao, trilha) }, result: trilha };
  });
}
function failure(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}
export async function atualizarProgresso(uid, id, status, nome) {
  return atualizarUsuario(uid, (data) => {
    const trilha = structuredClone(data.trilha);
    if (!trilha?.nodes) throw failure(404, 'Trilha do usuário não encontrada.');
    const index = trilha.nodes.findIndex((node) => String(node.id) === String(id));
    if (index === -1) throw failure(404, 'Nó da trilha não encontrado.');
    if (
      status !== 'locked' &&
      trilha.nodes.slice(0, index).some((node) => node.status !== 'completed')
    ) {
      throw failure(409, 'Conclua os módulos anteriores primeiro.');
    }
    trilha.nodes[index].status = status;
    if (status !== 'completed') {
      for (let i = index + 1; i < trilha.nodes.length; i++) trilha.nodes[i].status = 'locked';
    } else if (trilha.nodes[index + 1]?.status === 'locked')
      trilha.nodes[index + 1].status = 'in-progress';
    const { pontuacao, pontosGanhos } = creditarProgresso(data, trilha);
    const patch = { trilha, ...camposPontuacao(data, pontuacao, trilha, nome) };
    return {
      patch,
      result: {
        ...resumoPontuacao({ ...data, ...patch }),
        pontosGanhos,
        roadmap: trilha,
        node: trilha.nodes[index],
      },
    };
  });
}
