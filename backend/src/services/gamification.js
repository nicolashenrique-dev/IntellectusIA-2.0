import { createHash } from 'node:crypto';

export function calcularNivel(pontos = 0) {
  if (pontos >= 1000) return { nivel: 5, titulo: 'Mestre', proximoNivel: null };
  if (pontos >= 600) return { nivel: 4, titulo: 'Especialista', proximoNivel: 1000 };
  if (pontos >= 300) return { nivel: 3, titulo: 'Explorador', proximoNivel: 600 };
  if (pontos >= 100) return { nivel: 2, titulo: 'Aprendiz', proximoNivel: 300 };
  return { nivel: 1, titulo: 'Iniciante', proximoNivel: 100 };
}

/**
 * Calcula os pontos com base na trilha:
 * - 100 pontos por módulo com status 'completed'
 * - 200 pontos de bônus caso todos os módulos da trilha estejam concluídos
 */
export function calcularPontosDaTrilha(trilha) {
  if (!trilha || !Array.isArray(trilha.nodes) || trilha.nodes.length === 0) {
    return { pontos: 0, modulosConcluidos: 0, totalModulos: 0, trilhaCompleta: false };
  }

  const modulosConcluidos = trilha.nodes.filter((n) => n.status === 'completed').length;
  const totalModulos = trilha.nodes.length;
  const trilhaCompleta = totalModulos > 0 && modulosConcluidos === totalModulos;

  let pontos = modulosConcluidos * 100;
  if (trilhaCompleta) {
    pontos += 200; // Bônus de finalização de trilha!
  }

  return {
    pontos,
    modulosConcluidos,
    totalModulos,
    trilhaCompleta,
  };
}

const amount = (value) => (Number.isFinite(value) && value >= 0 ? value : 0);
const normalized = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Identical content at the same difficulty pays once, even after restarting a course.
export const chaveModulo = (node, trilha) =>
  hash([normalized(node.label), normalized(node.level || trilha.level)]);
const chaveTrilha = (trilha) => hash(trilha.nodes.map((node) => chaveModulo(node, trilha)).sort());

export function pontuacaoInicial(data = {}) {
  if (data.pontuacao?.versao === 1) return structuredClone(data.pontuacao);
  const stats = calcularPontosDaTrilha(data.trilha);
  return {
    versao: 1,
    pontos: Math.max(amount(data.pontos), stats.pontos),
    modulosConcluidos: Math.max(amount(data.modulosConcluidos), stats.modulosConcluidos),
    modulosPremiados: (data.trilha?.nodes || [])
      .filter((node) => node.status === 'completed')
      .map((node) => chaveModulo(node, data.trilha)),
    trilhasPremiadas: stats.trilhaCompleta ? [chaveTrilha(data.trilha)] : [],
  };
}

export function creditarProgresso(data, trilha) {
  const pontuacao = pontuacaoInicial(data);
  const antes = pontuacao.pontos;
  const modulos = new Set(pontuacao.modulosPremiados);
  const trilhas = new Set(pontuacao.trilhasPremiadas);
  for (const node of trilha?.nodes || []) {
    const key = chaveModulo(node, trilha);
    if (node.status === 'completed' && !modulos.has(key)) {
      modulos.add(key);
      pontuacao.pontos += 100;
      pontuacao.modulosConcluidos++;
    }
  }
  if (calcularPontosDaTrilha(trilha).trilhaCompleta && !trilhas.has(chaveTrilha(trilha))) {
    trilhas.add(chaveTrilha(trilha));
    pontuacao.pontos += 200;
  }
  pontuacao.modulosPremiados = [...modulos];
  pontuacao.trilhasPremiadas = [...trilhas];
  return { pontuacao, pontosGanhos: pontuacao.pontos - antes };
}

export function resumoPontuacao(data = {}) {
  const historico = pontuacaoInicial(data);
  const atual = calcularPontosDaTrilha(data.trilha);
  return {
    pontos: historico.pontos,
    modulosConcluidos: historico.modulosConcluidos,
    modulosConcluidosTrilha: atual.modulosConcluidos,
    totalModulos: atual.totalModulos,
    trilhaCompleta: atual.trilhaCompleta,
    ...calcularNivel(historico.pontos),
  };
}

export function camposPontuacao(data, pontuacao, trilha = data.trilha, nome = null) {
  const resumo = resumoPontuacao({ ...data, pontuacao, trilha });
  return {
    pontuacao,
    pontos: resumo.pontos,
    modulosConcluidos: resumo.modulosConcluidos,
    nivel: resumo.nivel,
    titulo: resumo.titulo,
    pontosAtualizadosEm: new Date().toISOString(),
    ...(nome ? { nome } : {}),
  };
}
