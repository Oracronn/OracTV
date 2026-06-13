import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Menu, X } from "lucide-react";
const NAV = [
    { to: "/", label: "Home" },
    { to: "/trending", label: "New & Popular" },
    { to: "/movies", label: "Movies" },
    { to: "/tv", label: "TV Shows" },
    { to: "/anime", label: "Anime" },
    { to: "/downloads", label: "Downloads" },
    { to: "/library", label: "My List" },
    { to: "/docs", label: "API" },
];
export function Header() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (<header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-6 px-4 md:px-10">
        <Link to="/" className="shrink-0 flex items-baseline gap-1.5">
          <span className="brand-text text-xl md:text-2xl">OracTv</span>
          <span className="hidden md:inline text-[9px] uppercase tracking-[0.3em] text-muted-foreground">by Oracron</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-4 text-[13px]">
          {NAV.map((n) => (<Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="text-muted-foreground hover:text-foreground transition data-[status=active]:text-foreground data-[status=active]:font-semibold">
              {n.label}
            </Link>))}
        </nav>

        <div className="flex-1"/>

        <Link to="/search" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition" aria-label="Search">
          <Search className="h-5 w-5"/>
          <span className="hidden sm:inline text-[13px]">Search</span>
        </Link>

        <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-1.5 text-foreground" aria-label="Menu">
          {open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
        </button>
      </div>

      {open && (<div className="lg:hidden border-t border-border/40 bg-background/97 backdrop-blur-xl">
          <nav className="px-4 py-3 grid grid-cols-2 gap-1">
            {NAV.map((n) => (<Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                {n.label}
              </Link>))}
          </nav>
        </div>)}
    </header>);
}
