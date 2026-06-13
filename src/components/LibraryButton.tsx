import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Library } from "@/lib/library";
export function LibraryButton({ type, id, title, poster, }: {
    type: "movie" | "tv";
    id: number;
    title: string;
    poster?: string | null;
}) {
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        const sync = () => setSaved(Library.has(type, id));
        sync();
        window.addEventListener("oracine:lib", sync);
        return () => window.removeEventListener("oracine:lib", sync);
    }, [type, id]);
    return (<button onClick={() => Library.toggle({ type, id, title, poster })} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold transition border ${saved
            ? "bg-primary/20 text-primary border-primary/40"
            : "bg-secondary/80 hover:bg-secondary border-border"}`}>
      {saved ? <BookmarkCheck className="h-5 w-5"/> : <Bookmark className="h-5 w-5"/>}
      {saved ? "In Library" : "Add to Library"}
    </button>);
}
