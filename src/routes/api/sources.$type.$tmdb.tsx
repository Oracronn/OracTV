import { createFileRoute } from '@tanstack/react-router';
import { scrapeMedia } from '@/server/backend/api.js';
import { getMovieFromTmdb, getTvFromTmdb } from '@/server/backend/helpers/tmdb.js';
const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'content-type': 'application/json'
};
export const Route = createFileRoute('/api/sources/$type/$tmdb')({
    server: {
        handlers: {
            OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
            GET: async ({ params, request }) => {
                const { type, tmdb } = params;
                if (type !== 'movie' && type !== 'tv') {
                    return new Response(JSON.stringify({ error: 'type must be movie or tv' }), { status: 400, headers: cors });
                }
                if (!/^\d+$/.test(tmdb)) {
                    return new Response(JSON.stringify({ error: 'invalid tmdb id' }), { status: 400, headers: cors });
                }
                const url = new URL(request.url);
                const season = Number(url.searchParams.get('season') || 0);
                const episode = Number(url.searchParams.get('episode') || 0);
                try {
                    const media = type === 'movie'
                        ? await getMovieFromTmdb(tmdb)
                        : await getTvFromTmdb(tmdb, season || 1, episode || 1);
                    if (media instanceof Error || (media && media._isError)) {
                        return new Response(JSON.stringify({ error: 'tmdb lookup failed' }), { status: 502, headers: cors });
                    }
                    const result = await scrapeMedia(media);
                    return new Response(JSON.stringify(result), { headers: cors });
                }
                catch (e: any) {
                    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: cors });
                }
            }
        }
    }
});
