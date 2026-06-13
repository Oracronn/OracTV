import { createFileRoute } from '@tanstack/react-router';
const ALLOWED_HOSTS_DENY = ['localhost', '127.0.0.1', '0.0.0.0'];
function buildProxyUrl(origin: string, target: string, ref?: string, ua?: string) {
    const u = new URL('/api/proxy', origin);
    u.searchParams.set('url', target);
    if (ref)
        u.searchParams.set('ref', ref);
    if (ua)
        u.searchParams.set('ua', ua);
    return u.pathname + '?' + u.searchParams.toString();
}
function rewriteM3U8(body: string, baseUrl: string, origin: string, ref?: string, ua?: string) {
    const base = new URL(baseUrl);
    return body
        .split('\n')
        .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            return trimmed.replace(/URI="([^"]+)"/g, (_, uri) => {
                const abs = new URL(uri, base).toString();
                return `URI="${buildProxyUrl(origin, abs, ref, ua)}"`;
            });
        }
        try {
            const abs = new URL(trimmed, base).toString();
            return buildProxyUrl(origin, abs, ref, ua);
        }
        catch {
            return line;
        }
    })
        .join('\n');
}
export const Route = createFileRoute('/api/proxy')({
    server: {
        handlers: {
            OPTIONS: async () => new Response(null, {
                status: 204,
                headers: {
                    'access-control-allow-origin': '*',
                    'access-control-allow-methods': 'GET, OPTIONS',
                    'access-control-allow-headers': '*'
                }
            }),
            GET: async ({ request }) => {
                const u = new URL(request.url);
                const target = u.searchParams.get('url');
                if (!target)
                    return new Response('missing url', { status: 400 });
                let parsed: URL;
                try {
                    parsed = new URL(target);
                }
                catch {
                    return new Response('bad url', { status: 400 });
                }
                if (ALLOWED_HOSTS_DENY.includes(parsed.hostname)) {
                    return new Response('blocked', { status: 403 });
                }
                const ref = u.searchParams.get('ref') ?? `${parsed.protocol}//${parsed.hostname}/`;
                const ua = u.searchParams.get('ua') ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
                const range = request.headers.get('range');
                const upstreamHeaders: Record<string, string> = {
                    'User-Agent': ua,
                    Referer: ref,
                    Origin: new URL(ref).origin,
                    Accept: '*/*'
                };
                if (range)
                    upstreamHeaders['Range'] = range;
                let upstream: Response;
                try {
                    upstream = await fetch(target, { headers: upstreamHeaders, redirect: 'follow' });
                }
                catch (e: any) {
                    return new Response('upstream failed: ' + (e?.message ?? e), { status: 502 });
                }
                const contentType = upstream.headers.get('content-type') ?? '';
                const isPlaylist = /mpegurl|m3u8/i.test(contentType) || /\.m3u8(\?|$)/i.test(parsed.pathname);
                const respHeaders = new Headers();
                respHeaders.set('access-control-allow-origin', '*');
                respHeaders.set('access-control-expose-headers', '*');
                respHeaders.set('cache-control', 'no-store');
                if (isPlaylist) {
                    const text = await upstream.text();
                    const origin = u.origin;
                    const rewritten = rewriteM3U8(text, target, origin, ref, ua);
                    respHeaders.set('content-type', 'application/vnd.apple.mpegurl');
                    return new Response(rewritten, { status: upstream.status, headers: respHeaders });
                }
                respHeaders.set('content-type', contentType || 'application/octet-stream');
                const passthrough = ['content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified'];
                for (const h of passthrough) {
                    const v = upstream.headers.get(h);
                    if (v)
                        respHeaders.set(h, v);
                }
                return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
            }
        }
    }
});
