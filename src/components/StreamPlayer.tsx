import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2, AlertTriangle, Subtitles, ChevronDown, Download, Maximize, Server } from 'lucide-react';
export type Source = {
    file: string;
    type?: string;
    lang?: string;
    quality?: string | number;
    provider?: string;
    headers?: Record<string, string>;
};
export type Subtitle = {
    url: string;
    lang?: string;
    type?: string;
};
function safeRef(ref?: string) {
    if (!ref)
        return undefined;
    try {
        new URL(ref);
        return ref;
    }
    catch {
        return undefined;
    }
}
function proxify(file: string, headers?: Record<string, string>) {
    if (typeof window === 'undefined')
        return file;
    const u = new URL('/api/proxy', window.location.origin);
    u.searchParams.set('url', file);
    const ref = safeRef(headers?.Referer);
    if (ref)
        u.searchParams.set('ref', ref);
    if (headers?.['User-Agent'])
        u.searchParams.set('ua', headers['User-Agent']);
    return u.toString();
}
function downloadUrl(file: string, filename: string, headers?: Record<string, string>) {
    if (typeof window === 'undefined')
        return file;
    const u = new URL('/api/download', window.location.origin);
    u.searchParams.set('url', file);
    u.searchParams.set('filename', filename);
    if (headers?.Referer)
        u.searchParams.set('ref', headers.Referer);
    if (headers?.['User-Agent'])
        u.searchParams.set('ua', headers['User-Agent']);
    return u.toString();
}
export function StreamPlayer({ type, tmdb, season, episode, title, }: {
    type: 'movie' | 'tv';
    tmdb: string | number;
    season?: number;
    episode?: number;
    title?: string;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    const [subs, setSubs] = useState<Subtitle[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [activeSubLang, setActiveSubLang] = useState<string | null>(null);
    const [showSubMenu, setShowSubMenu] = useState(false);
    const [showSrcMenu, setShowSrcMenu] = useState(false);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setSources([]);
        setSubs([]);
        setActiveIdx(0);
        const params = new URLSearchParams();
        if (type === 'tv') {
            params.set('season', String(season ?? 1));
            params.set('episode', String(episode ?? 1));
        }
        const url = `/api/sources/${type}/${tmdb}${params.toString() ? '?' + params.toString() : ''}`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
            if (cancelled)
                return;
            const files: Source[] = data.files ?? [];
            if (!files.length) {
                setError('No streams found across providers. Try another title.');
                setLoading(false);
                return;
            }
            setSources(files);
            setSubs(data.subtitles ?? []);
            const en = (data.subtitles ?? []).find((s: Subtitle) => (s.lang ?? '').toLowerCase().startsWith('en'));
            setActiveSubLang(en?.lang ?? null);
        })
            .catch((e) => {
            if (cancelled)
                return;
            setError(String(e?.message ?? e));
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [type, tmdb, season, episode]);
    useEffect(() => {
        const video = videoRef.current;
        const src = sources[activeIdx];
        if (!video || !src)
            return;
        hlsRef.current?.destroy();
        hlsRef.current = null;
        setError(null);
        setLoading(true);
        const streamUrl = proxify(src.file, src.headers);
        const isHls = src.type === 'hls' || /\.m3u8(\?|$)/i.test(src.file);
        const onCanPlay = () => setLoading(false);
        const onError = () => {
            setError('Playback failed for this source. Try another.');
            setLoading(false);
        };
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('error', onError);
        const tryNext = () => {
            setActiveIdx((i) => {
                if (i + 1 < sources.length)
                    return i + 1;
                setError('All sources failed. Try a different title.');
                setLoading(false);
                return i;
            });
        };
        if (isHls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: false, maxBufferLength: 30 });
            hlsRef.current = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => { });
            });
            hls.on(Hls.Events.ERROR, (_evt, data) => {
                if (data.fatal)
                    tryNext();
            });
        }
        else {
            video.src = streamUrl;
            video.play().catch(() => { });
        }
        const onErr2 = () => tryNext();
        video.addEventListener('error', onErr2);
        return () => {
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('error', onError);
            video.removeEventListener('error', onErr2);
            hlsRef.current?.destroy();
            hlsRef.current = null;
        };
    }, [sources, activeIdx]);
    const activeSubs = subs.filter((s) => s.lang === activeSubLang);
    const active = sources[activeIdx];
    const isHls = active && (active.type === 'hls' || /\.m3u8(\?|$)/i.test(active.file));
    const fileName = `${(title ?? `oracine-${type}-${tmdb}`).replace(/[^a-z0-9\-_]+/gi, '_')}${type === 'tv' ? `_S${season ?? 1}E${episode ?? 1}` : ''}.${isHls ? 'm3u8' : 'mp4'}`;
    const enterFullscreen = () => {
        const v = videoRef.current;
        if (!v)
            return;
        if (document.fullscreenElement)
            document.exitFullscreen();
        else
            (v.requestFullscreen?.() ?? (v as any).webkitEnterFullscreen?.());
    };
    return (<div ref={wrapperRef} className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black neon-border">
                <video ref={videoRef} controls crossOrigin="anonymous" playsInline className="absolute inset-0 h-full w-full bg-black">
                    {activeSubs.map((s, i) => (<track key={s.url + i} src={`/api/proxy?url=${encodeURIComponent(s.url)}`} kind="subtitles" srcLang={s.lang} label={s.lang} default={i === 0}/>))}
                </video>

                {loading && !error && (<div className="absolute inset-0 grid place-items-center bg-black/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3 text-white">
                            <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                            <span className="text-sm uppercase tracking-[0.3em] text-primary">Scanning providers…</span>
                        </div>
                    </div>)}
                {error && (<div className="absolute inset-0 grid place-items-center bg-black/70 px-6 text-center">
                        <div className="flex flex-col items-center gap-2 text-white max-w-md">
                            <AlertTriangle className="h-10 w-10 text-destructive"/>
                            <p className="text-sm">{error}</p>
                            {sources.length > 1 && (<button onClick={() => setActiveIdx((i) => (i + 1) % sources.length)} className="mt-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                                    Try next source
                                </button>)}
                        </div>
                    </div>)}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground mr-1 flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5"/> Source
                </span>

                <div className="relative">
                    <button onClick={() => setShowSrcMenu((v) => !v)} disabled={!sources.length} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50">
                        {active?.provider?.replace(/^get/, '') ?? 'Auto'}
                        {active?.lang ? ` · ${active.lang}` : ''}
                        <ChevronDown className="h-4 w-4"/>
                    </button>
                    {showSrcMenu && (<div className="absolute z-20 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl">
                            {sources.map((s, i) => (<button key={s.file} onClick={() => {
                    setActiveIdx(i);
                    setShowSrcMenu(false);
                }} className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary ${i === activeIdx ? 'text-primary' : ''}`}>
                                    <div className="flex justify-between gap-2">
                                        <span className="font-medium">{s.provider?.replace(/^get/, '') ?? `Source ${i + 1}`}</span>
                                        <span className="text-xs text-muted-foreground">{s.lang ?? s.type ?? ''}</span>
                                    </div>
                                </button>))}
                        </div>)}
                </div>

                {subs.length > 0 && (<div className="relative">
                        <button onClick={() => setShowSubMenu((v) => !v)} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-secondary/60 border border-border text-foreground hover:bg-secondary">
                            <Subtitles className="h-4 w-4"/>
                            {activeSubLang ?? 'Off'}
                        </button>
                        {showSubMenu && (<div className="absolute z-20 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl">
                                <button onClick={() => { setActiveSubLang(null); setShowSubMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary">
                                    Off
                                </button>
                                {Array.from(new Set(subs.map((s) => s.lang).filter(Boolean))).map((lang) => (<button key={lang} onClick={() => { setActiveSubLang(lang!); setShowSubMenu(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary ${lang === activeSubLang ? 'text-primary' : ''}`}>
                                        {lang}
                                    </button>))}
                            </div>)}
                    </div>)}

                {active && (<a href={downloadUrl(active.file, fileName, active.headers)} download={fileName} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 transition" title={isHls ? 'Download HLS playlist (open in VLC for full file)' : 'Download direct file'}>
                        <Download className="h-4 w-4"/>
                        Download {isHls ? '· M3U8' : '· MP4'}
                    </a>)}

                <button onClick={enterFullscreen} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-secondary/60 border border-border hover:bg-secondary transition">
                    <Maximize className="h-4 w-4"/>
                    Fullscreen
                </button>

                <span className="ml-auto text-xs text-muted-foreground uppercase tracking-widest">
                    {sources.length} source{sources.length === 1 ? '' : 's'} · {subs.length} sub{subs.length === 1 ? '' : 's'} · ad-free
                </span>
            </div>
        </div>);
}
