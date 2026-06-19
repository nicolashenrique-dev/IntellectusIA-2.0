import { auth } from '../firebase';

/**
 * Realiza uma requisição HTTP adicionando automaticamente o token JWT
 * do Firebase Auth no cabeçalho Authorization.
 */
export const fetchComAuth = async (url, options = {}) => {
    try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        if (!token) {
            console.warn('fetchComAuth: no Firebase token available — request will be sent without Authorization header');
        }

        const headers = {
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers,
        });
    } catch (error) {
        console.error('Erro ao obter token do Firebase Auth:', error);
        // Fallback para realizar a requisição sem token caso falhe
        return fetch(url, options);
    }
};

/**
 * Limpa qualquer resíduo de sessão de autenticação do armazenamento local.
 */
export const limparSessaoAuth = () => {
    localStorage.removeItem('@intelectus_saved_token');
};
