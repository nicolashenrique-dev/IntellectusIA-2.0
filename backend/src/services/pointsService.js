import { admin } from '../config/firebase.js';
import { MOCK_USERS } from '../config/mockDb.js';
import { lerUsuario, listarDadosUsuarios, atualizarUsuario } from './userRepository.js';
import { creditarProgresso, resumoPontuacao, camposPontuacao } from './gamification.js';
export { calcularNivel, calcularPontosDaTrilha } from './gamification.js';

async function resolverNome(uid, informado, data = {}) {
  const nome =
    informado || data.nome || data.displayName || MOCK_USERS.find((user) => user.uid === uid)?.nome;
  if (nome) return nome;
  if (data.email) return data.email.split('@')[0];
  try {
    const user = await admin.auth().getUser(uid);
    return user.displayName || user.email?.split('@')[0] || 'Estudante #' + uid.slice(-4);
  } catch {
    return 'Estudante #' + uid.slice(-4);
  }
}
export async function sincronizarPontosUsuario(uid, nomeInformado = null) {
  if (!uid) return null;
  const nome = await resolverNome(uid, nomeInformado, await lerUsuario(uid));
  return atualizarUsuario(uid, (data) => {
    const { pontuacao } = creditarProgresso(data, data.trilha);
    const patch = camposPontuacao(data, pontuacao, data.trilha, nome);
    return {
      patch,
      result: {
        uid,
        nome,
        ...resumoPontuacao({ ...data, ...patch }),
        atualizadoEm: patch.pontosAtualizadosEm,
      },
    };
  });
}
export async function obterRankingGeral(currentUserUid = null) {
  const entries = [];
  for (const data of await listarDadosUsuarios()) {
    const stats = resumoPontuacao(data);
    entries.push({
      uid: data.uid,
      nome: await resolverNome(data.uid, null, data),
      pontos: stats.pontos,
      modulosConcluidos: stats.modulosConcluidos,
      nivel: stats.nivel,
      titulo: stats.titulo,
    });
  }
  const ranking = entries
    .sort(
      (a, b) =>
        b.pontos - a.pontos ||
        b.modulosConcluidos - a.modulosConcluidos ||
        a.uid.localeCompare(b.uid),
    )
    .map((entry, index) => ({
      posicao: index + 1,
      ...entry,
      isCurrentUser: entry.uid === currentUserUid,
    }));
  let usuarioAtual = currentUserUid ? ranking.find((user) => user.uid === currentUserUid) : null;
  if (currentUserUid && !usuarioAtual)
    usuarioAtual = {
      uid: currentUserUid,
      nome: await resolverNome(currentUserUid),
      pontos: 0,
      modulosConcluidos: 0,
      nivel: 1,
      titulo: 'Iniciante',
      posicao: ranking.length + 1,
      isCurrentUser: true,
    };
  return { ranking, usuarioAtual: usuarioAtual || null, totalParticipantes: ranking.length };
}
