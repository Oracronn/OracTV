import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard, type Media } from "./MediaCard";
export function MediaRow({ title, subtitle, items, type, }: {
    title: string;
    subtitle?: string;
    items: Media[];
    type?: "movie" | "tv";
}) {
    const ref = useRef<HTMLDivElement>(null);
    if (!items?.length)
        return null;
    const scroll = (dir: 1 | -1) => {
        if (!ref.current)
            return;
        ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.9, behavior: "smooth" });
    };
    return (<section className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm md:text-base font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="hidden sm:block text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <button onClick={() => scroll(-1)} className="rounded-full bg-secondary/60 hover:bg-secondary h-6 w-6 grid place-items-center transition" aria-label="Scroll left">
            <ChevronLeft className="h-3.5 w-3.5"/>
          </button>
          <button onClick={() => scroll(1)} className="rounded-full bg-secondary/60 hover:bg-secondary h-6 w-6 grid place-items-center transition" aria-label="Scroll right">
            <ChevronRight className="h-3.5 w-3.5"/>
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 snap-x scroll-smooth">
        {items.map((it) => (<div key={`${type ?? it.media_type}-${it.id}`} className="snap-start shrink-0 w-[78px] sm:w-[86px] md:w-[94px]">
            <MediaCard item={it} type={type}/>
          </div>))}
      </div>
    </section>);
}
