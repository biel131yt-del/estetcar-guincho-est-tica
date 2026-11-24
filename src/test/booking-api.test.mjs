import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { handleBookingApi } from "../lib/booking-api.ts";
import { SERVICES } from "../lib/business.ts";

test("a agenda isola a equipe, persiste pedidos e protege atualizações concorrentes", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../../drizzle/0000_bookings.sql", import.meta.url), "utf8"));
  const env = {
    ADMIN_EMAIL: "equipe@example.com",
    DB: {
      prepare(sql) {
        const query = db.prepare(sql);
        return {
          bind(...args) {
            return {
              run: async () => ({ meta: query.run(...args) }),
              all: async () => ({ results: query.all(...args) }),
            };
          },
        };
      },
    },
  };
  const origin = "https://estetcar.example";
  const identity = {
    "oai-authenticated-user-id": "estetcar-owner",
    "oai-authenticated-user-email": env.ADMIN_EMAIL,
  };
  const call = (path, method = "GET", data, headers = {}) => handleBookingApi(new Request(origin + path, {
    method,
    headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: data ? JSON.stringify(data) : undefined,
  }), env);

  const publicPath = "/api/agendamentos";
  const adminPath = "/api/admin/agendamentos";
  const booking = {
    request_key: crypto.randomUUID(),
    name: "Cliente Exemplo",
    phone: "(51) 99999-1111",
    service: SERVICES[0].title,
    vehicle: "Carro 2019",
    scheduled_date: "2099-10-31",
    scheduled_time: "09:30",
    origin: "São Jerônimo",
    destination: "Charqueadas",
    notes: "Aguardar na entrada",
  };
  assert.equal((await call(adminPath)).status, 403);
  assert.equal((await call(adminPath, "GET", undefined, { ...identity, "oai-authenticated-user-email": "outra@example.com" })).status, 403);
  assert.equal((await call(publicPath, "POST", booking, { Origin: "https://third.example" })).status, 403);
  assert.equal((await call(publicPath, "POST", { ...booking, scheduled_date: "2000-01-01" })).status, 400);
  const submitted = await call(publicPath, "POST", booking);
  assert.equal(submitted.status, 201);
  assert.deepEqual(await submitted.json(), { ok: true });
  assert.equal((await call(publicPath, "POST", booking)).status, 201);
  assert.equal((await call(adminPath, "POST", { ...booking, request_key: crypto.randomUUID() }, identity)).status, 201);

  const list = await call(adminPath, "GET", undefined, identity);
  const { bookings } = await list.json();
  assert.equal(bookings.length, 2);
  const online = bookings.find((item) => item.source === "site");
  assert.equal(online.phone, "51999991111");
  assert.ok(bookings.some((item) => item.source === "manual"));

  const path = `${adminPath}/${online.id}`;
  const change = { status: "confirmado", internal_notes: "Equipe avisada.", updated_at: online.updated_at };
  assert.equal((await call(path, "PATCH", change)).status, 403);
  assert.equal((await call(path, "PATCH", change, identity)).status, 200);
  assert.equal((await call(path, "PATCH", change, identity)).status, 409);
  const filtered = await call(adminPath + "?status=confirmado", "GET", undefined, identity);
  const confirmed = (await filtered.json()).bookings;
  assert.equal(confirmed.length, 1);
  assert.equal(confirmed[0].internal_notes, change.internal_notes);
  db.close();
});
