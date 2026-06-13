const IMG = "https://image.tmdb.org/t/p";
export function img(path?: string | null, size: "w200" | "w300" | "w500" | "w780" | "w1280" | "original" = "w500") {
    if (!path)
        return null;
    return `${IMG}/${size}${path}`;
}
