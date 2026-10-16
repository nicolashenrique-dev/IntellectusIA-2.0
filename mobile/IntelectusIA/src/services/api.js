import { getBaseUrl } from '../utils';
import { getToken } from './session';
export async function api(path, { method = 'GET', body, publicRequest = false, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (!publicRequest) headers.Authorization = `Bearer ${await getToken()}`;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 25000);
  try {
    const response = await fetch(`${getBaseUrl()}${path}`, { method, headers, signal: controller.signal, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok || data.success === false) { const error = new Error(data.message || 'Não foi possível carregar. Tente novamente.'); error.status = response.status; throw error; }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('A conexão demorou mais que o esperado. Tente novamente.');
    if (error instanceof TypeError) throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    throw error;
  } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
}
