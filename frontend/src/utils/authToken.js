import { auth } from '../firebase'

/**
 * Realiza uma requisição HTTP adicionando automaticamente o token JWT
 * do Firebase Auth no cabeçalho Authorization.
 */
export const fetchComAuth = async (url, options = {}) => {
  const user = auth.currentUser
  if (!user) throw new Error('Faça login para continuar.')
  const token = await user.getIdToken()
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(url, { ...options, headers })
}

/**
 * Limpa qualquer resíduo de sessão de autenticação do armazenamento local.
 */
export const limparSessaoAuth = () => {
  localStorage.removeItem('@intelectus_saved_token')
}
