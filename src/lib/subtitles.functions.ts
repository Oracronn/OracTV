import { createServerFn } from "@tanstack/react-start";
export const getSubtitles = createServerFn({ method: "GET" })
    .inputValidator((d: {
    tmdb_id: number;
    season?: number;
    episode?: number;
    language?: string;
}) => d)
    .handler(async ({ data }) => {
    const key = process.env.WYZIE_API_KEY;
    const params = new URLSearchParams();
    params.set("id", String(data.tmdb_id));
    if (data.season)
        params.set("season", String(data.season));
    if (data.episode)
        params.set("episode", String(data.episode));
    if (data.language)
        params.set("language", data.language);
    const url = `https://sub.wyzie.ru/search?${params.toString()}`;
    const res = await fetch(url, {
        headers: key ? { Authorization: `Bearer ${key}` } : {},
    });
    if (!res.ok)
        return [];
    return res.json();
});
