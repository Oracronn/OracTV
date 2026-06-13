import { getVidRock } from './controllers/providers/VidRock/Vidrock.js';
import { getCinemaOS } from './controllers/providers/CinemaOS/CinemaOS.js';
import { getWyzie } from './controllers/subs/wyzie.js';
import { getLibre } from './controllers/subs/libresubs.js';
import { ErrorObject } from './helpers/ErrorObject.js';
import { getCacheKey, getFromCache, setToCache } from './cache/cache.js';

export async function scrapeMedia(media) {
    const cacheKey = getCacheKey(media);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) return cachedResult;

    // Only verified-working providers. VidRock first = default.
    const providers = [
        { getVidrock: () => getVidRock(media) },
        { getCinemaOS: () => getCinemaOS(media) },
        { getWyzie: () => getWyzie(media) },
        { getLibre: () => getLibre(media) }
    ];

    const results = await Promise.all(
        providers.map(async (provider) => {
            const providerName = Object.keys(provider)[0];
            try {
                const data = await Promise.race([
                    provider[providerName](),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), 15000)
                    )
                ]);
                return { data, provider: providerName };
            } catch (e) {
                return { data: null, provider: providerName };
            }
        })
    );

    const files = results
        .filter(({ data }) => data && !(data instanceof Error || data instanceof ErrorObject))
        .flatMap(({ data, provider }) => {
            const arr = Array.isArray(data.files) ? data.files : data.files ? [data.files] : [];
            return arr.map((f) => ({ ...f, provider }));
        })
        .filter(
            (file, index, self) =>
                file &&
                file.file &&
                typeof file.file === 'string' &&
                file.file.startsWith('http') &&
                // only playable types — drop "unknown" json resolution lists, etc.
                (file.type === 'hls' || file.type === 'mp4' || file.type === 'm3u8' || /\.m3u8(\?|$)/i.test(file.file) || /\.mp4(\?|$)/i.test(file.file)) &&
                self.findIndex((f) => f.file === file.file) === index
        );

    const subtitles = results
        .filter(({ data }) => data && !(data instanceof Error || data instanceof ErrorObject))
        .flatMap(({ data }) => data.subtitles || [])
        .filter(
            (sub, index, self) =>
                sub?.url && self.findIndex((s) => s.url === sub.url) === index
        );

    const finalResult = { files, subtitles };
    if (files.length > 0) setToCache(cacheKey, finalResult);
    return finalResult;
}

export default { scrapeMedia };
