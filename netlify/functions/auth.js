// Netlify Functions: GitHub OAuth プロキシ（Decap/Netlify CMS 用）
// 必要な環境変数：GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SITE_URL
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async (event) => {
  const url = new URL(event.rawUrl);
  const path = url.pathname.replace(/\/\.netlify\/functions\/auth/, '') || '/';
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  const site = process.env.SITE_URL || (url.protocol + '//' + url.host);

  // 1) /login : GitHub の認可画面へリダイレクト
  if (path === '/' || path === '/login') {
    const redirect_uri = `${site}/.netlify/functions/auth/callback`;
    const state = url.searchParams.get('state') || 'cms';
    const scope = 'repo,user';
    const authURL =
      `https://github.com/login/oauth/authorize?client_id=${client_id}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
    return {
      statusCode: 302,
      headers: { Location: authURL },
    };
  }

  // 2) /callback : code を access_token に交換 → /admin に #access_token を付けて返す
  if (path === '/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') || 'cms';
    if (!code) return { statusCode: 400, body: 'Missing code' };

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id, client_secret, code })
    });
    const data = await tokenRes.json();
    if (!data.access_token) {
      return { statusCode: 500, body: 'Token exchange failed: ' + JSON.stringify(data) };
    }
    const redirectTo = `${site}/admin/#access_token=${data.access_token}&provider=github&state=${encodeURIComponent(state)}`;
    return { statusCode: 302, headers: { Location: redirectTo } };
  }

  return { statusCode: 404, body: 'Not Found' };
};
