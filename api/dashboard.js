import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT,
      business TEXT,
      whatsapp TEXT,
      service_interest TEXT,
      main_problem TEXT,
      source TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const total = await sql`SELECT COUNT(*) FROM leads;`;
  const latest = await sql`
    SELECT *
    FROM leads
    ORDER BY created_at DESC
    LIMIT 5;
  `;

  return res.status(200).json({
    ok: true,
    total_leads: Number(total.rows[0].count),
    latest_leads: latest.rows
  });
}
