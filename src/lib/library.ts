export type LibItem = {
    id: number;
    type: "movie" | "tv";
    title: string;
    poster?: string | null;
    added: number;
};
const KEY = "oracine_library_v1";
function read(): LibItem[] {
    if (typeof window === "undefined")
        return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    }
    catch {
        return [];
    }
}
function write(items: LibItem[]) {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("oracine:lib"));
}
export const Library = {
    list: read,
    has: (type: "movie" | "tv", id: number) => read().some((x) => x.type === type && x.id === id),
    toggle: (item: Omit<LibItem, "added">) => {
        const cur = read();
        const idx = cur.findIndex((x) => x.type === item.type && x.id === item.id);
        if (idx >= 0)
            cur.splice(idx, 1);
        else
            cur.unshift({ ...item, added: Date.now() });
        write(cur);
    },
    remove: (type: "movie" | "tv", id: number) => {
        write(read().filter((x) => !(x.type === type && x.id === id)));
    },
};
