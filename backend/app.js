import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import authRoutes from './src/routes/authRoutes.js';
import roadmapRoutes from './src/routes/roadmapRoutes.js';
import iaRoutes from './src/routes/iaRoutes.js';
import itensRoutes from './src/routes/itensRoutes.js';
import apiRoutes from './src/routes/apiRoutes.js';
import swaggerDocument from './config/swagger.js';
import { autenticarToken } from './src/middleware/auth.js';

dotenv.config();

import { adminDb } from './src/config/firebase.js';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const renderSwaggerPage = (title) => `<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta charset="utf-8"/>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                spec: ${JSON.stringify(swaggerDocument)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.StandalonePreset
                ],
                layout: "BaseLayout"
            });
        };
    </script>
</body>
</html>`;

// ✅ Documentação Swagger: PÚBLICA (o Swagger UI já força autenticação nas chamadas às rotas)
app.get('/api-docs', (req, res) => {
    res.send(renderSwaggerPage('IntelectusIA API Documentation'));
});

app.get('/swagger', (req, res) => {
    res.send(renderSwaggerPage('IntelectusIA API Documentation'));
});

// ✅ Spec JSON também pública — necessária para o Swagger UI carregar
app.get('/api-docs.json', (req, res) => {
    res.status(200).json(swaggerDocument);
});

// ✅ Health check: PÚBLICO — diagnóstico de infraestrutura, sem dados sensíveis
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        backend: 'intelectusia-api-v2',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// ✅ Autenticação: PÚBLICA — login, cadastro e recuperação de senha não exigem token
app.use('/autenticacao', authRoutes);

// 🔒 A partir daqui, todas as rotas exigem JWT válido
app.use(autenticarToken);

app.use('/trilhas', roadmapRoutes);
app.use('/ia', iaRoutes);
app.use('/itens', itensRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`IntelectusIA API running on port ${PORT}`);
        console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    });
}

export default app;