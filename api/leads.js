import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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

  if (req.method === "POST") {
    const {
      name = "",
      business = "",
      whatsapp = "",
      service_interest = "",
      main_problem = "",
      source = "website"
    } = req.body || {};

    if (!whatsapp) {
      return res.status(400).json({
        ok: false,
        error: "WhatsApp number is required"
      });
    }

    await sql`
      INSERT INTO leads (
        name,
        business,
        whatsapp,
        service_interest,
        main_problem,
        source
      )
      VALUES (
        ${name},
        ${business},
        ${whatsapp},
        ${service_interest},
        ${main_problem},
        ${source}
      );
    `;

    return res.status(200).json({
      ok: true,
      message: "Lead saved successfully"
    });
  }

  if (req.method === "GET") {
    const leads = await sql`
      SELECT *
      FROM leads
      ORDER BY created_at DESC
    `;

    return res.status(200).json({
      ok: true,
      leads: leads.rows
    });
  }

  return res.status(405).json({
    ok: false,
    error: "Method not allowed"
  });
}
