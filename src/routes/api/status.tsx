import { createFileRoute } from '@tanstack/react-router';
import { getCacheStats } from '@/server/backend/cache/cache.js';
const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'content-type': 'application/json'
};
export const Route = createFileRoute('/api/status')({
    server: {
        handlers: {
            OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
            GET: async () => {
                let cache: unknown = null;
                try {
                    cache = getCacheStats();
                }
                catch {
                    cache = null;
                }
                return new Response(JSON.stringify({
                    name: 'OracTv API',
                    by: 'Oracron — built by Jaden',
                    status: 'ok',
                    time: new Date().toISOString(),
                    routes: [
                        '/api/movie/{tmdbId}',
                        '/api/tv/{tmdbId}/{season}/{episode}',
                        '/api/sources/{type}/{tmdbId}',
                        '/api/subtitles/{type}/{tmdbId}',
                        '/api/proxy?url=',
                        '/api/download?url=',
                        '/api/status'
                    ],
                    cache
                }), { headers: cors });
            }
        }
    }
});
