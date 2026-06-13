import { createServerFn } from "@tanstack/react-start";
const TMDB_BASE = "https://api.themoviedb.org/3";
async function tmdb<T = any>(path: string): Promise<T> {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token)
        throw new Error("TMDB token missing");
    const sep = path.includes("?") ? "&" : "?";
    const url = `${TMDB_BASE}${path}${sep}language=en-US`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok)
        throw new Error(`TMDB ${res.status}`);
    return res.json();
}
export const getTrending = createServerFn({ method: "GET" })
    .inputValidator((d: {
    window?: "day" | "week";
    type?: "all" | "movie" | "tv";
}) => d ?? {})
    .handler(async ({ data }) => {
    const w = data.window ?? "week";
    const t = data.type ?? "all";
    return tmdb(`/trending/${t}/${w}`);
});
export const getDiscover = createServerFn({ method: "GET" })
    .inputValidator((d: {
    type: "movie" | "tv";
    sort?: string;
    genre?: number;
    page?: number;
}) => d)
    .handler(async ({ data }) => {
    const params = new URLSearchParams();
    params.set("sort_by", data.sort ?? "popularity.desc");
    if (data.genre)
        params.set("with_genres", String(data.genre));
    params.set("page", String(data.page ?? 1));
    return tmdb(`/discover/${data.type}?${params.toString()}`);
});
export const getMedia = createServerFn({ method: "GET" })
    .inputValidator((d: {
    type: "movie" | "tv";
    id: number;
}) => d)
    .handler(async ({ data }) => tmdb(`/${data.type}/${data.id}?append_to_response=videos,credits,images,recommendations,similar,external_ids,release_dates,content_ratings`));
export const getSeason = createServerFn({ method: "GET" })
    .inputValidator((d: {
    id: number;
    season: number;
}) => d)
    .handler(async ({ data }) => tmdb(`/tv/${data.id}/season/${data.season}`));
export const searchMulti = createServerFn({ method: "GET" })
    .inputValidator((d: {
    q: string;
    page?: number;
}) => d)
    .handler(async ({ data }) => {
    if (!data.q.trim())
        return { results: [] };
    return tmdb(`/search/multi?query=${encodeURIComponent(data.q)}&page=${data.page ?? 1}&include_adult=false`);
});
export const getGenres = createServerFn({ method: "GET" })
    .inputValidator((d: {
    type: "movie" | "tv";
}) => d)
    .handler(async ({ data }) => tmdb(`/genre/${data.type}/list`));
