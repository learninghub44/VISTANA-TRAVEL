import crypto from "crypto";

// bcryptjs (pure JavaScript, no native bindings) was replaced with Node's
// native scrypt implementation. Cloudflare Workers meter actual CPU time per
// request with a hard ceiling, and a CPU-bound pure-JS bcrypt hash at cost
// factor 12 reliably blew through that budget ("Worker exceeded CPU time
// limit"), crashing every login/register attempt before credentials were
// even checked. Node's crypto.scrypt runs through workerd's native (not
// JS-interpreted) node:crypto compat layer, which is dramatically cheaper
// on CPU time for equivalent security.
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function scryptAsync(plain: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(plain, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scryptAsync(plain, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const [algo, saltHex, keyHex] = hash.split("$");
  if (algo !== "scrypt" || !saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await scryptAsync(plain, salt);

  if (storedKey.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(storedKey, derivedKey);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function isStrongEnough(password: string): boolean {
  return typeof password === "string" && password.length >= 8;
}
