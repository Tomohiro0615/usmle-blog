// netlify/functions/auth/authorize.js
// GitHub OAuth を開始（redirect_uri は送らない：Appに設定したものを使う）
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liT4UmpJ00Ckbd2X';

exports.handler = async () => {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  // ★ redirect_uri は付けない（不一致の原因を根絶）
  url.searchParams.set('scope', 'read:user user:email');
  url.searchParams.set('allow_signup', 'false');
  return { statusCode: 302, headers: { Location: url.toString() } };
};