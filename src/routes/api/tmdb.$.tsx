import { createFileRoute } from '@tanstack/react-router';
const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': '*',
    'content-type': 'application/json'
};
const TMDB = 'https://api.themoviedb.org/3';
async function tmdb(path: string, qs?: Record<string, string | number | undefined>) {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token)
        throw new Error('TMDB token missing');
    const u = new URL(TMDB + path);
    u.searchParams.set('language', 'en-US');
    for (const [k, v] of Object.entries(qs ?? {})) {
        if (v !== undefined && v !== null && v !== '')
            u.searchParams.set(k, String(v));
    }
    const res = await fetch(u.toString(), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    if (!res.ok)
        throw new Error(`TMDB ${res.status}`);
    return res.json();
}
export const Route = createFileRoute('/api/tmdb/$')({
    server: {
        handlers: {
            OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
            GET: async ({ params, request }) => {
                const splat = (params as any)._splat as string;
                const segs = splat.split('/').filter(Boolean);
                const url = new URL(request.url);
                const q = (k: string) => url.searchParams.get(k) ?? undefined;
                const page = q('page');
                try {
                    let data: any;
                    const [a, b, c, d, e, f] = segs;
                    switch (a) {
                        case 'search': {
                            const t = q('type') ?? 'multi';
                            data = await tmdb(`/search/${t}`, { query: q('q') ?? '', page, include_adult: 'false' });
                            break;
                        }
                        case 'trending':
                            data = await tmdb(`/trending/${b ?? 'all'}/${c ?? 'week'}`, { page });
                            break;
                        case 'discover':
                            data = await tmdb(`/discover/${b ?? 'movie'}`, {
                                sort_by: q('sort') ?? 'popularity.desc',
                                with_genres: q('genre'),
                                page,
                                primary_release_year: q('year'),
                                first_air_date_year: q('year'),
                                include_adult: 'false'
                            });
                            break;
                        case 'popular':
                            data = await tmdb(`/${b ?? 'movie'}/popular`, { page });
                            break;
                        case 'top_rated':
                            data = await tmdb(`/${b ?? 'movie'}/top_rated`, { page });
                            break;
                        case 'upcoming':
                            data = await tmdb(`/movie/upcoming`, { page });
                            break;
                        case 'now_playing':
                            data = await tmdb(`/movie/now_playing`, { page });
                            break;
                        case 'airing_today':
                            data = await tmdb(`/tv/airing_today`, { page });
                            break;
                        case 'on_the_air':
                            data = await tmdb(`/tv/on_the_air`, { page });
                            break;
                        case 'genres':
                            data = await tmdb(`/genre/${b ?? 'movie'}/list`);
                            break;
                        case 'movie':
                            data = await tmdb(`/movie/${b}`, {
                                append_to_response: 'videos,credits,images,recommendations,similar,external_ids,release_dates'
                            });
                            break;
                        case 'tv':
                            if (c === 'season' && d) {
                                if (e === 'episode' && f) {
                                    data = await tmdb(`/tv/${b}/season/${d}/episode/${f}`);
                                }
                                else {
                                    data = await tmdb(`/tv/${b}/season/${d}`);
                                }
                            }
                            else {
                                data = await tmdb(`/tv/${b}`, {
                                    append_to_response: 'videos,credits,images,recommendations,similar,external_ids,content_ratings'
                                });
                            }
                            break;
                        case 'recommendations':
                            data = await tmdb(`/${b}/${c}/recommendations`, { page });
                            break;
                        case 'similar':
                            data = await tmdb(`/${b}/${c}/similar`, { page });
                            break;
                        case 'credits':
                            data = await tmdb(`/${b}/${c}/credits`);
                            break;
                        case 'videos':
                            data = await tmdb(`/${b}/${c}/videos`);
                            break;
                        case 'external_ids':
                            data = await tmdb(`/${b}/${c}/external_ids`);
                            break;
                        case 'find':
                            data = await tmdb(`/find/${b}`, { external_source: q('source') ?? 'imdb_id' });
                            break;
                        default:
                            return new Response(JSON.stringify({ error: 'unknown route', segs }), {
                                status: 404,
                                headers: cors
                            });
                    }
                    return new Response(JSON.stringify(data), { headers: cors });
                }
                catch (err: any) {
                    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
                        status: 500,
                        headers: cors
                    });
                }
            }
        }
    }
});
