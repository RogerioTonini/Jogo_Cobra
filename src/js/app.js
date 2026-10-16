// Camada de interface: desenho no canvas, teclado/toque, placar e laço do jogo.
// Toda regra do jogo fica em jogo.js.
import { Jogo, DIRECOES } from './jogo.js';

const CHAVE_RECORDE = 'jogo-cobra:recorde';
const COR_OBJETIVO = '#ff4d4d';
const COR_GRADE = '#111';
const PAUSA_AO_SUBIR_NIVEL = 1000; // ms antes de retomar após subir de nível
const DISTANCIA_MINIMA_DESLIZE = 24; // px

const TECLAS = {
  ArrowUp: 'cima',
  KeyW: 'cima',
  ArrowDown: 'baixo',
  KeyS: 'baixo',
  ArrowLeft: 'esquerda',
  KeyA: 'esquerda',
  ArrowRight: 'direita',
  KeyD: 'direita',
};

const jogo = new Jogo();
const tela = document.getElementById('tela');
const ctx = tela.getContext('2d');

const el = {
  pontos: document.getElementById('pontos'),
  nivel: document.getElementById('nivel'),
  objetivos: document.getElementById('objetivos'),
  recorde: document.getElementById('recorde'),
  sobreposicao: document.getElementById('sobreposicao'),
  tituloSobreposicao: document.getElementById('titulo-sobreposicao'),
  textoSobreposicao: document.getElementById('texto-sobreposicao'),
  avisoNivel: document.getElementById('aviso-nivel'),
  botaoPausa: document.getElementById('botao-pausa'),
  tabuleiro: document.getElementById('tabuleiro'),
};

let temporizador = null;
let temporizadorAviso = null;
let recorde = lerRecorde();
let recordeBatido = false;

// ---------- Recorde (localStorage pode estar indisponível) ----------

function lerRecorde() {
  try {
    return Number(localStorage.getItem(CHAVE_RECORDE)) || 0;
  } catch {
    return 0;
  }
}

function salvarRecorde(valor) {
  try {
    localStorage.setItem(CHAVE_RECORDE, String(valor));
  } catch {
    // sem armazenamento: o recorde vale só para esta sessão
  }
}

// ---------- Laço do jogo ----------

function agendar(atraso = jogo.intervalo) {
  clearTimeout(temporizador);
  temporizador = setTimeout(passo, atraso);
}

function parar() {
  clearTimeout(temporizador);
  temporizador = null;
}

function passo() {
  const eventos = jogo.tick();

  if (eventos.includes('comeu') && jogo.pontos > recorde) {
    recorde = jogo.pontos;
    recordeBatido = true;
    salvarRecorde(recorde);
  }

  atualizarPlacar();
  desenhar();

  if (eventos.includes('fim')) {
    parar();
    atualizarInterface();
    return;
  }

  if (eventos.includes('subiuNivel')) {
    mostrarAvisoNivel();
    agendar(PAUSA_AO_SUBIR_NIVEL);
    return;
  }

  if (jogo.estado === 'jogando') agendar();
}

function comecar() {
  if (jogo.estado !== 'pronto' && jogo.estado !== 'fim') return;
  if (jogo.estado === 'fim') recordeBatido = false;
  jogo.iniciar();
  atualizarPlacar();
  atualizarInterface();
  desenhar();
  agendar();
}

function alternarPausa() {
  jogo.alternarPausa();
  if (jogo.estado === 'jogando') agendar();
  else parar();
  atualizarInterface();
}

function pausarSeJogando() {
  if (jogo.estado === 'jogando') alternarPausa();
}

function direcionar(direcao) {
  if (jogo.estado === 'pronto') comecar();
  jogo.mudarDirecao(direcao);
}

// ---------- Interface ----------

function atualizarPlacar() {
  el.pontos.textContent = jogo.pontos;
  el.nivel.textContent = jogo.nivel;
  el.objetivos.textContent = `${jogo.coletadosNoNivel}/${jogo.meta}`;
  el.recorde.textContent = recorde;
  document.documentElement.style.setProperty('--cor-cobra', jogo.cor);
}

function atualizarInterface() {
  const { estado } = jogo;
  el.botaoPausa.disabled = estado !== 'jogando' && estado !== 'pausado';
  el.botaoPausa.textContent = estado === 'pausado' ? 'Continuar' : 'Pausar';

  if (estado === 'jogando') {
    el.sobreposicao.hidden = true;
    return;
  }

  el.sobreposicao.hidden = false;
  if (estado === 'pronto') {
    el.tituloSobreposicao.textContent = 'Pronto?';
    el.textoSobreposicao.textContent = 'Pressione Enter ou toque aqui para começar';
  } else if (estado === 'pausado') {
    el.tituloSobreposicao.textContent = 'Pausado';
    el.textoSobreposicao.textContent = 'Espaço, P ou toque aqui para continuar';
  } else {
    el.tituloSobreposicao.textContent = recordeBatido ? 'Novo recorde!' : 'Fim de jogo';
    el.textoSobreposicao.textContent =
      `Pontos: ${jogo.pontos} · Nível ${jogo.nivel}\n` + 'Enter ou toque aqui para jogar de novo';
  }
}

function mostrarAvisoNivel() {
  clearTimeout(temporizadorAviso);
  el.avisoNivel.textContent = `Nível ${jogo.nivel}`;
  el.avisoNivel.hidden = true;
  void el.avisoNivel.offsetWidth; // reinicia a animação CSS
  el.avisoNivel.hidden = false;
  temporizadorAviso = setTimeout(() => {
    el.avisoNivel.hidden = true;
  }, 1200);
}

// ---------- Desenho ----------

function ajustarResolucao() {
  const dpr = window.devicePixelRatio || 1;
  const lado = Math.round(tela.clientWidth * dpr);
  if (lado > 0 && tela.width !== lado) {
    tela.width = lado;
    tela.height = lado;
  }
  desenhar();
}

function retangulo(x, y, largura, altura, raio) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, largura, altura, raio);
  else ctx.rect(x, y, largura, altura);
  ctx.fill();
}

function desenhar() {
  const celula = tela.width / jogo.largura;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, tela.width, tela.height);

  // Grade sutil
  ctx.strokeStyle = COR_GRADE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < jogo.largura; i++) {
    const p = Math.round(i * celula) + 0.5;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, tela.height);
    ctx.moveTo(0, p);
    ctx.lineTo(tela.width, p);
  }
  ctx.stroke();

  // Objetivo
  if (jogo.objetivo) {
    const { x, y } = jogo.objetivo;
    ctx.save();
    ctx.fillStyle = COR_OBJETIVO;
    ctx.shadowColor = COR_OBJETIVO;
    ctx.shadowBlur = celula * 0.6;
    ctx.beginPath();
    ctx.arc((x + 0.5) * celula, (y + 0.5) * celula, celula * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Cobra: cabeça na cor cheia, corpo esmaecendo até a cauda
  const margem = Math.max(1, celula * 0.08);
  const total = jogo.cobra.length;
  ctx.fillStyle = jogo.cor;
  jogo.cobra.forEach((parte, i) => {
    ctx.globalAlpha = i === 0 ? 1 : 0.9 - (0.4 * i) / Math.max(1, total - 1);
    retangulo(
      parte.x * celula + margem,
      parte.y * celula + margem,
      celula - margem * 2,
      celula - margem * 2,
      celula * 0.25,
    );
  });
  ctx.globalAlpha = 1;

  desenharOlhos(celula);
}

function desenharOlhos(celula) {
  const cabeca = jogo.cobra[0];
  const { x: dx, y: dy } = DIRECOES[jogo.direcao];
  const cx = (cabeca.x + 0.5) * celula;
  const cy = (cabeca.y + 0.5) * celula;
  const frente = celula * 0.18;
  const lado = celula * 0.18;
  ctx.fillStyle = '#000';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + dx * frente - dy * lado * s, cy + dy * frente + dx * lado * s, celula * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- Entrada ----------

document.addEventListener('keydown', (e) => {
  const direcao = TECLAS[e.code];
  if (direcao) {
    e.preventDefault();
    direcionar(direcao);
    return;
  }

  if (e.code === 'Space' || e.code === 'KeyP') {
    e.preventDefault();
    alternarPausa();
  } else if (e.code === 'Enter') {
    e.preventDefault();
    if (jogo.estado === 'pausado') alternarPausa();
    else comecar();
  }
});

el.sobreposicao.addEventListener('click', () => {
  if (jogo.estado === 'pausado') alternarPausa();
  else comecar();
});

el.botaoPausa.addEventListener('click', (e) => {
  alternarPausa();
  e.currentTarget.blur(); // Espaço não deve "clicar" o botão de novo
});

let toqueInicial = null;

el.tabuleiro.addEventListener(
  'touchstart',
  (e) => {
    const t = e.changedTouches[0];
    toqueInicial = { x: t.clientX, y: t.clientY };
  },
  { passive: true },
);

el.tabuleiro.addEventListener('touchend', (e) => {
  if (!toqueInicial) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - toqueInicial.x;
  const dy = t.clientY - toqueInicial.y;
  toqueInicial = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < DISTANCIA_MINIMA_DESLIZE) return; // foi um toque, não deslize

  e.preventDefault(); // evita o "click" na sobreposição após o deslize
  if (Math.abs(dx) > Math.abs(dy)) direcionar(dx > 0 ? 'direita' : 'esquerda');
  else direcionar(dy > 0 ? 'baixo' : 'cima');
});

// Pausa automaticamente ao trocar de aba ou janela.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pausarSeJogando();
});
window.addEventListener('blur', pausarSeJogando);

new ResizeObserver(ajustarResolucao).observe(tela);

atualizarPlacar();
atualizarInterface();
ajustarResolucao();
