// Workers-compatible in-memory cache (replaces node-cache).
// Per-isolate, ephemeral, 3h TTL.
const TTL_MS = 3 * 60 * 60 * 1000;
const store = new Map();

export function getCacheKey(media) {
    if (media.type === 'tv') {
        return `${media.type}_${media.tmdb}_${media.season}_${media.episode}`;
    }
    return `${media.type}_${media.tmdb}`;
}

export function getFromCache(key) {
    const v = store.get(key);
    if (!v) return undefined;
    if (Date.now() > v.exp) {
        store.delete(key);
        return undefined;
    }
    return v.data;
}

export function setToCache(key, data) {
    store.set(key, { data, exp: Date.now() + TTL_MS });
    return true;
}

export function getCacheStats() {
    return { keys: store.size };
}
