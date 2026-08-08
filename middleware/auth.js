const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || process.env.APP_SECRET || 'dev-only-change-this-secret';
const JWT_EXPIRE_SECONDS = Number(process.env.JWT_EXPIRE_SECONDS || 7 * 24 * 60 * 60);

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeBase64Url(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString('utf8');
}

function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRE_SECONDS
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

function getBearerToken(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function optionalAuth(req, _res, next) {
  const token = getBearerToken(req);
  const payload = verifyJwt(token);
  if (payload) req.auth = payload;
  next();
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  req.auth = payload;
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return next();
}

function requireSelfOrAdmin(getUserId) {
  return (req, res, next) => {
    const requestedUserId = String(getUserId(req) || '');
    const currentUserId = String(req.auth?.id || '');

    if (req.auth?.role === 'admin' || requestedUserId === currentUserId) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'You can only access your own data' });
  };
}

module.exports = {
  signJwt,
  verifyJwt,
  optionalAuth,
  requireAuth,
  requireAdmin,
  requireSelfOrAdmin
};
