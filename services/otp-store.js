const OTP_EXPIRY_MS = Number(process.env.OTP_EXPIRY || 600) * 1000;
const store = new Map();

function keyFor(userId, purpose = '2fa') {
  return `${purpose}:${userId}`;
}

function setOtp(userId, code, purpose = '2fa', meta = {}) {
  store.set(keyFor(userId, purpose), {
    code: String(code),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    meta
  });
}

function verifyOtp(userId, code, purpose = '2fa') {
  const entry = store.get(keyFor(userId, purpose));
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(keyFor(userId, purpose));
    return false;
  }
  if (entry.code !== String(code)) return false;
  store.delete(keyFor(userId, purpose));
  return true;
}

function getOtp(userId, purpose = '2fa') {
  const entry = store.get(keyFor(userId, purpose));
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.code;
}

module.exports = { setOtp, verifyOtp, getOtp };
