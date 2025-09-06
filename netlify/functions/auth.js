// netlify/functions/auth.js
exports.handler = async (event) => {
  const host = event.headers["x-forwarded-host"] || event.headers.host || "";
  const siteUrl = process.env.SITE_URL || `https://${host}`;
  const path = event.path || "";

  // 🔧 一時対応：ここに GitHub の Client ID を半角で貼ってください
  const clientId = "Ov23liT4UmpJ00Ckbd2X";

  // セキュア系ヘッダ
  const noStore = { "Cache-Control": "no-store" };

  // 1) /login → GitHub 認可画面へ302リダイレクト
  if (path.endsWith("/login")) {
    if (!clientId) {
      return { statusCode: 500, headers: noStore, body: "Missing CLIENT_ID (temp)" };
    }
    const state = Math.random().toString(36).slice(2);
    const redirectUri = `${siteUrl}/.netlify/functions/auth/callback`;

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "read:user");
    url.searchParams.set("state", state);

    return { statusCode: 302, headers: { ...noStore, Location: url.toString() }, body: "" };
  }

  // 2) /callback → code をトークンに交換 → /admin/#access_token=... へ
  if (path.endsWith("/callback")) {
    const code = (event.queryStringParameters || {}).code;
    if (!code) {
      return { statusCode: 400, headers: noStore, body: "Missing code" };
    }

    const clientSecret = process.env.GITHUB_CLIENT_SECRET; // ← Secretは環境変数から
    const redirectUri = `${siteUrl}/.netlify/functions/auth/callback`;

    try {
      const resp = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri
        })
      });
      const data = await resp.json();
      if (!data.access_token) {
        return { statusCode: 500, headers: noStore, body: `Token error: ${JSON.stringify(data)}` };
        // ここでエラーが出たら GITHUB_CLIENT_SECRET の未設定/タイプミスが原因です
      }
      const back = `${siteUrl}/admin/#access_token=${data.access_token}`;
      return { statusCode: 302, headers: { ...noStore, Location: back }, body: "" };
    } catch (e) {
      return { statusCode: 500, headers: noStore, body: `Fetch error: ${e}` };
    }
  }

  return { statusCode: 404, headers: noStore, body: "Not Found" };
};