import { admin, adminDb } from '../config/firebase.js';
import { MOCK_USERS } from '../config/mockDb.js';
export async function obterPerfilUsuario(req, res) {
  try {
    const uid = req.user.uid;
    let data;
    if (adminDb) {
      const doc = await adminDb.collection('users').doc(uid).get();
      if (doc.exists) data = doc.data();
    } else data = MOCK_USERS.find((user) => user.uid === uid);
    if (!data) {
      const user = await admin.auth().getUser(uid);
      data = {
        nome: user.displayName || '',
        email: user.email,
        createdAt: user.metadata.creationTime,
      };
    }
    return res.json({
      success: true,
      profile: { uid, nome: data.nome || '', email: data.email || '', createdAt: data.createdAt },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res
      .status(error.code === 'auth/user-not-found' ? 404 : 503)
      .json({ success: false, message: 'Não foi possível carregar o perfil.' });
  }
}
