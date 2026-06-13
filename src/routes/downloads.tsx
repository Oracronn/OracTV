import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Trash2, Film, Tv, ExternalLink, Loader2, AlertCircle, CheckSquare, Square } from "lucide-react";
import { History, type HistoryItem } from "@/lib/history";
type FileEntry = {
    file: string;
    type?: string;
    lang?: string;
    provider?: string;
    headers?: Record<string, string>;
};
type SourcesResp = {
    files?: FileEntry[];
    subtitles?: {
        url: string;
        lang?: string;
    }[];
};
export const Route = createFileRoute("/downloads")({
    head: () => ({
        meta: [
            { title: "Downloads — OracTv" },
            { name: "description", content: "Download films, episodes, and anime. Direct MP4 and HLS playlists." },
        ],
    }),
    component: DownloadsPage,
});
type SelKey = string;
type RowSources = Record<string, {
    loading: boolean;
    error: string | null;
    data: SourcesResp | null;
}>;
const itemKey = (it: HistoryItem) => `${it.type}-${it.id}-${it.season ?? ""}-${it.episode ?? ""}`;
function buildDownloadUrl(it: HistoryItem, f: FileEntry) {
    const isHls = f.type === "hls" || /\.m3u8(\?|$)/i.test(f.file);
    const fileName = `${it.title.replace(/[^a-z0-9\-_]+/gi, "_")}${it.type === "tv" ? `_S${it.season}E${it.episode}` : ""}.${isHls ? "m3u8" : "mp4"}`;
    const params = new URLSearchParams({ url: f.file, filename: fileName });
    if (f.headers?.Referer)
        params.set("ref", f.headers.Referer);
    if (f.headers?.["User-Agent"])
        params.set("ua", f.headers["User-Agent"]);
    return { url: `/api/download?${params.toString()}`, fileName, isHls };
}
function DownloadsPage() {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [rows, setRows] = useState<RowSources>({});
    const [selected, setSelected] = useState<Set<SelKey>>(new Set());
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    useEffect(() => {
        const sync = () => setItems(History.list());
        sync();
        window.addEventListener("oracine:hist", sync);
        return () => window.removeEventListener("oracine:hist", sync);
    }, []);
    const fetchSources = async (it: HistoryItem) => {
        const k = itemKey(it);
        setRows((r) => ({ ...r, [k]: { loading: true, error: null, data: null } }));
        try {
            const qs = it.type === "tv" ? `?season=${it.season ?? 1}&episode=${it.episode ?? 1}` : "";
            const j: SourcesResp = await fetch(`/api/sources/${it.type}/${it.id}${qs}`).then((r) => r.json());
            setRows((r) => ({ ...r, [k]: { loading: false, error: j.files?.length ? null : "No streams available.", data: j } }));
        }
        catch (e: any) {
            setRows((r) => ({ ...r, [k]: { loading: false, error: String(e?.message ?? e), data: null } }));
        }
    };
    const toggleItem = (it: HistoryItem) => {
        const k = itemKey(it);
        setSelectedItems((s) => {
            const n = new Set(s);
            n.has(k) ? n.delete(k) : n.add(k);
            return n;
        });
        if (!rows[k])
            fetchSources(it);
    };
    const toggleFile = (key: SelKey) => {
        setSelected((s) => {
            const n = new Set(s);
            n.has(key) ? n.delete(key) : n.add(key);
            return n;
        });
    };
    const selectBestPerItem = () => {
        const newSel = new Set<SelKey>();
        for (const k of selectedItems) {
            const row = rows[k];
            const first = row?.data?.files?.[0];
            if (first)
                newSel.add(`${k}::${first.file}`);
        }
        setSelected(newSel);
    };
    const selectAllForExpanded = () => {
        const newSel = new Set(selected);
        for (const k of selectedItems) {
            const files = rows[k]?.data?.files ?? [];
            for (const f of files)
                newSel.add(`${k}::${f.file}`);
        }
        setSelected(newSel);
    };
    const clearSelection = () => { setSelected(new Set()); setSelectedItems(new Set()); };
    const startBulkDownload = () => {
        const links: {
            url: string;
            name: string;
        }[] = [];
        for (const key of selected) {
            const [k, fileUrl] = key.split("::");
            const it = items.find((x) => itemKey(x) === k);
            const f = rows[k]?.data?.files?.find((x) => x.file === fileUrl);
            if (it && f) {
                const { url, fileName } = buildDownloadUrl(it, f);
                links.push({ url, name: fileName });
            }
        }
        links.forEach((l, i) => {
            setTimeout(() => {
                const a = document.createElement("a");
                a.href = l.url;
                a.download = l.name;
                a.rel = "noopener";
                document.body.appendChild(a);
                a.click();
                a.remove();
            }, i * 350);
        });
    };
    const selectAllItems = () => {
        const all = new Set(items.map(itemKey));
        setSelectedItems(all);
        items.forEach((it) => { if (!rows[itemKey(it)])
            fetchSources(it); });
    };
    const selectedFileCount = selected.size;
    return (<div className="mx-auto max-w-[1500px] px-4 md:px-10 pt-24 pb-32">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-accent">
            <Download className="h-3.5 w-3.5"/> Library
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3">Downloads</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Tick titles to load sources, then check the files you want and hit <span className="text-accent">Download selected</span> — batch grab movies, episodes, and anime in one go.
          </p>
        </div>
        {items.length > 0 && (<div className="flex gap-2">
            <button onClick={selectAllItems} className="rounded-full bg-secondary/60 hover:bg-secondary border border-border px-4 py-2 text-sm transition">Select all titles</button>
            <button onClick={() => History.clear()} className="inline-flex items-center gap-2 rounded-full bg-secondary/60 hover:bg-destructive/20 hover:text-destructive border border-border px-4 py-2 text-sm transition">
              <Trash2 className="h-4 w-4"/> Clear
            </button>
          </div>)}
      </div>

      <div className="mt-10 space-y-4">
        {items.length === 0 ? (<div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <Download className="h-10 w-10 mx-auto text-muted-foreground"/>
            <p className="mt-4 text-muted-foreground">Watch something first — it'll show up here for download.</p>
            <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-glow)]">Browse titles</Link>
          </div>) : (items.map((it) => {
            const k = itemKey(it);
            const row = rows[k];
            const expanded = selectedItems.has(k);
            return (<div key={k} className="rounded-2xl border border-border bg-card/40 backdrop-blur-md overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <button onClick={() => toggleItem(it)} className="text-primary shrink-0" aria-label="Toggle">
                    {expanded ? <CheckSquare className="h-6 w-6"/> : <Square className="h-6 w-6 text-muted-foreground"/>}
                  </button>
                  <div className="w-20 md:w-28 aspect-video rounded-lg overflow-hidden bg-muted shrink-0">
                    {(it.backdrop || it.poster) && (<img src={(it.backdrop || it.poster) as string} alt={it.title} className="h-full w-full object-cover"/>)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
                      {it.type === "movie" ? <Film className="h-3.5 w-3.5"/> : <Tv className="h-3.5 w-3.5"/>}
                      {it.type === "movie" ? "Film" : `Series · S${it.season} E${it.episode}`}
                    </div>
                    <h3 className="text-base md:text-lg font-bold line-clamp-1 mt-0.5">{it.title}</h3>
                  </div>
                  <Link to={it.type === "movie" ? "/movie/$id" : "/tv/$id"} params={{ id: String(it.id) }} className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border px-4 py-2 text-sm transition">
                    <ExternalLink className="h-4 w-4"/> Open
                  </Link>
                </div>

                {expanded && (<div className="border-t border-border/60 bg-background/40 p-4">
                    {row?.loading && (<div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-primary"/> Scanning providers…
                      </div>)}
                    {row?.error && (<div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4"/> {row.error}
                      </div>)}
                    {row?.data?.files && row.data.files.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {row.data.files.map((f, i) => {
                            const isHls = f.type === "hls" || /\.m3u8(\?|$)/i.test(f.file);
                            const selKey: SelKey = `${k}::${f.file}`;
                            const isSelected = selected.has(selKey);
                            const { url: dlUrl, fileName } = buildDownloadUrl(it, f);
                            return (<label key={f.file + i} className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${isSelected ? "bg-primary/15 border-primary/60" : "bg-secondary/40 border-border hover:bg-primary/10"}`}>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleFile(selKey)} className="h-4 w-4 accent-primary"/>
                              <div className="rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground p-2 shadow-md">
                                <Download className="h-4 w-4"/>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{f.provider?.replace(/^get/, "") ?? `Source ${i + 1}`}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {isHls ? "HLS · open in VLC" : "Direct MP4"} {f.lang ? `· ${f.lang}` : ""}
                                </p>
                              </div>
                              <a href={dlUrl} download={fileName} onClick={(e) => e.stopPropagation()} className="text-xs uppercase tracking-widest text-accent hover:underline">{isHls ? "M3U8" : "MP4"}</a>
                            </label>);
                        })}
                      </div>)}
                  </div>)}
              </div>);
        }))}
      </div>

      {(selectedFileCount > 0 || selectedItems.size > 0) && (<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(960px,calc(100%-2rem))]">
          <div className="rounded-2xl border border-primary/40 bg-background/85 backdrop-blur-xl shadow-[var(--shadow-glow)] p-3 md:p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl tracking-wider">
                {selectedFileCount} <span className="text-muted-foreground text-sm uppercase tracking-widest">files selected</span>
              </p>
              <p className="text-xs text-muted-foreground">{selectedItems.size} titles expanded · downloads stream through your server</p>
            </div>
            <button onClick={selectBestPerItem} className="rounded-full bg-secondary/60 hover:bg-secondary border border-border px-4 py-2 text-xs uppercase tracking-widest transition">Best per title</button>
            <button onClick={selectAllForExpanded} className="rounded-full bg-secondary/60 hover:bg-secondary border border-border px-4 py-2 text-xs uppercase tracking-widest transition">Select all loaded</button>
            <button onClick={clearSelection} className="rounded-full bg-secondary/60 hover:bg-destructive/20 hover:text-destructive border border-border px-4 py-2 text-xs uppercase tracking-widest transition">Clear</button>
            <button onClick={startBulkDownload} disabled={selectedFileCount === 0} className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2.5 text-sm font-bold uppercase tracking-widest shadow-[var(--shadow-glow)] hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100 flex items-center gap-2">
              <Download className="h-4 w-4"/> Download {selectedFileCount > 0 ? `(${selectedFileCount})` : ""}
            </button>
          </div>
        </div>)}
    </div>);
}
