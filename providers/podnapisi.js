const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.podnapisi.net';

async function searchPodnapisi(type, id) {
    try {
        console.log(`[Podnapisi] Cercant subtítols per ${id}...`);
        
        // Construïm la URL de cerca
        // sI: IMDb ID
        // sL: ca (Català)
        const searchUrl = `${BASE_URL}/subtitles/search/?sI=${id}&sL=ca`;
        
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);
        const subtitles = [];

        // Iterem per les files de resultats
        // Podnapisi fa servir una taula amb classes com 'table table-hover'
        $('.table tbody tr').each((i, element) => {
            // Busquem l'enllaç de descàrrega directe
            const downloadLink = $(element).find('a.button-download').attr('href');
            
            if (downloadLink) {
                const releaseName = $(element).find('a[href^="/subtitles/"]').first().text().trim();
                const fullDownloadUrl = `${BASE_URL}${downloadLink}`;
                
                // Generem un ID únic basat en la URL (base64)
                const uniqueId = Buffer.from(fullDownloadUrl).toString('base64');

                // URL Base de l'addon
                const ADDON_URL = process.env.ADDON_URL || 'http://127.0.0.1:7000';

                // Reutilitzem la ruta /download/yify/ perquè la lògica és idèntica (ZIP -> SRT)
                // Podríem canviar-li el nom a /download/zip/ per ser més genèrics, però de moment funciona igual.
                subtitles.push({
                    id: uniqueId,
                    url: `${ADDON_URL}/download/yify/${uniqueId}`, 
                    lang: 'cat',
                    label: `Podnapisi - ${releaseName}`
                });
            }
        });

        return subtitles;

    } catch (error) {
        console.error("[Podnapisi] Error:", error.message);
        return [];
    }
}

module.exports = { searchPodnapisi };
