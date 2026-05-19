// Temporary dev-only API route to smoke test Square payments
// Do NOT enable in production. Returns 404 if NODE_ENV === 'production'.

import chargeSquare from "../../../lib/payment/chargeSquare";

export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).send();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const data = { ...req.body };

  // Redact potentially sensitive fields before logging
  const safeLog = (payload) => {
    const clone = { ...payload };
    if (clone.squareSourceId) clone.squareSourceId = '***';
    return clone;
  };

  try {
    const result = await chargeSquare(data);
    res.status(200).json({ ok: true, result });
  } catch (e) {
    console.error(`${new Date().toISOString()} - Square dev test error:`, safeLog({ ...data, error: e }));
    res.status(e.statusCode || 400).json({ ok: false, error: e.errormessage || 'Square error' });
  }
}
