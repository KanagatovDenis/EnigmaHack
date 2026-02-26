export default async function handler(req, res) {
  const base = process.env.SCRIPT_URL;
  const token = process.env.ADMIN_TOKEN;

  if (req.method === 'POST') {
    const r = await fetch(`${base}?token=${token}&action=update_final`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    return res.status(200).json(data);
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}