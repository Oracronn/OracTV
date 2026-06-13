import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { History, type HistoryItem } from "@/lib/history";
export function ContinueWatchingRow() {
    const [items, setItems] = useState<HistoryItem[]>([]);
    useEffect(() => {
        const refresh = () => setItems(History.list());
        refresh();
        window.addEventListener("oracine:hist", refresh);
        return () => window.removeEventListener("oracine:hist", refresh);
    }, []);
    if (!items.length)
        return null;
    return (<section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-3xl tracking-wide">Continue Watching</h2>
        <div className="h-px flex-1 ml-6 bg-gradient-to-r from-border to-transparent"/>
        <button onClick={() => History.clear()} className="text-xs text-muted-foreground hover:text-foreground ml-4">
          Clear all
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 snap-x">
        {items.map((it) => (<Link key={`${it.type}-${it.id}-${it.season ?? ""}-${it.episode ?? ""}`} to={it.type === "movie" ? "/movie/$id" : "/tv/$id"} params={{ id: String(it.id) }} className="group snap-start shrink-0 w-[320px] relative rounded-2xl overflow-hidden ring-1 ring-border/40 hover:ring-primary/60 transition">
            <div className="aspect-video bg-muted relative">
              {it.backdrop && (<img src={it.backdrop} alt={it.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-500"/>)}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"/>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="rounded-full bg-primary/95 p-3 shadow-[0_0_30px_oklch(0.72_0.19_35_/_0.6)]">
                  <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground"/>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3">
                <p className="font-semibold text-white line-clamp-1">{it.title}</p>
                <p className="text-xs text-white/70">
                  {it.type === "tv" ? `S${it.season} · E${it.episode}` : "Movie"}
                </p>
              </div>
              {typeof it.progress === "number" && (<div className="absolute bottom-0 inset-x-0 h-1 bg-white/15">
                  <div className="h-full bg-primary" style={{ width: `${Math.round(it.progress * 100)}%` }}/>
                </div>)}
            </div>
          </Link>))}
      </div>
    </section>);
}
