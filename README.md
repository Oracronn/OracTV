# ORACINE

A cinematic, ad-free streaming platform with a public REST API for movie and TV metadata, direct stream sources, subtitles, and proxied playback.

## Features

- Aggregated direct stream sources for movies and TV episodes
- Multi-language subtitle lookup
- CORS-safe streaming proxy with automatic playlist rewriting
- Direct file downloads
- TMDB-powered search, discovery, and metadata
- Live service status and cache stats

## API Reference

All endpoints return JSON (except `/api/proxy` and `/api/download`, which stream raw media) and support CORS.

### Get movie sources

```
GET /api/movie/:tmdbId
```

Returns all available streams and subtitle tracks for a movie, looked up by its TMDB ID.

**Example**
```
GET /api/movie/27205
```

---

### Get TV episode sources

```
GET /api/tv/:tmdbId/:season/:episode
```

Returns all available streams and subtitle tracks for a specific episode.

**Example**
```
GET /api/tv/1396/1/1
```

---

### Get sources (unified)

```
GET /api/sources/:type/:tmdbId?season=&episode=
```

`type` is either `movie` or `tv`. For TV, pass `season` and `episode` as query parameters.

**Examples**
```
GET /api/sources/movie/27205
GET /api/sources/tv/1396?season=1&episode=1
```

---

### Get subtitles

```
GET /api/subtitles/:type/:tmdbId?season=&episode=
```

Returns merged, deduplicated subtitle tracks from all available subtitle providers.

`type` is `movie` or `tv`. For TV, `season` and `episode` query parameters are required.

**Examples**
```
GET /api/subtitles/movie/27205
GET /api/subtitles/tv/1396?season=1&episode=1
```

---

### Streaming proxy

```
GET /api/proxy?url=<encoded-url>&ref=<encoded-referer>&ua=<encoded-user-agent>
```

Proxies a video stream or playlist through ORACINE, rewriting `.m3u8` manifests so every referenced segment also routes through the proxy. Use this to play sources that block direct/cross-origin requests.

| Param | Required | Description |
| --- | --- | --- |
| `url` | yes | The upstream resource to proxy (URL-encoded) |
| `ref` | no | Referer header to send upstream |
| `ua` | no | User-Agent header to send upstream |

---

### Download

```
GET /api/download?url=<encoded-url>&filename=<name>&ref=<encoded-referer>&ua=<encoded-user-agent>
```

Same as the proxy, but responds with `Content-Disposition: attachment` so browsers save the file instead of playing it.

| Param | Required | Description |
| --- | --- | --- |
| `url` | yes | The upstream resource to download (URL-encoded) |
| `filename` | no | Suggested filename (defaults to `oracine-download`) |
| `ref` | no | Referer header to send upstream |
| `ua` | no | User-Agent header to send upstream |

---

### TMDB passthrough

```
GET /api/tmdb/*
```

Proxies TMDB's API for search, discovery, trending, genres, credits, and related metadata, so the client never needs its own TMDB key.

**Examples**
```
GET /api/tmdb/search/movie?query=inception
GET /api/tmdb/trending/movie/week
GET /api/tmdb/movie/27205
GET /api/tmdb/movie/27205/recommendations
GET /api/tmdb/discover/movie?with_genres=28
GET /api/tmdb/genres/movie
```

---

### Service status

```
GET /api/status
```

Returns service health, a list of available routes, and cache statistics.

## Usage

All endpoints are plain HTTP `GET` requests — no API key or authentication required.

```bash
curl "https://your-deployment.example/api/sources/movie/27205"
```

```js
const res = await fetch("https://your-deployment.example/api/sources/movie/27205");
const data = await res.json();
```

To play a returned stream URL through the built-in proxy (recommended for cross-origin playback):

```js
const proxied = `/api/proxy?url=${encodeURIComponent(streamUrl)}`;
```

## Notes

ORACINE does not host any media itself. It aggregates and proxies publicly accessible streams and metadata from third-party providers. Use responsibly and in accordance with the terms of the services involved.
