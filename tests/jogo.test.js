import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Jogo, metaDoNivel, intervaloDoNivel, corDoNivel, pontosPorObjetivo } from '../src/js/jogo.js';

// rng fixo em 0: o objetivo nasce na primeira célula livre, (0, 0), longe do caminho da cobra.
function novoJogo(opcoes = {}) {
  const jogo = new Jogo({ rng: () => 0, ...opcoes });
  jogo.iniciar();
  return jogo;
}

function cabeca(jogo) {
  return jogo.cobra[0];
}

/** Coloca o objetivo na célula à frente da cabeça e avança um movimento. */
function comerAFrente(jogo) {
  const { x, y } = cabeca(jogo);
  const passo = { cima: [0, -1], baixo: [0, 1], esquerda: [-1, 0], direita: [1, 0] }[jogo.proximaDirecao];
  jogo.objetivo = { x: x + passo[0], y: y + passo[1] };
  return jogo.tick();
}

describe('regras de nível', () => {
  test('meta do nível: 5 no nível 1 e +3 a cada nível', () => {
    assert.equal(metaDoNivel(1), 5);
    assert.equal(metaDoNivel(2), 8);
    assert.equal(metaDoNivel(3), 11);
  });

  test('velocidade aumenta a cada nível (intervalo menor), com limite mínimo', () => {
    assert.ok(intervaloDoNivel(2) < intervaloDoNivel(1));
    assert.ok(intervaloDoNivel(3) < intervaloDoNivel(2));
    assert.equal(intervaloDoNivel(100), 60);
  });

  test('cor muda entre níveis consecutivos', () => {
    for (let n = 1; n < 20; n++) assert.notEqual(corDoNivel(n), corDoNivel(n + 1));
  });

  test('pontuação por objetivo cresce com o nível', () => {
    assert.equal(pontosPorObjetivo(1), 10);
    assert.equal(pontosPorObjetivo(3), 30);
  });
});

describe('estado da partida', () => {
  test('não se move antes de iniciar nem pausado', () => {
    const jogo = new Jogo({ rng: () => 0 });
    const inicio = { ...cabeca(jogo) };
    assert.deepEqual(jogo.tick(), []);
    assert.deepEqual(cabeca(jogo), inicio);

    jogo.iniciar();
    jogo.alternarPausa();
    assert.equal(jogo.estado, 'pausado');
    jogo.tick();
    assert.deepEqual(cabeca(jogo), inicio);

    jogo.alternarPausa();
    assert.equal(jogo.estado, 'jogando');
  });

  test('iniciar após o fim reinicia nível e placar', () => {
    const jogo = novoJogo();
    comerAFrente(jogo);
    jogo.estado = 'fim';
    jogo.iniciar();
    assert.equal(jogo.estado, 'jogando');
    assert.equal(jogo.pontos, 0);
    assert.equal(jogo.nivel, 1);
    assert.equal(jogo.cobra.length, 3);
  });
});

describe('movimento', () => {
  test('move uma célula em cada direção', () => {
    const casos = [
      ['direita', 1, 0],
      ['cima', 0, -1],
      ['baixo', 0, 1],
    ];
    for (const [dir, dx, dy] of casos) {
      const jogo = novoJogo();
      const { x, y } = cabeca(jogo);
      jogo.mudarDirecao(dir);
      jogo.tick();
      assert.deepEqual(cabeca(jogo), { x: x + dx, y: y + dy }, dir);
      assert.equal(jogo.cobra.length, 3);
    }

    const jogo = novoJogo();
    jogo.mudarDirecao('cima');
    jogo.tick();
    const { x, y } = cabeca(jogo);
    jogo.mudarDirecao('esquerda');
    jogo.tick();
    assert.deepEqual(cabeca(jogo), { x: x - 1, y });
  });

  test('ignora inversão de 180°', () => {
    const jogo = novoJogo();
    const { x, y } = cabeca(jogo);
    assert.equal(jogo.mudarDirecao('esquerda'), false);
    jogo.tick();
    assert.deepEqual(cabeca(jogo), { x: x + 1, y });
  });

  test('duas teclas no mesmo movimento não permitem voltar sobre o corpo', () => {
    const jogo = novoJogo();
    jogo.mudarDirecao('cima');
    jogo.mudarDirecao('esquerda'); // oposta à direção atual (direita): ignorada
    jogo.tick();
    assert.notEqual(jogo.estado, 'fim');
    assert.equal(jogo.direcao, 'cima');
  });

  test('direção inválida é ignorada', () => {
    const jogo = novoJogo();
    assert.equal(jogo.mudarDirecao('diagonal'), false);
    assert.equal(jogo.proximaDirecao, 'direita');
  });
});

describe('objetivos e pontuação', () => {
  test('ao comer, cresce e soma pontos', () => {
    const jogo = novoJogo();
    const eventos = comerAFrente(jogo);
    assert.deepEqual(eventos, ['comeu']);
    assert.equal(jogo.cobra.length, 4);
    assert.equal(jogo.pontos, 10);
    assert.equal(jogo.coletadosNoNivel, 1);
  });

  test('objetivo nunca nasce sobre a cobra', () => {
    for (const r of [0, 0.25, 0.5, 0.75, 0.9999]) {
      const jogo = new Jogo({ largura: 5, altura: 5, rng: () => r });
      jogo.iniciar();
      for (let i = 0; i < 3; i++) {
        const { x, y } = jogo.objetivo;
        assert.ok(!jogo.cobra.some((c) => c.x === x && c.y === y));
        comerAFrente(jogo);
        jogo.mudarDirecao('baixo');
        if (jogo.estado === 'fim') break;
      }
    }
  });

  test('sobe de nível ao atingir a meta', () => {
    const jogo = novoJogo();
    const corAntes = jogo.cor;
    const intervaloAntes = jogo.intervalo;
    let eventos = [];
    for (let i = 0; i < metaDoNivel(1); i++) {
      eventos = comerAFrente(jogo);
      jogo.mudarDirecao(i % 2 === 0 ? 'cima' : 'direita');
    }
    assert.deepEqual(eventos, ['comeu', 'subiuNivel']);
    assert.equal(jogo.nivel, 2);
    assert.equal(jogo.meta, 8);
    assert.equal(jogo.coletadosNoNivel, 0);
    assert.equal(jogo.pontos, 50);
    assert.equal(jogo.cobra.length, 3, 'cobra volta ao tamanho inicial');
    assert.notEqual(jogo.cor, corAntes);
    assert.ok(jogo.intervalo < intervaloAntes);
  });
});

describe('fim de jogo', () => {
  test('bater na parede encerra o jogo', () => {
    const jogo = novoJogo({ largura: 20 });
    const distancia = jogo.largura - 1 - cabeca(jogo).x;
    for (let i = 0; i < distancia; i++) jogo.tick();
    assert.equal(jogo.estado, 'jogando');
    assert.deepEqual(jogo.tick(), ['fim']);
    assert.equal(jogo.estado, 'fim');
  });

  test('bater no próprio corpo encerra o jogo', () => {
    const jogo = novoJogo();
    // Cobra em "U": cabeça em (5,5), indo para a direita, onde está o corpo em (6,5).
    jogo.cobra = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
    ];
    jogo.direcao = 'cima';
    jogo.mudarDirecao('direita');
    assert.deepEqual(jogo.tick(), ['fim']);
  });

  test('pode ocupar a célula que a cauda acabou de deixar', () => {
    const jogo = novoJogo();
    // Quadrado 2x2: a cabeça entra onde estava a cauda.
    jogo.cobra = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 6, y: 5 },
    ];
    jogo.direcao = 'cima';
    jogo.mudarDirecao('direita');
    assert.deepEqual(jogo.tick(), []);
    assert.equal(jogo.estado, 'jogando');
  });

  test('não aceita mudar de direção após o fim', () => {
    const jogo = novoJogo();
    jogo.estado = 'fim';
    assert.equal(jogo.mudarDirecao('cima'), false);
  });
});
