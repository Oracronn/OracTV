import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getTrending, getDiscover } from "@/lib/tmdb.functions";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
const trendingQO = queryOptions({
    queryKey: ["trending", "all", "week"],
    queryFn: () => getTrending({ data: { window: "week", type: "all" } }),
});
const trendingDayQO = queryOptions({
    queryKey: ["trending", "all", "day"],
    queryFn: () => getTrending({ data: { window: "day", type: "all" } }),
});
const popMoviesQO = queryOptions({
    queryKey: ["discover", "movie", "pop"],
    queryFn: () => getDiscover({ data: { type: "movie", sort: "popularity.desc" } }),
});
const topMoviesQO = queryOptions({
    queryKey: ["discover", "movie", "top"],
    queryFn: () => getDiscover({ data: { type: "movie", sort: "vote_average.desc" } }),
});
const popTvQO = queryOptions({
    queryKey: ["discover", "tv", "pop"],
    queryFn: () => getDiscover({ data: { type: "tv", sort: "popularity.desc" } }),
});
const topTvQO = queryOptions({
    queryKey: ["discover", "tv", "top"],
    queryFn: () => getDiscover({ data: { type: "tv", sort: "vote_average.desc" } }),
});
export const Route = createFileRoute("/")({
    loader: async ({ context }) => {
        await Promise.all([
            context.queryClient.ensureQueryData(trendingQO),
            context.queryClient.ensureQueryData(trendingDayQO),
            context.queryClient.ensureQueryData(popMoviesQO),
            context.queryClient.ensureQueryData(topMoviesQO),
            context.queryClient.ensureQueryData(popTvQO),
            context.queryClient.ensureQueryData(topTvQO),
        ]);
    },
    component: Home,
});
function Home() {
    const { data: trending } = useSuspenseQuery(trendingQO);
    const { data: trendingDay } = useSuspenseQuery(trendingDayQO);
    const { data: popM } = useSuspenseQuery(popMoviesQO);
    const { data: topM } = useSuspenseQuery(topMoviesQO);
    const { data: popT } = useSuspenseQuery(popTvQO);
    const { data: topT } = useSuspenseQuery(topTvQO);
    return (<div className="pb-24">
      <Hero items={(trending as any).results ?? []}/>
      <div className="mx-auto max-w-[1800px] px-4 md:px-10 -mt-10 relative z-10 space-y-8">
        <ContinueWatchingRow />
        <MediaRow title="Trending This Week" subtitle="What everyone is watching" items={(trending as any).results ?? []}/>
        <MediaRow title="Trending Today" subtitle="Hot in the last 24h" items={(trendingDay as any).results ?? []}/>
        <MediaRow title="Popular Films" items={(popM as any).results ?? []} type="movie"/>
        <MediaRow title="Top Rated Films" subtitle="The classics" items={(topM as any).results ?? []} type="movie"/>
        <MediaRow title="Popular Series" items={(popT as any).results ?? []} type="tv"/>
        <MediaRow title="Top Rated Series" subtitle="Must-watch" items={(topT as any).results ?? []} type="tv"/>
      </div>
    </div>);
}
