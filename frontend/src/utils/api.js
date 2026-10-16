// Development uses the local backend through Vite; production uses its deployed API.
export const API_URL = (
  import.meta.env.DEV
    ? import.meta.env.VITE_DEV_API_URL || '/backend'
    : import.meta.env.VITE_API_URL || 'https://backend-ten-ecru-93.vercel.app'
).replace(/\/$/, '')
