# Jogo da Cobra

Jogo da cobra clássico feito com HTML, CSS e JavaScript puros, sem dependências.

## Como rodar

Requisito: Node.js 20 ou superior.

```bash
npm start
```

Abra http://localhost:8080 no navegador. Para usar outra porta: `PORT=3000 npm start` (no PowerShell: `$env:PORT=3000; npm start`).

> O jogo usa módulos ES, por isso não funciona abrindo `src/index.html` direto pelo arquivo (`file://`). Use o `npm start` ou qualquer servidor estático apontando para `src/`.

## Como jogar

| Ação | Teclado | Celular |
| --- | --- | --- |
| Mover | Setas ou W A S D | Deslizar o dedo sobre o tabuleiro |
| Iniciar / jogar de novo | Enter | Tocar no tabuleiro |
| Pausar / continuar | Espaço ou P | Botão **Pausar** |

O jogo pausa sozinho ao trocar de aba ou de janela.

## Regras

- Colete os objetivos vermelhos; cada um vale **10 × nível** pontos.
- O nível 1 exige **5** objetivos; cada nível seguinte exige **3 a mais** (8, 11, 14…).
- Ao subir de nível, a cobra muda de cor, volta ao tamanho inicial no centro e fica mais rápida.
- Bater na parede ou no próprio corpo encerra a partida.
- O recorde fica salvo no navegador.

## Testes

```bash
npm test                                   # todos os testes
node --test tests/jogo.test.js             # um arquivo
node --test --test-name-pattern="nível"    # testes cujo nome contém "nível"
```

## Estrutura

```
src/
├── index.html      # página principal
├── css/style.css   # estilos (fundo preto, layout responsivo)
└── js/
    ├── jogo.js     # lógica do jogo (classe Jogo), sem dependência do navegador
    └── app.js      # interface: canvas, teclado/toque, placar e laço do jogo
tests/jogo.test.js  # testes da lógica (node:test)
scripts/servidor.js # servidor estático usado pelo npm start
```

A especificação original está em `.llm/prd.md`.
