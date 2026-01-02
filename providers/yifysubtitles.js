const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://yifysubtitles.ch';

async function searchYifySubtitles(type, id) {
    if (type !== 'movie') return []; // Yify is mostly for movies

    try {
        console.log(`[Yify] Cercant subtítols per ${id}...`);
        // Yify permet cercar directament per IMDb ID
        const url = `${BASE_URL}/movie-imdb/${id}`;
        
        const response = await axios.get(url, {
            validateStatus: status => status < 500 // Acceptem 404 per si no existeix
        });

        if (response.status === 404) {
            console.log("[Yify] Pel·lícula no trobada.");
            return [];
        }

        const $ = cheerio.load(response.data);
        const subtitles = [];

        // Iterem per la taula de subtítols
        $('.table-responsive tbody tr').each((i, element) => {
            const rating = $(element).find('.rating-cell').text().trim();
            const language = $(element).find('.flag-cell .sub-lang').text().trim();
            const downloadUrl = $(element).find('.download-cell a').attr('href');
            const releaseName = $(element).find('td').eq(2).text().trim().replace('subtitle ', '');

            // Filtrem per Català
            if (language.toLowerCase() === 'catalan' || language.toLowerCase() === 'catala') {
                // Construïm l'enllaç complet
                const fullDownloadUrl = downloadUrl.startsWith('http') ? downloadUrl : `${BASE_URL}${downloadUrl}`;
                
                // Generem un ID únic basat en la URL (base64 per seguretat a la URL)
                const uniqueId = Buffer.from(fullDownloadUrl).toString('base64');

                // URL Base de l'addon
                const ADDON_URL = process.env.ADDON_URL || 'http://127.0.0.1:7000';

                subtitles.push({
                    id: uniqueId,
                    url: `${ADDON_URL}/download/yify/${uniqueId}`,
                    lang: 'cat',
                    label: `YifySubtitles - ${releaseName} (Rating: ${rating})`
                });
            }
        });

        return subtitles;

    } catch (error) {
        console.error("[Yify] Error:", error.message);
        return [];
    }
}

module.exports = { searchYifySubtitles };
