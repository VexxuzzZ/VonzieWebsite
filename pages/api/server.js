// API endpoint untuk menyimpan nomor WhatsApp per akun ke GitHub JSON

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, token, nomor } = req.body;
  if (!username || !token || !Array.isArray(nomor)) {
    return res.status(400).json({ error: 'Request tidak lengkap' });
  }

  const owner = 'VexxuzzZ';
  const repo = 'VonzieWebsite';
  const path = 'data/database.json';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    // Ambil data lama
    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    let sha = '';
    let json = {};
    if (getRes.ok) {
      const result = await getRes.json();
      sha = result.sha;
      json = JSON.parse(Buffer.from(result.content, 'base64').toString());
    }

    // Update data
    json[username] = nomor;

    const newContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `update ${username}.json`,
        content: newContent,
        sha
      })
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: err.message || 'Gagal push ke GitHub' });
    }

    return res.status(200).json({ success: true, link: `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}` });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Error' });
  }
}
