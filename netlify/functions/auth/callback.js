// Netlify Function: exchange code for access token
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liT4UmpJ00Ckbd2X';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''; // なくても表示だけは返せます

const SITE = process.env.URL || process.env.DEPLOY_URL || 'https://usmle-japan-blog.netlify.app';
const REDIRECT_URI = new URL('/.netlify/functions/auth/callback', SITE).href;

exports.handler = async (event) => {
  const params = new URLSearchParams(event.rawQuery || '');
  const code = params.get('code');
  const error = params.get('error');

  if (error) {
    return { statusCode: 400, body: `OAuth error: ${error}` };
  }
  if (!code) {
    return { statusCode: 400, body: 'Missing code' };
  }

  // ここで GitHub にトークン交換を投げる（シークレット未設定ならスキップでもOK）
  if (!CLIENT_SECRET) {
    return { statusCode: 200, body: 'GitHub から認証コードを受け取りました。画面を閉じてOKです。' };
  }

  const resp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI, // ★ authorize と完全一致
    }),
  });

  const json = await resp.json();
  if (json.error) {
    return { statusCode: 400, body: `Token error: ${JSON.stringify(json)}` };
  }

  // ここでは確認用に成功メッセージだけ返す（本番は cookie 設定などに発展可）
  return { statusCode: 200, body: 'ログイン成功。画面を閉じてOKです。' };
};
