import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { getDiscover, getGenres } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";
const tvQO = (genre?: number, sort?: string) => queryOptions({
    queryKey: ["tv-page", genre ?? "all", sort ?? "popularity.desc"],
    queryFn: () => getDiscover({ data: { type: "tv", sort: sort ?? "popularity.desc", genre } }),
});
const genresQO = queryOptions({
    queryKey: ["genres", "tv"],
    queryFn: () => getGenres({ data: { type: "tv" } }),
});
export const Route = createFileRoute("/tv/")({
    head: () => ({
        meta: [
            { title: "Series — OracTv" },
            { name: "description", content: "Browse and stream all your favorite series." },
            { property: "og:title", content: "Series — OracTv" },
        ],
    }),
    loader: async ({ context }) => {
        await Promise.all([
            context.queryClient.ensureQueryData(tvQO()),
            context.queryClient.ensureQueryData(genresQO),
        ]);
    },
    component: TvPage,
});
const SORTS: {
    label: string;
    value: string;
}[] = [
    { label: "Popular", value: "popularity.desc" },
    { label: "Top Rated", value: "vote_average.desc" },
    { label: "Newest", value: "first_air_date.desc" },
];
function TvPage() {
    const [genre, setGenre] = useState<number | undefined>();
    const [sort, setSort] = useState("popularity.desc");
    const { data: genresData } = useSuspenseQuery(genresQO);
    const { data, isFetching } = useQuery(tvQO(genre, sort));
    const results = ((data as any)?.results ?? []) as any[];
    return (<div className="mx-auto max-w-[1800px] px-4 md:px-10 pt-24 pb-12">
      <h1 className="text-2xl md:text-3xl font-black">Series</h1>
      <p className="text-muted-foreground mt-2">Binge the catalog. Filter by genre, sort by hype.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
          {SORTS.map((s) => (<button key={s.value} onClick={() => setSort(s.value)} className={`px-4 py-1.5 text-sm rounded-full uppercase tracking-widest transition ${sort === s.value ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"}`}>
              {s.label}
            </button>))}
        </div>
        <select value={genre ?? ""} onChange={(e) => setGenre(e.target.value ? Number(e.target.value) : undefined)} className="rounded-full bg-secondary/60 border border-border px-4 py-1.5 text-sm outline-none focus:border-primary">
          <option value="">All genres</option>
          {((genresData as any)?.genres ?? []).map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
        </select>
      </div>

      <div className="mt-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
        {results.map((m) => (<MediaCard key={m.id} item={m} type="tv"/>))}
      </div>
      {isFetching && <p className="mt-10 text-center text-muted-foreground">Loading…</p>}
    </div>);
}
