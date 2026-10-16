/** Roadmap data always belongs to the authenticated account. */
export function roadmapOwner(req, res, next) {
  if (!req.user?.uid)
    return res.status(401).json({ success: false, message: 'Faça login para continuar.' });
  const requested = req.params.uid || req.body?.uid;
  if (requested && requested !== req.user.uid) {
    return res
      .status(403)
      .json({ success: false, message: 'Você não pode acessar a trilha de outra conta.' });
  }
  if (req.body) req.body.uid = req.user.uid;
  next();
}
