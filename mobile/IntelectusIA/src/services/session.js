import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createSessionStore } from './sessionCore.mjs';
const key = 'intellectus.refresh.v2';
export const session = createSessionStore({
  get: () => Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: value => Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  clear: () => Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
});
export const removeLegacyCredentials = () => AsyncStorage.multiRemove([
  '@intelectus_saved_password', '@intelectus_saved_token', '@intelectus_saved_email',
  '@intelectus_remember_me', '@intelectus_user_uid'
]);
const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const messages = {
  INVALID_LOGIN_CREDENTIALS: 'Confira seu e-mail e sua senha.', EMAIL_NOT_FOUND: 'Confira seu e-mail e sua senha.',
  INVALID_PASSWORD: 'Confira seu e-mail e sua senha.', EMAIL_EXISTS: 'Este e-mail já tem uma conta. Entre para continuar.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Muitas tentativas. Aguarde um pouco e tente novamente.',
  USER_DISABLED: 'Esta conta está desativada.', INVALID_EMAIL: 'Informe um e-mail válido.',
  TOKEN_EXPIRED: 'Sua sessão expirou. Entre novamente.', INVALID_REFRESH_TOKEN: 'Sua sessão expirou. Entre novamente.',
  USER_NOT_FOUND: 'Sua sessão expirou. Entre novamente.', CREDENTIAL_TOO_OLD_LOGIN_AGAIN: 'Entre novamente para fazer essa alteração.'
};
async function firebaseRequest(action, payload, refresh = false) {
  if (!apiKey) throw new Error('A conexão com o Firebase ainda não foi configurada no aplicativo.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = refresh ? `https://securetoken.googleapis.com/v1/token?key=${apiKey}` : `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${apiKey}`;
    const response = await fetch(url, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': refresh ? 'application/x-www-form-urlencoded' : 'application/json' }, body: refresh ? `grant_type=refresh_token&refresh_token=${encodeURIComponent(payload.refresh_token)}` : JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) {
      const code = data.error?.message || '';
      const error = new Error(messages[code] || (code.startsWith('WEAK_PASSWORD') ? 'Use uma senha com pelo menos 6 caracteres.' : 'Não foi possível concluir. Confira os dados e tente novamente.'));
      error.invalidSession = ['TOKEN_EXPIRED','INVALID_REFRESH_TOKEN','USER_DISABLED','USER_NOT_FOUND','INVALID_ID_TOKEN'].includes(code);
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Não foi possível conectar. Verifique sua internet e tente novamente.');
    throw error;
  } finally { clearTimeout(timeout); }
}
function makeSession(data, user) {
  return { idToken: data.idToken || data.id_token, refreshToken: data.refreshToken || data.refresh_token,
    expiresAt: Date.now() + Number(data.expiresIn || data.expires_in || 3600) * 1000,
    user: user || { uid: data.localId, email: data.email, displayName: data.displayName || '' } };
}
async function restoreCredential(refreshToken) {
  const data = await firebaseRequest('token', { grant_type: 'refresh_token', refresh_token: refreshToken }, true);
  const info = await firebaseRequest('lookup', { idToken: data.id_token });
  const user = info.users?.[0];
  if (!user) { const error = new Error('Entre novamente para continuar.'); error.invalidSession = true; throw error; }
  return makeSession(data, { uid: user.localId, email: user.email, displayName: user.displayName || '' });
}
export async function restoreSession() { await removeLegacyCredentials(); return session.restore(restoreCredential); }
export async function login(email, password, remember) {
  const data = await firebaseRequest('signInWithPassword', { email: email.trim(), password, returnSecureToken: true });
  await session.establish(makeSession(data), remember);
  await removeLegacyCredentials();
  return session.current().user;
}
export async function register(name, email, password) {
  const data = await firebaseRequest('signUp', { email: email.trim(), password, returnSecureToken: true });
  await session.establish(makeSession(data), false);
  // Account exists even if the optional display-name update fails.
  try { await updateName(name.trim()); } catch { /* The profile screen can retry. */ }
  return session.current().user;
}
let refreshing;
export async function getToken() {
  const current = session.current();
  if (!current) throw new Error('Entre na sua conta para continuar.');
  if (current.expiresAt > Date.now() + 60000) return current.idToken;
  if (!refreshing) {
    const version = session.revision();
    refreshing = restoreCredential(current.refreshToken).then(async updated => {
      if (!await session.renew(updated, version)) throw new Error('Sua sessão foi encerrada.');
      return updated.idToken;
    }).finally(() => { refreshing = null; });
  }
  return refreshing;
}
export async function updateName(displayName) {
  await firebaseRequest('update', { idToken: await getToken(), displayName, returnSecureToken: false });
  const current = session.current();
  if (!current) throw new Error('Sua sessão foi encerrada.');
  current.user = { ...current.user, displayName };
  return current.user;
}
export const resetPassword = email => firebaseRequest('sendOobCode', { requestType: 'PASSWORD_RESET', email: email.trim() });
export async function logout() { await session.clear(); await removeLegacyCredentials(); }
