import { strings } from '../strings.js';
import { ErrorObject } from './ErrorObject.js';

function key() {
    return process.env.TMDB_API_KEY || process.env.TMDB_READ_ACCESS_TOKEN;
}

function authHeaders() {
    const k = key();
    if (!k) return {};
    // If it looks like a v4 read access token (JWT), use Bearer; else assume v3 query key handled separately
    if (k.split('.').length === 3) return { Authorization: `Bearer ${k}`, Accept: 'application/json' };
    return { Accept: 'application/json' };
}

function withApiKey(url) {
    const k = key();
    if (!k || k.split('.').length === 3) return url;
    return url + (url.includes('?') ? '&' : '?') + 'api_key=' + k;
}

export async function getMovieFromTmdb(tmdb_id) {
    try {
        const url = withApiKey(`https://api.themoviedb.org/3/movie/${tmdb_id}`);
        const response = await fetch(url, { headers: authHeaders() });
        if (response.status !== 200) {
            return new ErrorObject(`TMDB error ${response.status}`, 'TMDB', response.status, 'check TMDB key', true, true);
        }
        const j = await response.json();
        return {
            type: 'movie',
            title: j.original_title,
            name: j.original_title,
            releaseYear: j.release_date ? Number(j.release_date.slice(0, 4)) : undefined,
            year: j.release_date ? Number(j.release_date.slice(0, 4)) : undefined,
            tmdb: String(tmdb_id),
            imdb: j.imdb_id || ''
        };
    } catch (e) {
        return new ErrorObject(e.message, 'TMDB', 500, '', true, true);
    }
}

export async function getTvFromTmdb(tmdb_id, season, episode) {
    try {
        const url = withApiKey(`https://api.themoviedb.org/3/tv/${tmdb_id}/external_ids`);
        const main = withApiKey(`https://api.themoviedb.org/3/tv/${tmdb_id}`);
        const [extRes, mainRes] = await Promise.all([
            fetch(url, { headers: authHeaders() }),
            fetch(main, { headers: authHeaders() })
        ]);
        if (mainRes.status !== 200) {
            return new ErrorObject(`TMDB error ${mainRes.status}`, 'TMDB', mainRes.status, '', true, true);
        }
        const m = await mainRes.json();
        const ext = extRes.ok ? await extRes.json() : {};
        return {
            type: 'tv',
            title: m.original_name,
            name: m.original_name,
            releaseYear: m.first_air_date ? Number(m.first_air_date.slice(0, 4)) : undefined,
            year: m.first_air_date ? Number(m.first_air_date.slice(0, 4)) : undefined,
            tmdb: String(tmdb_id),
            imdb: ext.imdb_id || '',
            season: Number(season),
            episode: Number(episode)
        };
    } catch (e) {
        return new ErrorObject(e.message, 'TMDB', 500, '', true, true);
    }
}
