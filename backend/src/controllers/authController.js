import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'node:crypto';
import { adminDb } from '../config/firebase.js';
import { jwtSecret } from '../config/security.js';
import { MOCK_USERS } from '../config/mockDb.js';

const localEnabled = () => process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
const publicUser = (user) => ({ uid: user.uid, nome: user.nome, email: user.email });
const emailValue = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const validEmail = (email) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validPassword = (password) =>
  typeof password === 'string' && password.length >= 6 && Buffer.byteLength(password) <= 72;

export async function realizarLogin(req, res) {
  const email = emailValue(req.body?.email);
  const password = req.body?.password;
  if (!validEmail(email) || !validPassword(password))
    return res.status(400).json({ success: false, message: 'Informe e-mail e senha válidos.' });
  if (!jwtSecret || (!adminDb && !localEnabled()))
    return res
      .status(503)
      .json({ success: false, message: 'Login interno indisponível. Use o login Firebase.' });
  try {
    let user;
    if (adminDb) {
      const snapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
      if (!snapshot.empty) user = { ...snapshot.docs[0].data(), uid: snapshot.docs[0].id };
    } else user = MOCK_USERS.find((user) => user.email === email);
    if (!user?.password || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    const token = jwt.sign({ uid: user.uid, email: user.email }, jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    return res.json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    console.error('Erro no login:', error);
    return res
      .status(503)
      .json({ success: false, message: 'Não foi possível entrar. Tente novamente.' });
  }
}

export async function registrarUsuario(req, res) {
  const { nome, password, uid } = req.body || {};
  const email = emailValue(req.body?.email);
  if (
    uid !== undefined ||
    typeof nome !== 'string' ||
    !nome.trim() ||
    nome.length > 120 ||
    !validEmail(email) ||
    !validPassword(password)
  )
    return res.status(400).json({
      success: false,
      message: 'Informe nome, e-mail e senha válidos. O identificador é gerado pelo servidor.',
    });
  if (!adminDb && !localEnabled())
    return res.status(503).json({ success: false, message: 'Cadastro indisponível.' });
  try {
    const user = {
      uid: randomUUID(),
      nome: nome.trim(),
      email,
      password: await bcrypt.hash(password, 12),
      createdAt: new Date().toISOString(),
    };
    if (adminDb) {
      const reservation = adminDb
        .collection('authEmails')
        .doc(createHash('sha256').update(email).digest('hex'));
      await adminDb.runTransaction(async (transaction) => {
        const exists = await transaction.get(reservation);
        const matches = await transaction.get(
          adminDb.collection('users').where('email', '==', email).limit(1),
        );
        if (exists.exists || !matches.empty) {
          const error = new Error('duplicate');
          error.duplicate = true;
          throw error;
        }
        transaction.create(reservation, { uid: user.uid });
        const { uid, ...data } = user;
        transaction.create(adminDb.collection('users').doc(uid), data);
      });
    } else {
      if (MOCK_USERS.some((existing) => existing.email === email))
        return res.status(409).json({ success: false, message: 'Este e-mail já tem uma conta.' });
      MOCK_USERS.push(user);
    }
    return res.status(201).json({ success: true, user: publicUser(user) });
  } catch (error) {
    if (error.duplicate)
      return res.status(409).json({ success: false, message: 'Este e-mail já tem uma conta.' });
    console.error('Erro no cadastro:', error);
    return res.status(503).json({ success: false, message: 'Não foi possível salvar a conta.' });
  }
}

export async function listarUsuarios(req, res) {
  try {
    const users = adminDb
      ? (await adminDb.collection('users').get()).docs.map((doc) =>
          publicUser({ ...doc.data(), uid: doc.id }),
        )
      : MOCK_USERS.map(publicUser);
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(503).json({ success: false, message: 'Não foi possível listar usuários.' });
  }
}

// Password recovery is handled by Firebase Auth in the web and mobile clients.
// These legacy endpoints must never report a password change they did not perform.
export function solicitarRecuperacao(req, res) {
  return res
    .status(501)
    .json({ success: false, message: 'Use a recuperação de senha na tela de login Firebase.' });
}
export function resetarSenha(req, res) {
  return res
    .status(501)
    .json({ success: false, message: 'Use o link de recuperação enviado pelo Firebase.' });
}
