// Per-process guard. Configure an edge/shared limiter for multiple instances.
export function rateLimit({ limit, windowMs }) {
  const buckets = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.until <= now) buckets.delete(key);
    const key = req.ip;
    let bucket = buckets.get(key);
    if (!bucket) {
      if (buckets.size >= 10000)
        return res
          .status(429)
          .json({ success: false, message: 'Muitas solicitações. Tente novamente mais tarde.' });
      bucket = { count: 0, until: now + windowMs };
      buckets.set(key, bucket);
    }
    if (++bucket.count > limit) {
      res.set('Retry-After', String(Math.ceil((bucket.until - now) / 1000)));
      return res.status(429).json({
        success: false,
        message: 'Muitas solicitações. Aguarde antes de tentar novamente.',
      });
    }
    return next();
  };
}
