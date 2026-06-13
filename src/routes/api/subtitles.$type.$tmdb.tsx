import { createFileRoute } from '@tanstack/react-router';
import { getWyzie } from '@/server/backend/controllers/subs/wyzie.js';
import { getLibre } from '@/server/backend/controllers/subs/libresubs.js';
import { getMovieFromTmdb, getTvFromTmdb } from '@/server/backend/helpers/tmdb.js';
const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'content-type': 'application/json'
};
export const Route = createFileRoute('/api/subtitles/$type/$tmdb')({
    server: {
        handlers: {
            OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
            GET: async ({ params, request }) => {
                const { type, tmdb } = params;
                if ((type !== 'movie' && type !== 'tv') || !/^\d{1,12}$/.test(tmdb)) {
                    return new Response(JSON.stringify({ error: 'invalid parameters' }), { status: 400, headers: cors });
                }
                const url = new URL(request.url);
                const season = Number(url.searchParams.get('season') || 1);
                const episode = Number(url.searchParams.get('episode') || 1);
                try {
                    const media = type === 'movie'
                        ? await getMovieFromTmdb(tmdb)
                        : await getTvFromTmdb(tmdb, season, episode);
                    if (media instanceof Error || (media as any)?._isError) {
                        return new Response(JSON.stringify({ error: 'tmdb lookup failed' }), { status: 502, headers: cors });
                    }
                    const results = await Promise.allSettled([getWyzie(media), getLibre(media)]);
                    const subtitles = results
                        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
                        .map((r) => r.value)
                        .filter((d) => d && Array.isArray(d.subtitles))
                        .flatMap((d) => d.subtitles)
                        .filter((s: any, i: number, self: any[]) => s?.url && self.findIndex((x) => x.url === s.url) === i);
                    return new Response(JSON.stringify({ subtitles }), { headers: cors });
                }
                catch (e: any) {
                    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: cors });
                }
            }
        }
    }
});
