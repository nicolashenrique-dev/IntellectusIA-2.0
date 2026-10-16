import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../backend/package.json', import.meta.url));
const { parse } = require('dotenv');
const root = fileURLToPath(new URL('../', import.meta.url));
const npx = join(dirname(process.execPath), 'node_modules/npm/bin/npx-cli.js');
const scope = 'ornicolas-projects';
const readEnv = (directory) => {
  const result = {};
  for (const name of ['.env', '.env.production.local']) {
    const path = join(root, directory, name);
    if (existsSync(path)) Object.assign(result, parse(readFileSync(path)));
  }
  return result;
};
function run(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npx, '--yes', 'vercel', ...args], {
      cwd: root,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve()
        : reject(new Error('Vercel retornou erro. Verifique autenticação e acesso ao projeto.')),
    );
    child.stdin.on('error', () => {});
    child.stdin.end(input || '');
  });
}
const projects = [
  {
    directory: 'frontend',
    framework: 'vite',
    keys: [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_FIREBASE_MEASUREMENT_ID',
      'VITE_API_URL',
    ],
  },
  {
    directory: 'backend',
    framework: 'express',
    keys: [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_SERVICE_ACCOUNT',
      'JWT_SECRET',
      'GEMINI_API_KEY',
      'YOUTUBE_API_KEY',
    ],
  },
];
for (const project of projects) {
  const env = readEnv(project.directory);
  const linked = JSON.parse(readFileSync(join(root, project.directory, '.vercel/project.json')));
  await run(
    [
      'api',
      '/v9/projects/' + linked.projectId + '?teamId=' + linked.orgId,
      '--method',
      'PATCH',
      '--input',
      '-',
      '--silent',
      '--scope',
      scope,
    ],
    JSON.stringify({ framework: project.framework, nodeVersion: '24.x' }),
  );
  console.log(
    'Configurado projeto ' + project.directory + ': ' + project.framework + ', Node 24.x.',
  );
  for (const key of project.keys) {
    if (!env[key]) {
      console.log('PENDENTE: ' + project.directory + '/' + key);
      continue;
    }
    const value =
      key === 'FIREBASE_SERVICE_ACCOUNT' ? JSON.stringify(JSON.parse(env[key])) : env[key];
    await run(
      [
        'env',
        'add',
        key,
        'production,preview',
        '--force',
        '--yes',
        '--cwd',
        project.directory,
        '--scope',
        scope,
        project.directory === 'backend' && key !== 'FIREBASE_PROJECT_ID'
          ? '--sensitive'
          : '--no-sensitive',
      ],
      value,
    );
    console.log('Configurado: ' + project.directory + '/' + key + ' (produção e preview).');
  }
}
console.log('Configurações salvas na Vercel. Novos valores entram em vigor no próximo deploy.');
