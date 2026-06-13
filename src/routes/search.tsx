import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { searchMulti } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";
export const Route = createFileRoute("/search")({
    head: () => ({ meta: [{ title: "Search — OracTv" }] }),
    component: SearchPage,
});
function SearchPage() {
    const [q, setQ] = useState("");
    const [debounced, setDebounced] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebounced(q), 250);
        return () => clearTimeout(t);
    }, [q]);
    const { data, isFetching } = useQuery({
        queryKey: ["search", debounced],
        queryFn: () => searchMulti({ data: { q: debounced } }),
        enabled: debounced.trim().length > 0,
    });
    const results = ((data as any)?.results ?? []).filter((r: any) => r.media_type === "movie" || r.media_type === "tv");
    return (<div className="mx-auto max-w-[1800px] px-4 md:px-10 pt-24 pb-12">
      <h1 className="text-2xl md:text-3xl font-black">Search</h1>
      <p className="text-muted-foreground mt-2">Find anything in the archive.</p>

      <div className="relative max-w-2xl mt-8">
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary/40 to-accent/40 blur opacity-60"/>
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-5 h-5 w-5 text-muted-foreground"/>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search films and series…" className="w-full rounded-full bg-background/80 backdrop-blur-xl border border-border pl-13 pr-12 py-4 text-lg outline-none focus:border-primary transition" style={{ paddingLeft: "3.25rem" }}/>
          {q && (<button onClick={() => setQ("")} className="absolute right-4 rounded-full bg-secondary/60 p-1.5 hover:bg-secondary" aria-label="Clear">
              <X className="h-4 w-4"/>
            </button>)}
        </div>
      </div>

      <div className="mt-10 min-h-[40vh]">
        {!debounced && (<p className="text-muted-foreground">Start typing to scan the archive…</p>)}
        {debounced && isFetching && <p className="text-muted-foreground">Searching…</p>}
        {debounced && !isFetching && results.length === 0 && (<p className="text-muted-foreground">No results for "{debounced}".</p>)}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {results.map((r: any) => (<MediaCard key={`${r.media_type}-${r.id}`} item={r}/>))}
        </div>
      </div>
    </div>);
}
