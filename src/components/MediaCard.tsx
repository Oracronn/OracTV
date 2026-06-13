import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { img } from "@/lib/tmdb-image";
export type Media = {
    id: number;
    media_type?: "movie" | "tv";
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
};
export function MediaCard({ item, type: forceType }: {
    item: Media;
    type?: "movie" | "tv";
}) {
    const type = (forceType ?? item.media_type ?? (item.title ? "movie" : "tv")) as "movie" | "tv";
    if (type !== "movie" && type !== "tv")
        return null;
    const title = item.title ?? item.name ?? "Untitled";
    const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    const poster = img(item.poster_path, "w300");
    return (<Link to={type === "movie" ? "/movie/$id" : "/tv/$id"} params={{ id: String(item.id) }} className="group relative block focus:outline-none" title={title}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-card transition-all duration-200 group-hover:scale-[1.06] group-hover:z-10 group-hover:ring-1 group-hover:ring-white/40 group-hover:shadow-[var(--shadow-card)]">
        {poster ? (<img src={poster} alt={title} loading="lazy" className="h-full w-full object-cover"/>) : (<div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-2xl font-bold">
            {title.slice(0, 1)}
          </div>)}

        
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-1.5">
            <Play className="h-3 w-3 fill-black text-black"/>
          </div>
        </div>

        {rating && (<span className="absolute left-1 top-1 rounded-[2px] bg-black/75 px-1 py-px text-[8px] font-bold text-white/90">
            ★ {rating}
          </span>)}
      </div>

      <div className="pt-1 px-0.5">
        <h3 className="line-clamp-1 text-[10px] font-medium text-foreground/85 leading-tight">{title}</h3>
        <p className="text-[9px] text-muted-foreground leading-tight">
          {year}{year ? " · " : ""}{type === "movie" ? "Film" : "Series"}
        </p>
      </div>
    </Link>);
}
