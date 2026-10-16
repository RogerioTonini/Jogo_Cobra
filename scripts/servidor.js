// Servidor estático mínimo (sem dependências) para servir a pasta src/.
// Necessário porque o navegador não carrega módulos ES abrindo o HTML via file://.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('../src', import.meta.url)));
const PORTA = Number(process.env.PORT) || 8080;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const servidor = createServer(async (req, res) => {
  const caminhoUrl = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relativo = caminhoUrl.endsWith('/') ? caminhoUrl + 'index.html' : caminhoUrl;
  const arquivo = normalize(join(RAIZ, relativo));

  // Impede acesso a arquivos fora de src/.
  if (arquivo !== RAIZ && !arquivo.startsWith(RAIZ + sep)) {
    res.writeHead(403).end('Acesso negado');
    return;
  }

  try {
    const conteudo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] ?? 'application/octet-stream' });
    res.end(conteudo);
  } catch {
    res.writeHead(404).end('Não encontrado');
  }
});

servidor.listen(PORTA, () => {
  console.log(`Jogo da Cobra em http://localhost:${PORTA}`);
});
