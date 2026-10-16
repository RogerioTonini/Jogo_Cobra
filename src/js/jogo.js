// Lógica pura do jogo da cobra. Não usa DOM nem APIs do navegador,
// para poder ser testada com o executor de testes do Node (node:test).

export const DIRECOES = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
};

const OPOSTAS = {
  cima: 'baixo',
  baixo: 'cima',
  esquerda: 'direita',
  direita: 'esquerda',
};

// Cores claras, em ciclo, uma por nível.
const CORES = ['#7CFC00', '#00FFFF', '#FFD700', '#FF69B4', '#FFFFFF', '#ADD8E6', '#FFA07A', '#E6E6FA'];

const TAMANHO_INICIAL = 3;

/** Quantidade de objetivos a coletar no nível n: 5 no nível 1, +3 a cada nível. */
export function metaDoNivel(n) {
  return 5 + 3 * (n - 1);
}

/** Intervalo entre movimentos (ms) no nível n; diminui a cada nível até 60 ms. */
export function intervaloDoNivel(n) {
  return Math.max(60, 150 - 15 * (n - 1));
}

/** Cor da cobra no nível n. */
export function corDoNivel(n) {
  return CORES[(n - 1) % CORES.length];
}

/** Pontos ganhos por objetivo coletado no nível n. */
export function pontosPorObjetivo(n) {
  return 10 * n;
}

export class Jogo {
  /**
   * @param {object} [opcoes]
   * @param {number} [opcoes.largura=20] colunas da grade
   * @param {number} [opcoes.altura=20] linhas da grade
   * @param {() => number} [opcoes.rng=Math.random] fonte de aleatoriedade em [0, 1)
   */
  constructor({ largura = 20, altura = 20, rng = Math.random } = {}) {
    this.largura = largura;
    this.altura = altura;
    this.rng = rng;
    this.reiniciar();
  }

  /** Volta ao estado inicial (nível 1, placar zerado), aguardando o início. */
  reiniciar() {
    this.nivel = 1;
    this.pontos = 0;
    this.coletadosNoNivel = 0;
    this.estado = 'pronto';
    this.#posicionarCobra();
    this.objetivo = this.#sortearObjetivo();
  }

  get meta() {
    return metaDoNivel(this.nivel);
  }

  get intervalo() {
    return intervaloDoNivel(this.nivel);
  }

  get cor() {
    return corDoNivel(this.nivel);
  }

  /** Começa a partida; se o jogo acabou, reinicia antes. */
  iniciar() {
    if (this.estado === 'fim') this.reiniciar();
    if (this.estado === 'pronto') this.estado = 'jogando';
  }

  alternarPausa() {
    if (this.estado === 'jogando') this.estado = 'pausado';
    else if (this.estado === 'pausado') this.estado = 'jogando';
  }

  /**
   * Agenda a mudança de direção para o próximo movimento.
   * Inverter 180° em relação à direção atual é ignorado.
   */
  mudarDirecao(nome) {
    if (!(nome in DIRECOES)) return false;
    if (this.estado === 'fim' || this.estado === 'pausado') return false;
    if (nome === OPOSTAS[this.direcao]) return false;
    this.proximaDirecao = nome;
    return true;
  }

  /**
   * Avança um movimento. Retorna a lista de eventos ocorridos:
   * 'comeu', 'subiuNivel' e/ou 'fim'.
   */
  tick() {
    if (this.estado !== 'jogando') return [];

    this.direcao = this.proximaDirecao;
    const passo = DIRECOES[this.direcao];
    const cabeca = this.cobra[0];
    const nova = { x: cabeca.x + passo.x, y: cabeca.y + passo.y };

    const comeu = this.objetivo !== null && nova.x === this.objetivo.x && nova.y === this.objetivo.y;
    // Sem comer, a cauda sai do lugar neste mesmo movimento, então pode ser ocupada.
    const corpo = comeu ? this.cobra : this.cobra.slice(0, -1);

    if (this.#foraDaGrade(nova) || corpo.some((c) => c.x === nova.x && c.y === nova.y)) {
      this.estado = 'fim';
      return ['fim'];
    }

    this.cobra.unshift(nova);
    if (!comeu) {
      this.cobra.pop();
      return [];
    }

    const eventos = ['comeu'];
    this.pontos += pontosPorObjetivo(this.nivel);
    this.coletadosNoNivel += 1;

    if (this.coletadosNoNivel >= this.meta) {
      this.nivel += 1;
      this.coletadosNoNivel = 0;
      this.#posicionarCobra();
      eventos.push('subiuNivel');
    }

    this.objetivo = this.#sortearObjetivo();
    return eventos;
  }

  #posicionarCobra() {
    const cx = Math.floor(this.largura / 2);
    const cy = Math.floor(this.altura / 2);
    this.cobra = [];
    for (let i = 0; i < TAMANHO_INICIAL; i++) this.cobra.push({ x: cx - i, y: cy });
    this.direcao = 'direita';
    this.proximaDirecao = 'direita';
  }

  #foraDaGrade({ x, y }) {
    return x < 0 || y < 0 || x >= this.largura || y >= this.altura;
  }

  /** Sorteia uma célula livre (fora da cobra); null se a grade estiver cheia. */
  #sortearObjetivo() {
    const ocupadas = new Set(this.cobra.map((c) => `${c.x},${c.y}`));
    const livres = [];
    for (let y = 0; y < this.altura; y++) {
      for (let x = 0; x < this.largura; x++) {
        if (!ocupadas.has(`${x},${y}`)) livres.push({ x, y });
      }
    }
    if (livres.length === 0) return null;
    return livres[Math.floor(this.rng() * livres.length)];
  }
}
