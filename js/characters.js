/* ============================================================
   GEO MUNDO — Catálogo de personagens e suas reações.

   Convenção dos arquivos:
   1 = perfil/seleção, 2 = feliz, 3 = bravo, 4 = triste.
   ============================================================ */

const PERSONAGENS = {
  classica: {
    nome: "Clássica",
    descricao: "A exploradora original",
    caminho: (reacao) => `assets/personagens/classic_${reacao}.png`
  },
  bone: {
    nome: "Boné",
    descricao: "Pronta para qualquer aventura",
    caminho: (reacao) => `assets/personagens/bone_${reacao}.png`
  },
  brasa: {
    nome: "Brasil",
    descricao: "Apaixonada pelo Brasil",
    caminho: (reacao) => `assets/personagens/brasa_${reacao}.png`
  },
  escot: {
    nome: "Exploradora",
    descricao: "Especialista em novas rotas",
    caminho: (reacao) => `assets/personagens/escot_${reacao}.png`
  },
  maloka: {
    nome: "Maloka",
    descricao: "Estilo e muita confiança",
    caminho: (reacao) => `assets/personagens/maloka_${reacao}.png`
  },
  terno: {
    nome: "Terno",
    descricao: "Elegante e estratégica",
    caminho: (reacao) => `assets/personagens/terno_${reacao}.png`
  }
};

function personagemValido(id) {
  return Boolean(PERSONAGENS[id]);
}

function normalizarPersonagem(id) {
  // Compatibilidade com rankings criados antes das famílias de personagens.
  if (/^mascote-[1-5]$/.test(id || "")) return "classica";
  return personagemValido(id) ? id : "classica";
}

function caminhoPersonagem(id, reacao = 1) {
  const personagem = PERSONAGENS[normalizarPersonagem(id)];
  const numero = Math.max(1, Math.min(4, Number(reacao) || 1));
  return personagem.caminho(numero);
}

function renderizarOpcoesPersonagens() {
  const container = document.getElementById("avatar-options");
  if (!container) return;
  container.innerHTML = "";

  Object.entries(PERSONAGENS).forEach(([id, personagem]) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "avatar-option";
    botao.dataset.avatar = id;
    botao.setAttribute("aria-label", `Escolher personagem ${personagem.nome}`);
    botao.setAttribute("aria-pressed", "false");

    const imagem = document.createElement("img");
    imagem.src = caminhoPersonagem(id, 1);
    imagem.alt = personagem.nome;

    const textos = document.createElement("span");
    textos.className = "avatar-option-copy";
    const nome = document.createElement("strong");
    nome.textContent = personagem.nome;
    const descricao = document.createElement("small");
    descricao.textContent = personagem.descricao;
    textos.append(nome, descricao);

    botao.append(imagem, textos);
    container.appendChild(botao);
  });
}
