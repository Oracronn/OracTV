# ORACINE

A cinematic, ad-free streaming experience. No keys, no setup. Stream films and series instantly, download direct files, browse from any device.

## Stack

- **TanStack Start** + React 19 (SSR + file-based routing)
- **Tailwind v4** with a custom Neon Midnight design system (Bebas Neue + Barlow)
- **Custom HLS.js player** with subtitle picker, multi-source switching, downloads
- **Server-side scrapers** aggregating 11+ providers in parallel (2Embed, AutoEmbed, VidSrcCC, VidRock, MultiEmbed, CinemaOS, EmbedSu, Movieapiclub, VixSrc, VidZee, Uembed + Wyzie/LibreSubs)
- **CORS-friendly streaming proxy** with automatic m3u8 rewriting
- **Public REST API** at `/api/sources/*`, `/api/proxy`, `/api/download`

## Deploy on Railway

1. Push this repo to GitHub.
2. On [Railway](https://railway.com), create a new project from your GitHub repo.
3. Railway will detect the `Dockerfile` automatically (config in `railway.json`).
4. (Optional) Set environment variables:
   - `TMDB_READ_ACCESS_TOKEN` — your TMDB v4 read access token (for metadata)
   - `PORT` — Railway sets this automatically
5. Deploy. The first build takes ~2–3 min.

Stream URLs are auto-detected from the request origin — no hard-coded domains. Whether you deploy at `oracine.up.railway.app`, a custom domain, or move providers, the player and API just work.

## Local dev

```bash
bun install
bun run dev
```

App boots on `http://localhost:8080` (or whatever Vite picks).

## API endpoints

See `/docs` once the app is running for full developer docs.

| Method | Path | What |
| --- | --- | --- |
| GET | `/api/sources/movie/:tmdbId` | All direct stream URLs + subs for a movie |
| GET | `/api/sources/tv/:tmdbId?season=1&episode=1` | Same, for a TV episode |
| GET | `/api/proxy?url=…&ref=…&ua=…` | CORS-safe streaming proxy w/ m3u8 rewriting |
| GET | `/api/download?url=…&filename=…` | Same as proxy but with `Content-Disposition: attachment` |

## Notes

ORACINE doesn't host any media. It aggregates publicly accessible streams from third-party providers. Use responsibly.
