import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { getTrending } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";
const qo = (w: "day" | "week", t: "all" | "movie" | "tv") => queryOptions({
    queryKey: ["trending", t, w],
    queryFn: () => getTrending({ data: { window: w, type: t } }),
});
export const Route = createFileRoute("/trending")({
    head: () => ({
        meta: [
            { title: "Trending — OracTv" },
            { name: "description", content: "What everyone is watching right now on OracTv." },
            { property: "og:title", content: "Trending — OracTv" },
            { property: "og:description", content: "Daily and weekly trending films and series." },
        ],
    }),
    loader: ({ context }) => context.queryClient.ensureQueryData(qo("week", "all")),
    component: TrendingPage,
});
function TrendingPage() {
    const [tab, setTab] = useState<"all" | "movie" | "tv">("all");
    const [win, setWin] = useState<"day" | "week">("week");
    const { data } = useSuspenseQuery(qo(win, tab));
    const results = ((data as any).results ?? []).filter((r: any) => r.media_type !== "person");
    return (<div className="mx-auto max-w-[1800px] px-4 md:px-10 pt-24 pb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-primary">
                <Flame className="h-3.5 w-3.5"/> Right Now
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">Trending</h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
                    {(["all", "movie", "tv"] as const).map((t) => (<button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm rounded-full transition uppercase tracking-widest ${tab === t ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"}`}>
                            {t === "all" ? "All" : t === "movie" ? "Films" : "Series"}
                        </button>))}
                </div>
                <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
                    {(["day", "week"] as const).map((w) => (<button key={w} onClick={() => setWin(w)} className={`px-4 py-1.5 text-sm rounded-full transition uppercase tracking-widest ${win === w ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            {w === "day" ? "Today" : "This Week"}
                        </button>))}
                </div>
            </div>

            <div className="mt-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {results.map((r: any) => (<MediaCard key={`${r.media_type}-${r.id}`} item={r}/>))}
            </div>
        </div>);
}
