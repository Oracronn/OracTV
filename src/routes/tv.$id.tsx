import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Star, Calendar } from "lucide-react";
import { getMedia, getSeason } from "@/lib/tmdb.functions";
import { img } from "@/lib/tmdb-image";
import { StreamPlayer } from "@/components/StreamPlayer";
import { LibraryButton } from "@/components/LibraryButton";
import { MediaRow } from "@/components/MediaRow";
import { History } from "@/lib/history";
import { img as tmdbImg } from "@/lib/tmdb-image";
function trackWatch(m: any, s: number, e: number) {
    History.upsert({
        id: m.id,
        type: "tv",
        title: m.name,
        poster: tmdbImg(m.poster_path, "w500"),
        backdrop: tmdbImg(m.backdrop_path, "w780"),
        season: s,
        episode: e,
    });
}
const tvQO = (id: number) => queryOptions({
    queryKey: ["media", "tv", id],
    queryFn: () => getMedia({ data: { type: "tv", id } }),
});
export const Route = createFileRoute("/tv/$id")({
    loader: async ({ context, params }) => {
        const id = Number(params.id);
        if (!Number.isFinite(id))
            throw notFound();
        await context.queryClient.ensureQueryData(tvQO(id));
    },
    head: () => ({ meta: [{ title: "Series — OracTv" }] }),
    component: TvShowPage,
    notFoundComponent: () => (<div className="p-20 text-center text-muted-foreground">Series not found.</div>),
});
function TvShowPage() {
    const { id } = Route.useParams();
    const numId = Number(id);
    const { data } = useSuspenseQuery(tvQO(numId));
    const m: any = data;
    const seasons = (m.seasons ?? []).filter((s: any) => s.season_number > 0);
    const [season, setSeason] = useState<number>(seasons[0]?.season_number ?? 1);
    const [episode, setEpisode] = useState<number>(1);
    const [playing, setPlaying] = useState(false);
    const seasonQ = useQuery({
        queryKey: ["season", numId, season],
        queryFn: () => getSeason({ data: { id: numId, season } }),
    });
    const episodes: any[] = (seasonQ.data as any)?.episodes ?? [];
    const backdrop = img(m.backdrop_path, "original");
    const poster = img(m.poster_path, "w500");
    return (<div className="pb-20">
      <div className="relative">
        {backdrop && (<div className="absolute inset-0 -z-10 h-[80vh]">
            <img src={backdrop} alt="" className="h-full w-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40"/>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.82_0.16_200/0.22),transparent_55%)]"/>
          </div>)}
        <div className="mx-auto max-w-[1800px] px-4 md:px-10 pt-28 pb-12">
          <div className="flex flex-col md:flex-row gap-10">
            {poster && (<div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/40 to-primary/30 blur-xl"/>
                <img src={poster} alt={m.name} className="relative w-56 md:w-72 rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-accent/30"/>
              </div>)}
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-accent">
                Series
              </span>
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-balance">{m.name}</h1>
              {m.tagline && <p className="text-lg text-accent/90 italic">{m.tagline}</p>}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {m.vote_average ? (<span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]"/>
                    {m.vote_average.toFixed(1)}
                  </span>) : null}
                {m.first_air_date && (<span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4"/> {m.first_air_date.slice(0, 4)}
                  </span>)}
                <span>{m.number_of_seasons} season{m.number_of_seasons === 1 ? "" : "s"} · {m.number_of_episodes} episodes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(m.genres ?? []).map((g: any) => (<span key={g.id} className="rounded-full bg-secondary/60 border border-border px-3 py-1 text-xs uppercase tracking-widest">
                    {g.name}
                  </span>))}
              </div>
              <p className="max-w-3xl text-foreground/85 leading-relaxed">{m.overview}</p>
              <div className="flex flex-wrap gap-3 pt-3">
                <button onClick={() => { setPlaying(true); trackWatch(m, season, episode); }} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition">
                  <Play className="h-5 w-5 fill-current"/> Watch S{season} · E{episode}
                </button>
                <LibraryButton type="tv" id={m.id} title={m.name} poster={poster}/>
              </div>
            </div>
          </div>

          {playing && (<div className="mt-14">
              <StreamPlayer type="tv" tmdb={m.id} season={season} episode={episode} title={m.name}/>
            </div>)}

          <div className="mt-16">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h2 className="text-xl font-bold mr-4">Episodes</h2>
              <select value={season} onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }} className="rounded-full bg-secondary/70 border border-border px-4 py-2 text-sm outline-none focus:border-primary">
                {seasons.map((s: any) => (<option key={s.id} value={s.season_number}>
                    Season {s.season_number} {s.name ? `— ${s.name}` : ""}
                  </option>))}
              </select>
              <span className="text-xs uppercase tracking-widest text-muted-foreground ml-auto">{episodes.length} episode{episodes.length === 1 ? "" : "s"}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {episodes.map((ep: any) => {
            const active = ep.episode_number === episode;
            const still = img(ep.still_path, "w300");
            return (<button key={ep.id} onClick={() => { setEpisode(ep.episode_number); setPlaying(true); trackWatch(m, season, ep.episode_number); }} className={`text-left rounded-2xl overflow-hidden border transition group ${active ? "border-primary ring-2 ring-primary/50 bg-primary/10 shadow-[var(--shadow-glow)]" : "border-border bg-card/60 hover:border-primary/50 hover:bg-card"}`}>
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {still ? (<img src={still} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500"/>) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
                      <div className="absolute bottom-2 left-3 font-display text-3xl tracking-wider drop-shadow">E{ep.episode_number}</div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="rounded-full bg-gradient-to-br from-primary to-accent p-3 shadow-[var(--shadow-glow)]">
                          <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground"/>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold line-clamp-1">{ep.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ep.overview}</p>
                    </div>
                  </button>);
        })}
            </div>
          </div>

          {m.recommendations?.results?.length > 0 && (<div className="mt-20">
              <MediaRow title="More Series" items={m.recommendations.results}/>
            </div>)}
        </div>
      </div>
    </div>);
}
