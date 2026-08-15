/* ============================================================
   GEO MUNDO — Efeitos sonoros gerados com Web Audio API.
   Não depende de arquivos externos e respeita a escolha do usuário.
   ============================================================ */

const SOUND_KEY = "geomundo_sound_enabled";
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
let audioContext = null;

function obterAudioContext() {
  if (!soundEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function tocarNota(frequencia, inicio, duracao, tipo = "sine", volume = 0.08) {
  const ctx = obterAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const startAt = ctx.currentTime + inicio;
  const endAt = startAt + duracao;

  oscillator.type = tipo;
  oscillator.frequency.setValueAtTime(frequencia, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

function tocarSom(tipo) {
  if (!soundEnabled) return;

  const efeitos = {
    clique: [[440, 0, 0.07, "sine", 0.035]],
    acerto: [[523, 0, 0.12], [659, 0.1, 0.13], [784, 0.2, 0.18]],
    erro: [[220, 0, 0.16, "triangle", 0.06], [175, 0.13, 0.22, "triangle", 0.05]],
    sequencia: [[659, 0, 0.1], [784, 0.08, 0.1], [988, 0.16, 0.2]],
    vitoria: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1047, 0.3, 0.3]],
    gameover: [[294, 0, 0.18, "triangle", 0.055], [247, 0.16, 0.18, "triangle", 0.05], [196, 0.32, 0.3, "triangle", 0.045]],
    dica: [[880, 0, 0.08, "sine", 0.035], [988, 0.1, 0.12, "sine", 0.035]]
  };

  (efeitos[tipo] || efeitos.clique).forEach(([freq, inicio, duracao, onda, volume]) =>
    tocarNota(freq, inicio, duracao, onda, volume)
  );
}

function atualizarBotoesSom() {
  document.querySelectorAll("[data-sound-toggle]").forEach((botao) => {
    botao.classList.toggle("muted", !soundEnabled);
    botao.setAttribute("aria-pressed", String(soundEnabled));
    botao.setAttribute("aria-label", soundEnabled ? "Desativar sons" : "Ativar sons");
    const icon = botao.querySelector(".sound-toggle-icon");
    const label = botao.querySelector(".sound-toggle-label");
    if (icon) icon.textContent = soundEnabled ? "♪" : "×";
    if (label) label.textContent = soundEnabled ? "SOM" : "MUDO";
  });
}

function alternarSom() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, String(soundEnabled));
  atualizarBotoesSom();
  if (soundEnabled) tocarSom("clique");
}

function iniciarControlesSom() {
  atualizarBotoesSom();
  document.querySelectorAll("[data-sound-toggle]").forEach((botao) =>
    botao.addEventListener("click", alternarSom)
  );
}
