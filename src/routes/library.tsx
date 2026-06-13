import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Bookmark } from "lucide-react";
import { Library, type LibItem } from "@/lib/library";
export const Route = createFileRoute("/library")({
    head: () => ({ meta: [{ title: "My Library — OracTv" }] }),
    component: LibraryPage,
});
function LibraryPage() {
    const [items, setItems] = useState<LibItem[]>([]);
    useEffect(() => {
        const sync = () => setItems(Library.list());
        sync();
        window.addEventListener("oracine:lib", sync);
        return () => window.removeEventListener("oracine:lib", sync);
    }, []);
    return (<div className="mx-auto max-w-[1800px] px-4 md:px-10 pt-24 pb-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-accent">
        <Bookmark className="h-3.5 w-3.5"/> Saved
      </span>
      <h1 className="text-2xl md:text-3xl font-black mt-3">My Library</h1>

      {items.length === 0 ? (<div className="text-center py-24 mt-8 border border-dashed border-border rounded-2xl">
          <Bookmark className="h-10 w-10 mx-auto text-muted-foreground"/>
          <p className="text-muted-foreground mt-4">Your library is empty. Save titles from any movie or series page.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-primary-foreground font-medium shadow-[var(--shadow-glow)]">Browse titles</Link>
        </div>) : (<div className="mt-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {items.map((it) => (<div key={`${it.type}-${it.id}`} className="group relative">
              <Link to={it.type === "movie" ? "/movie/$id" : "/tv/$id"} params={{ id: String(it.id) }} className="block overflow-hidden rounded-2xl bg-card aspect-[2/3] shadow-[var(--shadow-card)] ring-1 ring-border/50 hover:ring-primary/60 hover:shadow-[var(--shadow-glow)] transition">
                {it.poster ? (<img src={it.poster} alt={it.title} className="h-full w-full object-cover transition group-hover:scale-105"/>) : (<div className="h-full w-full flex items-center justify-center text-muted-foreground font-display text-4xl">{it.title.slice(0, 1)}</div>)}
              </Link>
              <button onClick={() => Library.remove(it.type, it.id)} className="absolute top-2 right-2 rounded-full bg-black/80 backdrop-blur p-2 opacity-0 group-hover:opacity-100 transition hover:bg-destructive" aria-label="Remove">
                <Trash2 className="h-4 w-4"/>
              </button>
              <p className="mt-2 text-sm line-clamp-1 font-medium">{it.title}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{it.type === "movie" ? "Film" : "Series"}</p>
            </div>))}
        </div>)}
    </div>);
}
