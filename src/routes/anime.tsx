import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { MediaCard } from "@/components/MediaCard";
import { Sparkles } from "lucide-react";
const getAnime = createServerFn({ method: "GET" })
    .inputValidator((d: {
    type?: "tv" | "movie";
    sort?: string;
    page?: number;
}) => d ?? {})
    .handler(async ({ data }) => {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token)
        throw new Error("TMDB token missing");
    const type = data.type ?? "tv";
    const params = new URLSearchParams();
    params.set("sort_by", data.sort ?? "popularity.desc");
    params.set("with_genres", "16");
    params.set("with_original_language", "ja");
    params.set("page", String(data.page ?? 1));
    params.set("language", "en-US");
    const res = await fetch(`https://api.themoviedb.org/3/discover/${type}?${params}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok)
        throw new Error(`TMDB ${res.status}`);
    return res.json();
});
const animeQO = (type: "tv" | "movie", sort: string) => queryOptions({
    queryKey: ["anime", type, sort],
    queryFn: () => getAnime({ data: { type, sort } }),
});
export const Route = createFileRoute("/anime")({
    head: () => ({
        meta: [
            { title: "Anime — OracTv" },
            { name: "description", content: "Stream the biggest anime catalog. Series, films, classics, and new releases." },
            { property: "og:title", content: "Anime — OracTv" },
        ],
    }),
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(animeQO("tv", "popularity.desc"));
    },
    component: AnimePage,
});
const SORTS = [
    { label: "Popular", value: "popularity.desc" },
    { label: "Top Rated", value: "vote_average.desc" },
    { label: "Newest", value: "first_air_date.desc" },
];
function AnimePage() {
    const [type, setType] = useState<"tv" | "movie">("tv");
    const [sort, setSort] = useState("popularity.desc");
    useSuspenseQuery(animeQO("tv", "popularity.desc"));
    const { data, isFetching } = useQuery(animeQO(type, sort));
    const results = ((data as any)?.results ?? []) as any[];
    return (<div className="mx-auto max-w-[1800px] px-4 md:px-10 pt-24 pb-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-accent">
        <Sparkles className="h-3.5 w-3.5"/> Anime
      </span>
      <h1 className="text-2xl md:text-3xl font-black mt-3">Anime</h1>
      <p className="text-muted-foreground mt-2">From shōnen classics to seasonal hits.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
          {(["tv", "movie"] as const).map((t) => (<button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 text-sm rounded-full uppercase tracking-widest transition ${type === t ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "tv" ? "Series" : "Films"}
            </button>))}
        </div>
        <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
          {SORTS.map((s) => (<button key={s.value} onClick={() => setSort(s.value)} className={`px-4 py-1.5 text-sm rounded-full uppercase tracking-widest transition ${sort === s.value ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"}`}>
              {s.label}
            </button>))}
        </div>
      </div>

      {isFetching && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

      <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
        {results.map((m: any) => (<Link key={m.id} to={type === "tv" ? "/tv/$id" : "/movie/$id"} params={{ id: String(m.id) }}>
            <MediaCard item={{ ...m, media_type: type }}/>
          </Link>))}
      </div>
    </div>);
}
