// netlify/functions/oauth-callback.js
exports.handler = async (event) => {
  const url = new URL(event.rawUrl);
  const code = url.searchParams.get("code");

  if (!code) {
    return { statusCode: 400, body: "Missing code" };
  }

  // まずは “受け取れること” を確認するだけの最小実装
  //（必要なら後でトークン交換の処理を追加します）
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: "GitHub から認証コードを受け取りました。画面を閉じてOKです。"
  };
};
