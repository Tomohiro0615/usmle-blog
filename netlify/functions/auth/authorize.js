// Netlify Function: start GitHub OAuth
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liT4UmpJ00Ckbd2X';

// 本番URLからコールバックURLを組み立て（URL/末尾スラなし想定）
const SITE = process.env.URL || process.env.DEPLOY_URL || 'https://usmle-japan-blog.netlify.app';
const REDIRECT_URI = new URL('/.netlify/functions/auth/callback', SITE).href;

exports.handler = async () => {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', 'read:user user:email'); // 必要に応じて変更
  url.searchParams.set('allow_signup', 'false');

  return {
    statusCode: 302,
    headers: { Location: url.toString() },
  };
};
