---
name: prd
description: Este arquivo é para o desenvolvimento do jogo da cobra (clássico). Deverá ser desenvolvido em js, html e css. 
---

# Projeto 

## Especificações

1. Linguagens de desenvolvimento: HTML, CSS e JavaScript. 
2. A cor de fundo deverá ser preta.
3. As cores da cobra deverão ser claras.
4. Ao mudar de nível a cor da cobra deverá ser alterada.
5. O jogo deverá ter um placar.
6. O jogo deverá ter níveis de dificuldade.
7. Ao mudar de nível a velocidade de movimento da cobra deverá ser aumentada.
8. O nível 1 deverá ter 5 objetivos a serem coletados.
9. A partir do nível 2, a quantidade de objetivos deverá aumentar em 3 unidades a cada nível.
10. Estrutura de pastas a ser utilizada:

Jogo_Cobra_claude/
├── src/                    # Código da aplicação
│   ├── index.html          # Página principal
│   ├── css/
│   │   └── style.css       # Estilos e temas claro/escuro
│   └── js/
│       ├── calculadora.js  # Lógica (classe Calculadora), sem dependência do navegador
│       └── app.js          # Interface: botões, teclado, histórico e tema
├── tests/
│   └── calculadora.test.js # Testes da lógica (node:test)
├── .editorconfig           # Padrão de formatação entre editores
├── .gitattibutes
├── .gitignore
├── package.json            # Scripts npm (start, test)
└── README.md
