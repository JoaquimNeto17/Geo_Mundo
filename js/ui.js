/* ============================================================
   GEO MUNDO — ui.js
   Funções responsáveis por atualizar o DOM.
   ============================================================ */

const el = (id) => document.getElementById(id);

function mostrarTela(nomeTela) {
  ["screen-menu", "screen-game"].forEach((id) => el(id).classList.add("hidden"));
  el(nomeTela).classList.remove("hidden");

  if (nomeTela === "screen-game" && typeof geoMap !== "undefined" && geoMap) {
    geoMap.invalidateSize();
  }
}

function fecharOverlays() {
  ["overlay-result", "overlay-gameover", "overlay-vitoria", "overlay-salvar"].forEach((id) =>
    el(id).classList.add("hidden")
  );
}

function renderizarRanking(containerId, ranking, nomeDestaque) {
  const container = el(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (!ranking || ranking.length === 0) {
    container.innerHTML = '<div class="ranking-empty">Nenhuma partida registrada ainda. Jogue para entrar no ranking!</div>';
    return;
  }

  ranking.forEach((entrada, i) => {
    const row = document.createElement("div");
    row.className = "ranking-row" + (nomeDestaque && entrada.nome === nomeDestaque && i === 0 ? " destaque" : "");
    const posicao = document.createElement("span");
    posicao.className = "ranking-pos";
    posicao.textContent = `${i + 1}°`;

    const avatar = document.createElement("img");
    avatar.className = "ranking-avatar";
    avatar.src = caminhoAvatar(entrada.avatar);
    avatar.alt = "";

    const nome = document.createElement("span");
    nome.className = "ranking-nome";
    nome.textContent = entrada.nome;

    const xp = document.createElement("span");
    xp.className = "ranking-xp";
    xp.textContent = `${entrada.xp} XP`;

    row.append(posicao, avatar, nome, xp);
    container.appendChild(row);
  });
}

function atualizarRankingGlobal() {
  const ranking = carregarRanking();
  renderizarRanking("ranking-list", ranking);
  renderizarRanking("go-ranking-list", ranking);
}

// HEADER SIMPLIFICADA
function atualizarHudJogo(progress, regiao) {
  // Nome do jogador
  el("hud-nome").textContent = progress.nome;
  el("hud-avatar").src = caminhoAvatar(progress.avatar);
  el("hud-avatar").alt = `Personagem de ${progress.nome}`;
  
  // Nível
  const nivelTexto = "Nível " + progress.nivel + (regiao.nomeNivel ? " · " + regiao.nomeNivel : "");
  el("hud-nivel").textContent = nivelTexto;
  
  // XP
  el("hud-xp").textContent = progress.xp + " XP";
}

function renderizarPergunta(pergunta) {
  el("question-text").textContent = pergunta.pergunta;
  el("hint-box-wrap").innerHTML = "";

  const letras = ["A", "B", "C", "D"];
  const container = el("answers");
  container.innerHTML = "";

  pergunta.alternativas.forEach((texto, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.dataset.index = i;
    btn.innerHTML = `<span class="answer-letter">${letras[i]}</span><span>${texto}</span>`;
    container.appendChild(btn);
  });
}

function marcarRespostaSelecionada(index) {
  document.querySelectorAll(".answer-btn").forEach((btn) => {
    btn.classList.toggle("selected", Number(btn.dataset.index) === index);
  });
}

function revelarResposta(indexCorreta, indexEscolhida) {
  document.querySelectorAll(".answer-btn").forEach((btn) => {
    const i = Number(btn.dataset.index);
    btn.disabled = true;
    if (i === indexCorreta) btn.classList.add("correct");
    else if (i === indexEscolhida) btn.classList.add("wrong");
  });
}

function renderizarVidas(vidasAtuais, vidasMax) {
  const container = el("lives");
  container.innerHTML = "";
  for (let i = 0; i < vidasMax; i++) {
    const span = document.createElement("span");
    span.className = "life" + (i >= vidasAtuais ? " lost" : "");
    span.textContent = "❤️";
    container.appendChild(span);
  }
}

function atualizarStreakUI(streak) {
  el("streak-value").textContent = streak;
}

function mostrarDica(texto) {
  const wrap = el("hint-box-wrap");
  const box = document.createElement("div");
  box.className = "hint-box";
  box.textContent = texto;
  wrap.appendChild(box);
}

function mostrarResultado({ acertou, pergunta, xpGanho, progress, regiaoNome }) {
  const panel = el("result-panel");
  panel.className = "result-panel " + (acertou ? "correct" : "wrong");

  el("result-icon").textContent = acertou ? "✅" : "❌";
  el("result-icon").className = "result-icon " + (acertou ? "correct" : "wrong");
  el("result-title").textContent = acertou ? "CORRETO!" : "ERRADO!";
  el("result-title").className = "result-title " + (acertou ? "correct" : "wrong");

  const sequenciaEspecial = acertou && progress.streakAtual >= 3;
  const mascot = el("result-mascot");
  const reactionLabel = el("result-reaction-label");
  // 2 é sempre feliz; 3 é sempre bravo. Sequências mudam o texto, não a emoção.
  mascot.src = caminhoPersonagem(progress.avatar, acertou ? 2 : 3);
  mascot.alt = acertou
    ? (sequenciaEspecial ? "Mascote comemorando sua sequência" : "Mascote comemorando o acerto")
    : "Mascote refletindo sobre a resposta";
  reactionLabel.textContent = acertou
    ? (sequenciaEspecial ? `SEQUÊNCIA DE ${progress.streakAtual}!` : "MUITO BEM!")
    : "CONTINUE TENTANDO!";
  reactionLabel.className = "reaction-label " + (acertou ? "correct" : "wrong");

  if (acertou) {
    el("result-desc").innerHTML = `Parabéns! A resposta certa era <strong>${pergunta.alternativas[pergunta.resposta]}</strong>.`;
  } else {
    el("result-desc").innerHTML = `A resposta correta é <strong>${pergunta.alternativas[pergunta.resposta]}</strong>.`;
  }

  el("result-xp").textContent = (xpGanho >= 0 ? "+" : "") + xpGanho + " XP";
  el("result-xp").className = "result-xp " + (acertou ? "correct" : "wrong");

  el("status-xp").textContent = progress.xp;
  el("status-streak").textContent = progress.streakAtual;
  el("status-nivel").textContent = progress.nivel;
  el("status-regiao").textContent = regiaoNome;
  el("status-paises").textContent = progress.paisesDescobertos.length;

  document.querySelectorAll(".status-row").forEach((row) => row.classList.remove("correct", "wrong"));

  el("overlay-result").classList.remove("hidden");
}

function atualizarContador(valor) {
  el("countdown-ring").textContent = valor;
}

function mostrarGameOver(stats, ranking) {
  // A reação 4 (triste) fica reservada para o encerramento da partida.
  el("go-mascot").src = caminhoPersonagem(stats.avatar, 4);
  el("go-nome").textContent = stats.nome + ", sua jornada terminou";
  el("go-xp").textContent = stats.xp;
  el("go-respondidas").textContent = stats.perguntasRespondidas;
  el("go-acertos").textContent = stats.acertos;
  el("go-erros").textContent = stats.erros;
  el("go-streak").textContent = stats.maiorSequencia;
  renderizarRanking("go-ranking-list", ranking || carregarRanking(), stats.nome);
  el("overlay-gameover").classList.remove("hidden");
}

function mostrarVitoria({ regiaoNome, xpGanho, acertos, total, avatar }) {
  // Nível concluído é uma situação positiva: sempre usa a reação 2 (feliz).
  el("vitoria-mascot").src = caminhoPersonagem(avatar, 2);
  el("vitoria-regiao").textContent = regiaoNome;
  el("vitoria-xp").textContent = "+" + xpGanho + " XP";
  el("vitoria-acertos").textContent = acertos + "/" + total;
  el("overlay-vitoria").classList.remove("hidden");
}

function renderizarPainelExploracao(nome, dados) {
  const mapColumn = document.querySelector(".map-column");
  let painel = document.getElementById("explore-panel");
  if (painel) painel.remove();

  painel = document.createElement("div");
  painel.id = "explore-panel";
  painel.className = "explore-panel";
  painel.innerHTML = `
    <div class="explore-flag">${dados.bandeira}</div>
    <div class="explore-name">${nome.toUpperCase()}</div>
    <div class="explore-row"><span>Continente</span><span>${dados.continente}</span></div>
    <div class="explore-row"><span>Capital</span><span>${dados.capital}</span></div>
    <div class="explore-row"><span>Idioma</span><span>${dados.idioma}</span></div>
    <div class="explore-row"><span>Moeda</span><span>${dados.moeda}</span></div>
    <button class="btn btn-primary" id="btn-desafiar-pais" style="width:100%; margin-top:6px;">DESAFIAR ESTE PAÍS</button>
  `;
  mapColumn.appendChild(painel);
  return painel;
}
