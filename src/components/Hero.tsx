import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Info } from "lucide-react";
import { img } from "@/lib/tmdb-image";
import type { Media } from "./MediaCard";
export function Hero({ items }: {
    items: Media[];
}) {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (!items.length)
            return;
        const id = setInterval(() => setIdx((i) => (i + 1) % Math.min(items.length, 5)), 8000);
        return () => clearInterval(id);
    }, [items.length]);
    if (!items.length)
        return null;
    const item = items[idx];
    const type = (item.media_type ?? (item.title ? "movie" : "tv")) as "movie" | "tv";
    const title = item.title ?? item.name ?? "";
    const backdrop = img(item.backdrop_path, "original") ?? img(item.poster_path, "original");
    return (<div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
      {backdrop && (<img src={backdrop} alt={title} className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-700" key={item.id}/>)}

      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent"/>
      <div className="absolute inset-0 bg-[var(--gradient-hero)]"/>

      <div className="relative z-10 mx-auto max-w-[1800px] h-full px-4 md:px-10 flex flex-col justify-end pb-14">
        <h1 className="text-3xl md:text-5xl font-black text-balance max-w-2xl leading-[1.02] drop-shadow-xl">
          {title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/80">
          {item.vote_average ? (<span className="font-semibold text-green-400">{Math.round(item.vote_average * 10)}% Match</span>) : null}
          <span>{(item.release_date ?? item.first_air_date ?? "").slice(0, 4)}</span>
          <span className="rounded-[2px] border border-white/30 px-1 text-[9px]">HD</span>
          <span className="text-muted-foreground">{type === "movie" ? "Film" : "Series"}</span>
        </div>

        <p className="mt-3 max-w-xl text-sm text-foreground/85 line-clamp-3 leading-relaxed">
          {(item as any).overview}
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link to={type === "movie" ? "/movie/$id" : "/tv/$id"} params={{ id: String(item.id) }} search={{ play: 1 } as any} className="inline-flex items-center gap-2 rounded bg-white px-5 py-2 text-sm font-bold text-black hover:bg-white/85 transition">
            <Play className="h-4 w-4 fill-current"/> Play
          </Link>
          <Link to={type === "movie" ? "/movie/$id" : "/tv/$id"} params={{ id: String(item.id) }} className="inline-flex items-center gap-2 rounded bg-secondary/70 px-5 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition">
            <Info className="h-4 w-4"/> More Info
          </Link>
        </div>

        <div className="mt-6 flex gap-1.5">
          {items.slice(0, 5).map((_, i) => (<button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} className={`h-[3px] rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-4 bg-foreground/25 hover:bg-foreground/50"}`}/>))}
        </div>
      </div>
    </div>);
}
