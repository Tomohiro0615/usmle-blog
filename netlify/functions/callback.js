// netlify/functions/callback.js
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liT4UmpJ00Ckbd2X';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

exports.handler = async (event) => {
  const params = new URLSearchParams(event.rawQuery || '');
  const code = params.get('code');
  if (!code) return { statusCode: 400, body: 'Missing code' };

  if (!CLIENT_SECRET) {
    return { statusCode: 200, body: 'GitHub から認証コードを受け取りました。画面を閉じてOKです。' };
  }

  const resp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code })
  });
  const json = await resp.json();
  if (json.error) return { statusCode: 400, body: `Token error: ${JSON.stringify(json)}` };
  return { statusCode: 200, body: 'ログイン成功。画面を閉じてOKです。' };
};
