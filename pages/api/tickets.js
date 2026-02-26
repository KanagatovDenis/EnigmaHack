export default async function handler(req, res) {
  const base = process.env.SCRIPT_URL;
  const token = process.env.ADMIN_TOKEN;

  if (req.method === 'GET') {
    const r = await fetch(`${base}?token=${token}&action=list`);
    const data = await r.json();
    return res.status(200).json(data);
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}