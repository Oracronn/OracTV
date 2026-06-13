declare module '@/server/backend/api.js' {
    export function scrapeMedia(media: any): Promise<{ files: any[]; subtitles: any[] }>;
}
declare module '@/server/backend/helpers/tmdb.js' {
    export function getMovieFromTmdb(id: string | number): Promise<any>;
    export function getTvFromTmdb(id: string | number, season: number, episode: number): Promise<any>;
}
declare module '@/server/backend/*';
