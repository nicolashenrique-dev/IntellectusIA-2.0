import { rateLimit } from './src/middleware/rateLimit.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/authRoutes.js';
import roadmapRoutes from './src/routes/roadmapRoutes.js';
import iaRoutes from './src/routes/iaRoutes.js';
import iaPublicRoutes from './src/routes/iaPublicRoutes.js';
import itensRoutes from './src/routes/itensRoutes.js';
import apiRoutes from './src/routes/apiRoutes.js';
import swaggerDocument from './config/swagger.js';
import { renderSwaggerPage } from './config/swaggerPage.js';
import { autenticarToken, autenticarTokenOpcional } from './src/middleware/auth.js';
import { obterRanking } from './src/controllers/roadmapController.js';

const app = express();
app.disable('x-powered-by');

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

app.get('/api-docs', (req, res) => {
  res.send(renderSwaggerPage('IntelectusIA API Documentation'));
});

app.get('/swagger', (req, res) => {
  res.send(renderSwaggerPage('IntelectusIA API Documentation'));
});

app.get('/api-docs.json', (req, res) => {
  res.status(200).json(swaggerDocument);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'intelectusia-api-v2',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const authLimit = rateLimit({ limit: 20, windowMs: 15 * 60 * 1000 });
app.use('/autenticacao', authLimit, authRoutes);
app.use(['/api/login', '/api/cadastro', '/api/recuperar-senha', '/api/resetar-senha'], authLimit);
app.use('/api', authRoutes);

// /ia/videos é pública pois busca conteúdo do YouTube sem contexto de sessão
app.use('/ia', rateLimit({ limit: 60, windowMs: 60000 }), iaPublicRoutes);

app.get('/trilhas/ranking', autenticarTokenOpcional, obterRanking);
app.get('/api/ranking', autenticarTokenOpcional, obterRanking);

app.use(autenticarToken);

app.use('/trilhas', roadmapRoutes);
app.use('/ia', iaRoutes);
app.use('/itens', itensRoutes);
app.use('/api', apiRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status =
    error.type === 'entity.too.large'
      ? 413
      : error instanceof SyntaxError && error.status === 400
        ? 400
        : 500;
  if (status === 500) console.error('Erro na API:', error);
  return res.status(status).json({
    success: false,
    message:
      status === 413
        ? 'Solicitação muito grande.'
        : status === 400
          ? 'JSON inválido.'
          : 'Erro interno no servidor.',
  });
});

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IntelectusIA API running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}

export default app;
