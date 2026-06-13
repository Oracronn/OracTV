import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Code2, Server, Subtitles, Shield, Download } from 'lucide-react';
export const Route = createFileRoute('/docs')({
    head: () => ({
        meta: [
            { title: 'API Docs — OracTv' },
            { name: 'description', content: 'Public REST API for movie/TV stream resolution, subtitles, proxy, and downloads.' },
            { property: 'og:title', content: 'OracTv — Developer API' },
            { property: 'og:description', content: 'Free TMDB-based scraping API. Direct stream URLs, subtitles, CORS proxy, and downloads.' },
        ],
    }),
    component: DocsPage,
});
function Endpoint({ method, path, desc, example }: {
    method: string;
    path: string;
    desc: string;
    example?: string;
}) {
    return (<div className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
                <span className="rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold px-2.5 py-1 uppercase tracking-wider">{method}</span>
                <code className="font-mono text-base text-foreground break-all">{path}</code>
            </div>
            <p className="text-muted-foreground text-sm">{desc}</p>
            {example && (<pre className="mt-4 overflow-x-auto rounded-lg bg-black/50 border border-border p-4 text-xs text-foreground/90">
                    <code>{example}</code>
                </pre>)}
        </div>);
}
function DocsPage() {
    const [origin, setOrigin] = useState('');
    useEffect(() => { setOrigin(window.location.origin); }, []);
    return (<div className="mx-auto max-w-4xl px-6 py-16 space-y-12">
            <header className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary">
                    <Code2 className="h-3.5 w-3.5"/> Developer API
                </span>
                <h1 className="text-3xl md:text-5xl font-black leading-tight">OracTv API</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Public REST API for resolving direct stream URLs, subtitles, and downloads from TMDB IDs.
                    Same origin as the app — no keys, no auth, full CORS. Self-hosted on your Railway deployment.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-secondary/60 border border-border px-3 py-1">Base: <code className="text-accent">{origin}</code></span>
                    <span className="rounded-full bg-secondary/60 border border-border px-3 py-1">CORS: <code className="text-accent">*</code></span>
                    <span className="rounded-full bg-secondary/60 border border-border px-3 py-1">Cache: 3h in-memory</span>
                </div>
            </header>

            <section className="space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2"><Server className="h-6 w-6 text-primary"/> Sources</h2>

                <Endpoint method="GET" path="/api/sources/movie/{tmdbId}" desc="Resolve direct stream URLs for a movie across all working providers (parallel, 15s timeout each)." example={`curl ${origin}/api/sources/movie/27205

{
  "files": [
    { "file": "https://...m3u8", "type": "hls", "lang": "en", "provider": "getTwoEmbed" }
  ],
  "subtitles": [
    { "url": "https://...vtt", "lang": "en", "type": "vtt" }
  ]
}`}/>

                <Endpoint method="GET" path="/api/sources/tv/{tmdbId}?season={n}&episode={n}" desc="Resolve direct stream URLs for a TV episode." example={`curl '${origin}/api/sources/tv/1399?season=1&episode=1'`}/>

                <Endpoint method="GET" path="/api/movie/{tmdbId}" desc="Shorthand movie endpoint — identical output to /api/sources/movie/{tmdbId}." example={`curl ${origin}/api/movie/27205`}/>

                <Endpoint method="GET" path="/api/tv/{tmdbId}/{season}/{episode}" desc="Shorthand TV endpoint with path params." example={`curl ${origin}/api/tv/1399/1/1`}/>

                <Endpoint method="GET" path="/api/status" desc="API health, route list and cache statistics." example={`curl ${origin}/api/status`}/>
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2"><Subtitles className="h-6 w-6 text-primary"/> Subtitles</h2>
                <Endpoint method="GET" path="/api/subtitles/{type}/{tmdbId}?season={n}&episode={n}" desc="Subtitle-only lookup (Wyzie + LibreSubs) without scraping video providers." example={`curl ${origin}/api/subtitles/movie/27205`}/>
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/> Proxy</h2>
                <Endpoint method="GET" path="/api/proxy?url={encoded}&ref={referer}&ua={user-agent}" desc="CORS-friendly streaming proxy with automatic m3u8 rewriting (segment URLs route back through this endpoint)." example={`<video src="${origin}/api/proxy?url=https%3A%2F%2Fexample.com%2Findex.m3u8" controls />`}/>
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2"><Download className="h-6 w-6 text-primary"/> Downloads</h2>
                <Endpoint method="GET" path="/api/download?url={encoded}&filename={name}" desc="Same upstream behaviour as /api/proxy but with Content-Disposition: attachment — browsers save the file. For HLS playlists, segment URLs are rewritten to absolute proxy URLs so the .m3u8 stays playable offline in VLC." example={`<a href="${origin}/api/download?url=https%3A%2F%2Fexample.com%2Ffilm.mp4&filename=movie.mp4">Download MP4</a>`}/>
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-bold">Providers</h2>
                <p className="text-muted-foreground text-sm">
                    The scraper aggregates results across these providers in parallel:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {['Uembed', '2Embed', 'AutoEmbed', 'VidSrcCC', 'VidRock', 'MultiEmbed', 'CinemaOS', 'EmbedSu', 'Movieapiclub', 'VixSrc', 'VidZee', 'VidSrc', 'VidSrcWtf', 'Xprime', '111Movies', 'PrimeWire', 'Wyzie (subs)', 'LibreSubs (subs)'].map((p) => (<span key={p} className="rounded-lg border border-border bg-card/40 px-3 py-2 font-mono text-xs">{p}</span>))}
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-bold">Errors</h2>
                <p className="text-muted-foreground text-sm">Standard HTTP status codes. JSON errors: <code className="text-accent">{`{ "error": "message" }`}</code>.</p>
            </section>

            <footer className="border-t border-border pt-8 text-xs text-muted-foreground">
                OracTv doesn't host any media. Streams are aggregated from public third-party providers. Use responsibly.
            </footer>
        </div>);
}
