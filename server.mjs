import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 3000);
const memoryLeads = [];

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function normalizeLead(input) {
  const now = new Date().toISOString();
  return {
    id: String(input.id || crypto.randomUUID()),
    name: String(input.name || "Unnamed lead"),
    phone: String(input.phone || ""),
    source: String(input.source || "Local webhook"),
    value: Number(input.value || 0),
    notes: String(input.notes || ""),
    status: String(input.status || "new"),
    priority: String(input.priority || "normal"),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname === "/api/leads") {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type,x-novex-token");
    if (req.method === "OPTIONS") return send(res, 200, "{}");
    if (req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      const entries = Array.isArray(body) ? body : Array.isArray(body.leads) ? body.leads : [body];
      const leads = entries.map(normalizeLead);
      memoryLeads.unshift(...leads);
      memoryLeads.splice(500);
      return send(res, 200, JSON.stringify({ ok: true, received: leads.length, leads }), {
        "content-type": "application/json; charset=utf-8"
      });
    }
    if (req.method === "GET") {
      const since = url.searchParams.get("since");
      const leads = since ? memoryLeads.filter((lead) => new Date(lead.updatedAt) > new Date(since)) : memoryLeads;
      return send(res, 200, JSON.stringify({ leads }), {
        "content-type": "application/json; charset=utf-8"
      });
    }
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const target = normalize(join(root, pathname));
  if (!target.startsWith(root)) return send(res, 403, "Forbidden");

  try {
    const data = await readFile(target);
    send(res, 200, data, { "content-type": types[extname(target)] || "application/octet-stream" });
  } catch {
    const data = await readFile(join(root, "index.html"));
    send(res, 200, data, { "content-type": types[".html"] });
  }
}).listen(port, () => {
  console.log(`Novex CRM running at http://localhost:${port}`);
});
