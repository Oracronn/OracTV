import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Star, Calendar, Clock, Download } from "lucide-react";
import { getMedia } from "@/lib/tmdb.functions";
import { img } from "@/lib/tmdb-image";
import { StreamPlayer } from "@/components/StreamPlayer";
import { LibraryButton } from "@/components/LibraryButton";
import { MediaRow } from "@/components/MediaRow";
import { History } from "@/lib/history";
import { img as tmdbImg } from "@/lib/tmdb-image";
const qo = (id: number) => queryOptions({
    queryKey: ["media", "movie", id],
    queryFn: () => getMedia({ data: { type: "movie", id } }),
});
export const Route = createFileRoute("/movie/$id")({
    loader: async ({ context, params }) => {
        const id = Number(params.id);
        if (!Number.isFinite(id))
            throw notFound();
        await context.queryClient.ensureQueryData(qo(id));
    },
    head: () => ({
        meta: [{ title: `Movie — OracTv` }],
    }),
    component: MoviePage,
    notFoundComponent: () => (<div className="p-20 text-center text-muted-foreground">Movie not found.</div>),
});
function MoviePage() {
    const { id } = Route.useParams();
    const numId = Number(id);
    const { data } = useSuspenseQuery(qo(numId));
    const m: any = data;
    const [playing, setPlaying] = useState(false);
    const backdrop = img(m.backdrop_path, "original");
    const poster = img(m.poster_path, "w500");
    const startWatch = () => {
        setPlaying(true);
        History.upsert({
            id: m.id,
            type: "movie",
            title: m.title,
            poster,
            backdrop: tmdbImg(m.backdrop_path, "w780"),
        });
    };
    return (<div className="pb-20">
      <div className="relative">
        {backdrop && (<div className="absolute inset-0 -z-10 h-[80vh]">
            <img src={backdrop} alt="" className="h-full w-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40"/>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.66_0.27_354/0.25),transparent_55%)]"/>
          </div>)}
        <div className="mx-auto max-w-[1800px] px-4 md:px-10 pt-28 pb-12">
          <div className="flex flex-col md:flex-row gap-10">
            {poster && (<div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 blur-xl"/>
                <img src={poster} alt={m.title} className="relative w-56 md:w-72 rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-primary/30"/>
              </div>)}
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-primary">
                Film
              </span>
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-balance">
                {m.title}
              </h1>
              {m.tagline && <p className="text-lg text-accent/90 italic">{m.tagline}</p>}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {m.vote_average ? (<span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]"/>
                    {m.vote_average.toFixed(1)}
                  </span>) : null}
                {m.release_date && (<span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4"/> {m.release_date.slice(0, 4)}
                  </span>)}
                {m.runtime ? (<span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4"/> {Math.floor(m.runtime / 60)}h {m.runtime % 60}m
                  </span>) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {(m.genres ?? []).map((g: any) => (<span key={g.id} className="rounded-full bg-secondary/60 border border-border px-3 py-1 text-xs uppercase tracking-widest">
                    {g.name}
                  </span>))}
              </div>
              <p className="max-w-3xl text-foreground/85 leading-relaxed">{m.overview}</p>
              <div className="flex flex-wrap gap-3 pt-3">
                <button onClick={startWatch} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition">
                  <Play className="h-5 w-5 fill-current"/> Watch Now
                </button>
                <LibraryButton type="movie" id={m.id} title={m.title} poster={poster}/>
                <a href="/downloads" onClick={(e) => { History.upsert({ id: m.id, type: "movie", title: m.title, poster, backdrop: tmdbImg(m.backdrop_path, "w780") }); }} className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 px-6 py-3.5 font-semibold transition">
                  <Download className="h-5 w-5"/> Download
                </a>
              </div>
            </div>
          </div>

          {playing && (<div className="mt-14">
              <StreamPlayer type="movie" tmdb={m.id} title={m.title}/>
            </div>)}

          {m.recommendations?.results?.length > 0 && (<div className="mt-20">
              <MediaRow title="You may also like" subtitle="Picked for you" items={m.recommendations.results}/>
            </div>)}
          {m.similar?.results?.length > 0 && (<div className="mt-14">
              <MediaRow title="Similar Films" items={m.similar.results} type="movie"/>
            </div>)}
        </div>
      </div>
    </div>);
}
