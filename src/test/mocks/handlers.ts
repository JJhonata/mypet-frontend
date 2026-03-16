import { http, HttpResponse } from "msw";

export const handlers = [
  // Exemplo de handler para sobrescrever em testes com server.use(...)
  http.get("*/health", () => HttpResponse.json({ status: "ok" }))
];
