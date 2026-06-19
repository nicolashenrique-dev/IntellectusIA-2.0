// Banco de dados em memória para Modo Mock/Desenvolvimento local
// Senhas: admin@intelectus.com → 'senha123', 3@intelectus.com → '123456', fellipe@intelectus.com → 'admin123'
export const MOCK_USERS = [
    { uid: 'mock-user-uid', nome: 'Usuário (Mock)', email: 'admin@intelectus.com', password: '$2b$10$1vj8WM77gUQKqDS3x68VGu9WEasgvf/ptzYQreiZM3RxkMgtwNAgy', createdAt: new Date().toISOString() },
    { uid: '3', nome: 'Usuário 3', email: '3@intelectus.com', password: '$2b$10$HZq7CyDxDd/cS.Z1I/31uejDHvrV3OUO5kCY1d16fcFPJhBK6KsSC', createdAt: new Date().toISOString() },
    { uid: 'abc123firebaseuid', nome: 'Fellipe Costa', email: 'fellipe@intelectus.com', password: '$2b$10$z6qYZmMtl3Nq3GqaLdLlouH4aeEjMoLkHiRkvjegela0H9iNZ9yxC', createdAt: new Date().toISOString() }
];

export const MOCK_ROADMAPS = {};
