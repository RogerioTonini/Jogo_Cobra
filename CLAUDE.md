# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Greenfield: no application code, `package.json`, or README exists yet. The source of truth for requirements is `.llm/prd.md` (written in Portuguese) — read it before implementing anything. Keep user-facing text and docs in Portuguese (pt-BR) to match the PRD.

Classic Snake game ("jogo da cobra") in plain HTML, CSS and JavaScript — no framework, no npm dependencies. Requirements live in `.llm/prd.md` (Portuguese); keep code identifiers, UI text and docs in Portuguese (pt-BR).

PRD rules the code must keep satisfying: black background; light snake colors that change on every level-up; on-screen scoreboard; speed increases each level; level 1 requires 5 targets and each next level 3 more (`metaDoNivel(n) = 5 + 3*(n-1)`).

Note: the PRD's folder tree was copied from a calculator project (`calculadora.js`, `Calculadora`). The project follows the same pattern with snake names instead — don't recreate the calculator files.

## What to build

A classic Snake game ("jogo da cobra") in plain HTML, CSS and JavaScript (no framework). Key rules from the PRD:

- Black background; the snake uses light colors, and its color changes on every level-up.
- On-screen scoreboard (placar).
- Levels: snake speed increases each level.
- Level 1 requires collecting 5 targets; each subsequent level requires 3 more than the previous (level n → `5 + 3*(n-1)`).

## Intended architecture

The PRD's folder tree was copied from a calculator project (it names `calculadora.js`, a `Calculadora` class, history and light/dark theme). Apply the same *pattern* to the snake game rather than the literal file names:

```
src/index.html        # main page
src/css/style.css     # styles
src/js/<game>.js      # pure game logic (e.g. a Snake/Jogo class): grid, movement, collisions,
                      # targets, score, level progression. NO DOM/browser APIs — must run under Node.
src/js/app.js         # browser layer: canvas rendering, keyboard input, game loop timer, scoreboard UI
tests/<game>.test.js  # tests for the logic module using node:test
package.json          # npm scripts: start, test
.editorconfig, README.md
```

The logic/UI split exists so the game rules are testable with Node's built-in test runner without a browser. Keep the logic module deterministic (e.g. allow injecting the random source for target placement) so tests can assert on it.

## Commands (once package.json exists)

- `npm test` — run all tests (`node --test`)
- `node --test tests/<file>.test.js` — run a single test file
- `node --test --test-name-pattern="<name>"` — run tests matching a name
- `npm start` — serve/open `src/index.html` (the PRD names the script but not the server; choose a dependency-light option)

## Notes

- `.gitignore` is a generic Python/VS Code/Java/C# template; add Node entries (`node_modules/`) when introducing npm.
- The PRD lists `.gitattibutes` (typo); the actual file is `.gitattributes`.
