import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
function NotFoundComponent() {
    return (<div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-[8rem] leading-none font-black text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-bold">Lost your way?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Sorry, we can't find that page. You'll find lots to explore on the home page.
        </p>
        <Link to="/" className="mt-8 inline-flex items-center justify-center rounded bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-white/85 transition">
          OracTv Home
        </Link>
      </div>
    </div>);
}
function ErrorComponent({ error, reset }: {
    error: Error;
    reset: () => void;
}) {
    const router = useRouter();
    useEffect(() => {
        console.error(error);
    }, [error]);
    return (<div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl tracking-wider">SIGNAL LOST</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          Reconnect
        </button>
      </div>
    </div>);
}
export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "OracTv — Watch Movies & TV Shows" },
            { name: "description", content: "OracTv by Oracron. Unlimited movies, TV shows and anime. Stream instantly in HD." },
            { name: "theme-color", content: "#141414" },
            { property: "og:title", content: "OracTv — Watch Movies & TV Shows" },
            { property: "og:description", content: "Unlimited movies, TV shows and anime. Stream instantly in HD with built-in downloads." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "preconnect", href: "https://image.tmdb.org" },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap" },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});
function RootShell({ children }: {
    children: ReactNode;
}) {
    return (<html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>);
}
function RootComponent() {
    const { queryClient } = Route.useRouteContext();
    return (<QueryClientProvider client={queryClient}>
      <Header />
      <main className="relative z-10 min-h-screen">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-border/40 mt-20 py-10">
        <div className="mx-auto max-w-[1800px] px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="brand-text text-xl">OracTv</p>
            <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">by Oracron · Built by Jaden</p>
          </div>
          <nav className="flex gap-5 text-xs text-muted-foreground">
            <Link to="/movies" className="hover:text-foreground">Movies</Link>
            <Link to="/tv" className="hover:text-foreground">TV Shows</Link>
            <Link to="/anime" className="hover:text-foreground">Anime</Link>
            <Link to="/downloads" className="hover:text-foreground">Downloads</Link>
            <Link to="/docs" className="hover:text-foreground">API</Link>
          </nav>
        </div>
      </footer>
    </QueryClientProvider>);
}
