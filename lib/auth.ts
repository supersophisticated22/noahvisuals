import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const AUTH_COOKIE = "nv_admin";
const TOKEN_TTL = "12h";

// Credentials file overrides env creds once the admin changes their password
// (env-based bcrypt hashes can't be updated at runtime without a restart).
const CREDS_FILE = path.join(process.cwd(), "content", "auth.json");

type StoredCreds = { user: string; passHash: string };

async function readStoredCreds(): Promise<StoredCreds | null> {
  try {
    return JSON.parse(await fs.readFile(CREDS_FILE, "utf8")) as StoredCreds;
  } catch {
    return null;
  }
}

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { user: string };

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ user: payload.user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secret());
}

export async function verifyToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.user === "string") return { user: payload.user };
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate credentials against the stored credentials file if present,
 * otherwise against the env-configured admin credentials.
 */
export async function verifyCredentials(
  user: string,
  pass: string,
): Promise<boolean> {
  const stored = await readStoredCreds();
  if (stored) {
    if (user !== stored.user) return false;
    return bcrypt.compare(pass, stored.passHash);
  }
  const expectedUser = process.env.ADMIN_USER;
  const hash = process.env.ADMIN_PASS;
  if (!expectedUser || !hash) return false;
  if (user !== expectedUser) return false;
  return bcrypt.compare(pass, hash);
}

/** The current admin username (from the creds file if set, else env). */
export async function currentAdminUser(): Promise<string> {
  const stored = await readStoredCreds();
  return stored?.user ?? process.env.ADMIN_USER ?? "admin";
}

/** Change the admin password by writing the credentials file. */
export async function changeAdminPassword(
  currentPass: string,
  newPass: string,
): Promise<boolean> {
  const user = await currentAdminUser();
  const ok = await verifyCredentials(user, currentPass);
  if (!ok) return false;
  const passHash = await bcrypt.hash(newPass, 10);
  await fs.writeFile(
    CREDS_FILE,
    JSON.stringify({ user, passHash }, null, 2) + "\n",
    "utf8",
  );
  return true;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
