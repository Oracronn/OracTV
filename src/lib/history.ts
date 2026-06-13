export type HistoryItem = {
    id: number;
    type: "movie" | "tv";
    title: string;
    poster?: string | null;
    backdrop?: string | null;
    season?: number;
    episode?: number;
    progress?: number;
    updated: number;
};
const KEY = "oracine_history_v1";
const MAX = 30;
function read(): HistoryItem[] {
    if (typeof window === "undefined")
        return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    }
    catch {
        return [];
    }
}
function write(items: HistoryItem[]) {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
    window.dispatchEvent(new Event("oracine:hist"));
}
export const History = {
    list: read,
    upsert: (item: Omit<HistoryItem, "updated">) => {
        const cur = read().filter((x) => !(x.type === item.type && x.id === item.id));
        cur.unshift({ ...item, updated: Date.now() });
        write(cur);
    },
    clear: () => write([]),
};
