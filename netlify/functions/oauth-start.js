// netlify/functions/oauth-start.js
exports.handler = async () => {
  // 環境変数または一時的に固定文字列（後で環境変数化でOK）
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Ov23liT4UmpJ00Ckbd2X";

  // Netlify 環境では process.env.URL がサイトURL
  const siteUrl = process.env.URL || "https://usmle-japan-blog.netlify.app";
  const redirectUri = `${siteUrl}/.netlify/functions/oauth-callback`;

  const scope = "read:user repo user:email"; // 標準的なスコープ
  const authorizeUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  return {
    statusCode: 302,
    headers: { Location: authorizeUrl }
  };
};
