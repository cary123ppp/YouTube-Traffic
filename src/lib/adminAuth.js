const ADMIN_PASSWORD_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ||
  '410b101268c4e319c8352344042073bad8e9a3a105312de4e49bfdf533ac3c59';

const ADMIN_SESSION_KEY = 'yt_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SESSION_SIGNING_CONTEXT = 'youtube-traffic-admin-session-v1';
const PASSWORD_SALT = 'youtube-traffic-admin-password-v1';
const PASSWORD_ITERATIONS = 150000;

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const sha256 = async (value) => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return toHex(hash);
};

const pbkdf2 = async (password) => {
  const encodedPassword = new TextEncoder().encode(password);
  const encodedSalt = new TextEncoder().encode(PASSWORD_SALT);
  const key = await crypto.subtle.importKey('raw', encodedPassword, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encodedSalt,
      iterations: PASSWORD_ITERATIONS,
    },
    key,
    256
  );

  return toHex(bits);
};

const constantTimeEqual = (left, right) => {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return diff === 0;
};

const createSessionToken = async (expiresAt) => {
  const fingerprint = `${window.location.hostname}:${navigator.userAgent}`;
  return sha256(`${ADMIN_PASSWORD_HASH}:${expiresAt}:${fingerprint}:${SESSION_SIGNING_CONTEXT}`);
};

export const verifyAdminPassword = async (password) => {
  const passwordHash = await pbkdf2(password.trim());
  return constantTimeEqual(passwordHash, ADMIN_PASSWORD_HASH);
};

export const createAdminSession = async () => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = await createSessionToken(expiresAt);

  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      expiresAt,
      token,
    })
  );
};

export const isAdminAuthenticated = async () => {
  try {
    const session = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');

    if (!session?.expiresAt || !session?.token || Date.now() > session.expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }

    const expectedToken = await createSessionToken(session.expiresAt);
    return constantTimeEqual(session.token, expectedToken);
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};
