/* ============================================================
   GEO MUNDO — storage.js
   IMPORTANTE: o progresso de uma partida (XP, vidas, nível, etc.)
   NÃO é mais persistido entre sessões — cada vez que o jogador
   clica em JOGAR, ele informa um nome e começa do zero.

   O que É salvo no localStorage é o RANKING: a lista dos
   resultados finais de cada partida, usada para exibir os
   melhores jogadores.
   ============================================================ */

const RANKING_KEY = "geomundo_ranking";
const RANKING_MAX = 10;
const PERFIS_JOGADORES_KEY = "geo_suite_profiles";

function normalizarNomePerfil(nome) {
  return String(nome || "").trim().replace(/\s+/g, " ").toLocaleUpperCase("pt-BR");
}

function carregarPerfisGeo() {
  try { return JSON.parse(localStorage.getItem(PERFIS_JOGADORES_KEY)) || {}; }
  catch (_) { return {}; }
}

function buscarPerfilGeo(nome) {
  return carregarPerfisGeo()[normalizarNomePerfil(nome)] || null;
}

function salvarPerfilGeo(progress) {
  if (!progress?.nome) return;
  const perfis = carregarPerfisGeo();
  const chave = normalizarNomePerfil(progress.nome);
  perfis[chave] = {
    ...(perfis[chave] || {}), nome: progress.nome,
    xp: Number(progress.xp) || 0,
    personagem: normalizarPersonagem(progress.avatar),
    nivel: Number(progress.nivel) || 1,
    atualizadoEm: Date.now()
  };
  localStorage.setItem(PERFIS_JOGADORES_KEY, JSON.stringify(perfis));
}

/**
 * Cria um objeto de progresso zerado para uma nova partida,
 * associado ao nome informado pelo jogador.
 */
function novaSessao(nome, avatar) {
  const nomeLimpo = nome && nome.trim() ? nome.trim().slice(0, 20) : "Jogador";
  const perfil = buscarPerfilGeo(nomeLimpo);
  return {
    nome: nomeLimpo,
    avatar: normalizarPersonagem(perfil?.personagem || avatar),
    xp: Number(perfil?.xp) || 0,
    nivel: Number(perfil?.nivel) || 1,
    maiorSequencia: 0,
    perguntasRespondidas: 0,
    acertos: 0,
    erros: 0,
    conquistas: [],
    historicoPerguntas: [], // ids das últimas perguntas, evita repetição imediata
    paisesDescobertos: [] // nomes dos países acertados no modo de localização (mapa)
  };
}

function caminhoAvatar(avatar) {
  // O ranking e o HUD sempre usam a imagem número 1 da família.
  return caminhoPersonagem(avatar, 1);
}

/**
 * Carrega o ranking salvo (lista de partidas finalizadas),
 * já ordenado do maior para o menor XP.
 */
function carregarRanking() {
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    if (!raw) return [];
    const lista = JSON.parse(raw);
    return Array.isArray(lista) ? lista : [];
  } catch (err) {
    console.error("Erro ao carregar ranking:", err);
    return [];
  }
}

/**
 * Limpa todo o ranking salvo (usado pelo botão "Limpar ranking").
 */
function limparRanking() {
  try {
    localStorage.removeItem(RANKING_KEY);
  } catch (err) {
    console.error("Erro ao limpar ranking:", err);
  }
}

/**
 * Adiciona o resultado de uma partida finalizada ao ranking,
 * mantendo apenas os melhores RANKING_MAX resultados.
 */
function salvarNoRanking(progress) {
  try {
    salvarPerfilGeo(progress);
    const ranking = carregarRanking();
    ranking.push({
      nome: progress.nome,
      avatar: normalizarPersonagem(progress.avatar),
      xp: progress.xp,
      nivel: progress.nivel,
      acertos: progress.acertos,
      erros: progress.erros,
      maiorSequencia: progress.maiorSequencia,
      data: Date.now()
    });
    ranking.sort((a, b) => b.xp - a.xp);
    const limitado = ranking.slice(0, RANKING_MAX);
    localStorage.setItem(RANKING_KEY, JSON.stringify(limitado));
    return limitado;
  } catch (err) {
    console.error("Erro ao salvar ranking:", err);
    return carregarRanking();
  }
}
