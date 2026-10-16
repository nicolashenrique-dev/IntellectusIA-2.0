import jwt from 'jsonwebtoken';
import { admin } from '../config/firebase.js';
import { jwtSecret } from '../config/security.js';
async function verifiedUser(req) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
  if (!match) return null;
  if (jwtSecret) {
    try {
      const decoded = jwt.verify(match[1], jwtSecret, { algorithms: ['HS256'] });
      if (typeof decoded.uid === 'string' && decoded.uid)
        return { uid: decoded.uid, email: decoded.email };
    } catch {}
  }
  if (admin.apps.length) {
    try {
      const decoded = await admin.auth().verifyIdToken(match[1]);
      return {
        uid: decoded.uid,
        email: decoded.email,
        nome: decoded.name,
        admin: decoded.admin === true,
      };
    } catch {}
  }
  return null;
}
export async function autenticarToken(req, res, next) {
  req.user = await verifiedUser(req);
  if (!req.user)
    return res.status(401).json({ success: false, message: 'Entre novamente para continuar.' });
  return next();
}
export async function autenticarTokenOpcional(req, res, next) {
  req.user = await verifiedUser(req);
  return next();
}
export function exigirAdministrador(req, res, next) {
  if (req.user?.admin !== true)
    return res.status(403).json({ success: false, message: 'Acesso restrito a administradores.' });
  return next();
}
