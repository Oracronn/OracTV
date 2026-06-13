import { createFileRoute } from '@tanstack/react-router';
import { scrapeMedia } from '@/server/backend/api.js';
import { getTvFromTmdb } from '@/server/backend/helpers/tmdb.js';
const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'content-type': 'application/json'
};
export const Route = createFileRoute('/api/tv/$tmdb/$season/$episode')({
    server: {
        handlers: {
            OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
            GET: async ({ params }) => {
                const { tmdb, season, episode } = params;
                if (!/^\d{1,12}$/.test(tmdb) || !/^\d{1,4}$/.test(season) || !/^\d{1,5}$/.test(episode)) {
                    return new Response(JSON.stringify({ error: 'invalid parameters' }), { status: 400, headers: cors });
                }
                try {
                    const media = await getTvFromTmdb(tmdb, Number(season), Number(episode));
                    if (media instanceof Error || (media as any)?._isError) {
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
