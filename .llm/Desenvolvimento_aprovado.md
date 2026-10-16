---
name: desenvolvimento-aprovado
description: Planejamento aprovado para o desenvolvimento do Jogo da Cobra (HTML/CSS/JS), dividido em etapas.
---

# Plano: Jogo da Cobra (HTML/CSS/JS) — desenvolvimento em etapas

> Plano aprovado em 16/10/2026. Especificação de origem: `.llm/prd.md`.

## Contexto
O repositório `C:\Git-Projetos\Jogo_Cobra_claude` está vazio (sem commits); só existe a especificação `.llm/prd.md`. O PRD pede um jogo da cobra clássico em HTML, CSS e JS puros, com fundo preto, cobra de cor clara que muda a cada nível, placar, níveis com velocidade crescente e metas de 5 objetivos no nível 1 (+3 por nível). A estrutura de pastas do PRD foi copiada de um projeto de calculadora; ela será adaptada mantendo o mesmo padrão (lógica pura testável em Node + camada de interface no navegador).

## Padrões assumidos (ajustáveis)
- Bater na parede ou no próprio corpo = fim de jogo (sem atravessar bordas).
- Grade de 20×20 células, desenhada em `<canvas>`.
- Velocidade: intervalo do tick = `max(60, 150 - 15*(nível-1))` ms.
- Meta do nível n = `5 + 3*(n-1)` objetivos; ao atingir, sobe de nível, a cobra volta ao tamanho inicial e ao centro.
- Pontuação: +10 × nível por objetivo coletado; recorde salvo em `localStorage` (com try/catch).
- Cores claras em ciclo por nível (ex.: `#7CFC00`, `#00FFFF`, `#FFD700`, `#FF69B4`, `#FFFFFF`, `#ADD8E6`…).
- Sem nível máximo; controles: setas e WASD, Espaço/P para pausar, Enter para (re)iniciar.
- Sem dependências npm: `npm test` = `node --test`; `npm start` = `npx http-server src` (ou abrir `src/index.html` direto).

## Etapas

### Etapa 0 — Base do repositório
- Copiar o rascunho do `CLAUDE.md` para a raiz.
- Criar `package.json` (`"type": "module"`, scripts `start` e `test`), `.editorconfig`, `README.md` (pt-BR) e adicionar `node_modules/` ao `.gitignore`.
- Primeiro commit em `main` (isso também libera worktrees para jobs futuros).

### Etapa 1 — Lógica pura: `src/js/jogo.js`
Classe `Jogo` sem DOM, com fonte de aleatoriedade injetável (`rng`) para os testes:
- Estado: `cobra` (lista de células), `direcao`, `proximaDirecao`, `objetivo`, `nivel`, `coletadosNoNivel`, `pontos`, `estado` (`'pronto' | 'jogando' | 'pausado' | 'fim'`).
- `mudarDirecao(dir)`: ignora a inversão de 180°; só vale no próximo tick.
- `tick()`: move, detecta colisão (parede/corpo), cresce ao comer, soma pontos, sorteia novo objetivo fora do corpo, sobe de nível ao bater a meta; retorna eventos (`'comeu' | 'subiuNivel' | 'fim'`).
- Funções puras exportadas: `metaDoNivel(n)`, `intervaloDoNivel(n)`, `corDoNivel(n)`.

### Etapa 2 — Testes: `tests/jogo.test.js` (node:test)
- Movimento em cada direção; bloqueio de inversão de 180°.
- Crescimento e pontuação ao comer; objetivo nunca nasce sobre a cobra.
- Fim de jogo em parede e no próprio corpo.
- `metaDoNivel`: 1→5, 2→8, 3→11; subida de nível após a meta; velocidade aumenta; cor muda entre níveis consecutivos.

### Etapa 3 — Página e estilos: `src/index.html`, `src/css/style.css`
- Layout: título, placar (pontos, nível, objetivos `x/meta`, recorde), canvas, instruções e camada sobreposta (início/pausa/fim).
- Fundo preto, texto claro, layout centralizado e responsivo (canvas escala para caber em telas pequenas).

### Etapa 4 — Interface: `src/js/app.js`
- Importa `Jogo`; loop com `setTimeout` usando `intervaloDoNivel(nivel)` (reagenda a cada tick para refletir a nova velocidade).
- Renderização no canvas: cobra com `corDoNivel(nivel)` (cabeça levemente destacada), objetivo, grade sutil.
- Teclado (setas/WASD/Espaço/P/Enter) e controles por toque/swipe para celular.
- Atualiza o placar; mostra aviso "Nível N" ao subir; tela de fim com pontuação e recorde.

### Etapa 5 — Acabamento
- Revisar o README (como jogar, `npm start`, `npm test`) e atualizar o CLAUDE.md com os nomes reais dos arquivos.
- Commit por etapa (ou ao final de cada bloco 1–2, 3–4, 5).

## Arquivos críticos
`package.json`, `src/js/jogo.js`, `tests/jogo.test.js`, `src/index.html`, `src/css/style.css`, `src/js/app.js`, `README.md`, `CLAUDE.md`.

## Verificação
1. `npm test` — todos os testes da lógica passam.
2. `node --test tests/jogo.test.js --test-name-pattern="nível"` — filtro funciona.
3. `npm start` e abrir no navegador: conferir fundo preto, cobra clara, placar atualizando, subir para o nível 2 após 5 objetivos (meta passa a 8), cor diferente e cobra mais rápida, fim de jogo na parede/corpo, pausa e reinício, recorde mantido após recarregar a página.

---

## Situação da execução

Todas as etapas foram concluídas na branch `worktree-jogo-cobra`.

| Etapa | Situação |
| --- | --- |
| 0 — Base do repositório | Concluída (commit inicial `ad2f850` em `main`; base em `956663d`) |
| 1 — Lógica pura | Concluída (`956663d`) |
| 2 — Testes | Concluída: 17 testes, todos passando (`956663d`) |
| 3 — Página e estilos | Concluída (`c77dc94`) |
| 4 — Interface | Concluída (`c77dc94`) |
| 5 — Acabamento | Concluída: README e CLAUDE.md atualizados (`c77dc94`) |

**Desvio em relação ao plano:** o `npm start` não usa `npx http-server`. Usa um servidor estático próprio e sem dependências (`scripts/servidor.js`, porta 8080 ou `PORT`). O navegador não carrega módulos ES abrindo `src/index.html` via `file://`, por isso a opção "abrir direto" do plano não funciona.

**Verificação realizada:** `npm test` (17/17) e uma partida automatizada no Chrome headless. Ela confirmou o placar, a subida para o nível 2 com meta 8, a troca de cor (`#7CFC00` → `#00FFFF`), o aviso de nível, pausa e retomada, o fim de jogo na parede com "Novo recorde!", o recorde mantido após recarregar e o layout sem rolagem horizontal em 375 px.
