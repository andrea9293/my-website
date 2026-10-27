// Catch-all per le route /api/* inesistenti: senza questo, Cloudflare Pages
// serve index.html con status 200 anche per endpoint che non esistono.
export function onRequest() {
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
