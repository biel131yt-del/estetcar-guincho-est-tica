import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { neon } from "@neondatabase/serverless";

const derive = promisify(scrypt);
const cookie = "__Host-estetcar_admin";
const fourHours = 4 * 60 * 60 * 1000;
const flags = "Path=/; HttpOnly; Secure; SameSite=Strict";
type Database = ReturnType<typeof neon>;

export function adminJson(data: unknown, status = 200, session?: string) {
  const headers = new Headers({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });
  if (session !== undefined) headers.set("Set-Cookie", `${cookie}=${session}; ${flags}; Max-Age=${session ? fourHours / 1000 : 0}`);
  return Response.json(data, { status, headers });
}

const digest = (text: string) => createHash("sha256").update(text).digest();
const equal = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

async function passwordHash(password: string, salt = randomBytes(16).toString("hex")) {
  const key = await derive(password, salt, 64) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

async function access(db: Database) {
  const rows = await db.query("SELECT password_hash FROM admin_access WHERE id = 1");
  if (!rows[0]) throw new Error("Missing admin configuration");
  const hash = rows[0].password_hash as string | null;
  const handoff = !hash && process.env.ADMIN_MODE === "handoff";
  const testUntil = Date.parse(process.env.ADMIN_TEST_UNTIL ?? "");
  const fallback = handoff ? process.env.ADMIN_HANDOFF_PASSWORD : Date.now() < testUntil ? process.env.ADMIN_TEST_PASSWORD : undefined;
  const allowed = fallback && (!handoff || (fallback.length >= 16 && fallback !== process.env.ADMIN_TEST_PASSWORD));
  const initialPassword = allowed ? fallback : undefined;
  return { hash, handoff, initialPassword, testUntil };
}

type Access = Awaited<ReturnType<typeof access>>;

function sign(state: Access, body: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const credential = state.hash ?? state.initialPassword;
  if (!secret || secret.length < 32 || !credential) return "";
  return createHmac("sha256", secret).update(JSON.stringify([state.handoff, credential, body])).digest("base64url");
}

function issue(state: Access) {
  const normalExpiry = Date.now() + fourHours;
  const expires = state.hash || state.handoff ? normalExpiry : Math.min(normalExpiry, state.testUntil);
  const body = `${expires}.${randomBytes(16).toString("hex")}`;
  const sig = sign(state, body);
  if (!sig) throw new Error("Missing session secret");
  return `${body}.${sig}`;
}

function signedIn(request: Request, state: Access) {
  const raw = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookie}=`))?.slice(cookie.length + 1);
  const match = raw?.match(/^(\d{13}\.[a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/);
  if (!match?.[1] || !match[2] || Number(match[1].split(".")[0]) <= Date.now()) return false;
  const signature = sign(state, match[1]);
  return Boolean(signature && equal(signature, match[2]));
}

export async function checkAdmin(request: Request, db: Database) {
  const state = await access(db);
  if (!signedIn(request, state)) return adminJson({ error: "Entre para acessar a agenda." }, 401);
  if (state.handoff) return adminJson({ error: "Troque a senha para acessar a agenda." }, 428);
}

async function allowLogin(request: Request, db: Database) {
  const client = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(client).digest("hex");
  const windowStart = Math.floor(Date.now() / 900_000);
  const rows = await db.query(`INSERT INTO admin_login_attempts(client_key, window_start, attempts) VALUES ($1, $2, 1)
    ON CONFLICT(client_key) DO UPDATE SET
      attempts = CASE WHEN admin_login_attempts.window_start < $2 THEN 1 ELSE LEAST(admin_login_attempts.attempts + 1, 9) END,
      window_start = $2 RETURNING attempts`, [key, windowStart]);
  return Number(rows[0]?.attempts) <= 8;
}

export async function adminAction(request: Request, db: Database, path: string, input: unknown) {
  if (request.method !== "POST") return adminJson({ error: "Método indisponível." }, 405);
  if (path === "/api/admin/sair") return adminJson({ ok: true }, 200, "");
  if (input === null || typeof input !== "object" || !("password" in input) ||
      typeof input.password !== "string" || input.password.length > 128) {
    return adminJson({ error: "Informe uma senha válida." }, 400);
  }
  const state = await access(db);
  if (path === "/api/admin/entrar") {
    if (!state.hash && !state.initialPassword) return adminJson({ error: "A equipe precisa renovar o acesso temporário." }, 503);
    if (!(await allowLogin(request, db))) return adminJson({ error: "Muitas tentativas. Aguarde até 15 minutos." }, 429);
    const salt = state.hash?.split(":")[0];
    const matches = state.hash && salt
      ? equal(await passwordHash(input.password, salt), state.hash)
      : Boolean(state.initialPassword && equal(input.password, state.initialPassword));
    if (!matches) return adminJson({ error: "Senha incorreta." }, 401);
    return adminJson({ changeRequired: state.handoff }, 200, issue(state));
  }
  if (!state.handoff || !signedIn(request, state)) return adminJson({ error: "Entre novamente para trocar a senha." }, 401);
  if (input.password.length < 16 || input.password === state.initialPassword || input.password === process.env.ADMIN_TEST_PASSWORD) {
    return adminJson({ error: "Escolha uma senha diferente, com pelo menos 16 caracteres." }, 400);
  }
  const hash = await passwordHash(input.password);
  const changed = await db.query("UPDATE admin_access SET password_hash = $1 WHERE id = 1 AND password_hash IS NULL RETURNING id", [hash]);
  if (!changed.length) return adminJson({ error: "A senha já foi alterada. Entre novamente." }, 409);
  return adminJson({ ok: true }, 200, issue({ ...state, hash, handoff: false }));
}