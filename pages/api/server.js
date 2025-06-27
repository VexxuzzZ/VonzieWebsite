// File: pages/api/save.js

export default async function handler(req, res) { if (req.method !== 'POST') return res.status(405).end();

const { username, token, nomor } = req.body; if (!username || !token || !Array.isArray(nomor)) { return res.status(400).json({ error: 'Data tidak lengkap' }); }

const owner = 'VexxuzzZ'; const repo = 'VonzieWebsite'; const path = 'data/database.json'; const apiUrl = https://api.github.com/repos/${owner}/${repo}/contents/${path};

try { // Ambil data lama let sha = ''; let json = {};

const getRes = await fetch(apiUrl, {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json'
  }
});

if (getRes.ok) {
  const result = await getRes.json();
  sha = result.sha;
  const decoded = Buffer.from(result.content, 'base64').toString('utf-8');
  try {
    json = JSON.parse(decoded);
  } catch {
    json = {};
  }
}

// Update data
json[username] = nomor;
const newContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

const putRes = await fetch(apiUrl, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json'
  },
  body: JSON.stringify({
    message: `update ${username} data`,
    content: newContent,
    sha
  })
});

if (!putRes.ok) {
  const err = await putRes.json();
  return res.status(500).json({ error: err.message || 'Gagal menyimpan ke GitHub' });
}

return res.status(200).json({ success: true });

} catch (err) { return res.status(500).json({ error: err.message || 'Error server' }); } }

