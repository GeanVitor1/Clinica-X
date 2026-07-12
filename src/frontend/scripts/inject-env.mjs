/**
 * Gera environment.prod.ts a partir de variáveis de ambiente (Vercel / CI).
 *
 * Variáveis suportadas:
 *   API_URL  ou  NG_APP_API_URL   → base da API, ex: https://api.up.railway.app
 *   (paths /api e /hub/notificacoes são anexados automaticamente se a URL não terminar com /api)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

function normalizeApiBase(raw) {
  if (!raw || !String(raw).trim()) return null;
  let base = String(raw).trim().replace(/\/+$/, '');
  // Se já termina com /api, remove para montar apiUrl e hubUrl
  if (base.toLowerCase().endsWith('/api')) {
    base = base.slice(0, -4);
  }
  return base;
}

const raw =
  process.env.API_URL ||
  process.env.NG_APP_API_URL ||
  process.env.VITE_API_URL ||
  '';

const base = normalizeApiBase(raw);

// Fallback: relative paths (só funciona se frontend e API no mesmo domínio / proxy)
const apiUrl = base ? `${base}/api` : '/api';
const hubUrl = base ? `${base}/hub/notificacoes` : '/hub/notificacoes';

const content = `// Gerado automaticamente por scripts/inject-env.mjs — não edite à mão no CI
export const environment = {
  production: true,
  apiUrl: ${JSON.stringify(apiUrl)},
  hubUrl: ${JSON.stringify(hubUrl)},
};
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, content, 'utf8');
console.log(`[inject-env] production apiUrl=${apiUrl}`);
console.log(`[inject-env] production hubUrl=${hubUrl}`);
