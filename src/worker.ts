const canonicalHost = 'siringmenara.com';

type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } };

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (
      (url.hostname === canonicalHost || url.hostname === `www.${canonicalHost}`) &&
      (url.protocol !== 'https:' || url.hostname !== canonicalHost)
    ) {
      url.protocol = 'https:';
      url.hostname = canonicalHost;
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    // Explicit error aliases must not inherit asset canonicalisation to a 200 page.
    if (/^\/404(?:\.html|\/)?$/.test(url.pathname)) {
      let errorURL = new URL('/404.html', url);
      let error = await env.ASSETS.fetch(new Request(errorURL, { method: 'GET' }));
      for (let redirects = 0; redirects < 3 && error.status >= 300 && error.status < 400 && error.headers.has('Location'); redirects++) {
        errorURL = new URL(error.headers.get('Location')!, errorURL);
        error = await env.ASSETS.fetch(new Request(errorURL, { method: 'GET' }));
      }
      const headers = new Headers(error.headers);
      headers.delete('Location');
      headers.set('X-Robots-Tag', 'noindex, follow');
      headers.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(request.method === 'HEAD' ? null : error.body, { status: 404, headers });
    }
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, follow');
    return new Response(response.body, { status: 404, statusText: response.statusText, headers });
  },
};
