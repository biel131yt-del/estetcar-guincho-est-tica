import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

export function checkAdmin(request: Request): Response | undefined {
  const password = process.env.ADMIN_PASSWORD;
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  if (!password || password.length < 24) {
    return new Response("A equipe ainda precisa configurar o acesso ao painel.", { status: 503, headers });
  }
  const supplied = request.headers.get("Authorization")?.match(/^Basic ([A-Za-z0-9+/=]{1,512})$/i)?.[1];
  if (supplied && timingSafeEqual(digest(Buffer.from(supplied, "base64").toString("utf8")), digest(`admin:${password}`))) {
    return undefined;
  }
  return new Response("Informe as credenciais da equipe Estetcar.", {
    status: 401,
    headers: { ...headers, "WWW-Authenticate": 'Basic realm="Estetcar", charset="UTF-8"' },
  });
}