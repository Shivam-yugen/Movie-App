import jwt from 'jsonwebtoken';

export function signAccessToken({ userId }, { jwtSecret, expiresIn = '14d' }) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn });
}

export function requireAuth({ jwtSecret }) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'missing_authorization' });
    }
    const token = header.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, jwtSecret);
      req.userId = payload.sub;
      return next();
    } catch {
      return res.status(401).json({ error: 'invalid_token' });
    }
  };
}

