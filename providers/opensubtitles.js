const OpenSubtitles = require('opensubtitles.com');

// TODO: Necessitem una API Key d'OpenSubtitles.com
// Pots aconseguir-ne una a https://www.opensubtitles.com/en/consumers
const API_KEY = process.env.OPENSUBTITLES_API_KEY || 'YOUR_API_KEY_HERE';

const os = new OpenSubtitles({
    apikey: API_KEY,
    useragent: 'StremioSubtitulam v1.0' // UserAgent obligatori
});

async function searchOpenSubtitles(type, id) {
    try {
        console.log(`[OpenSubtitles] Cercant subtítols per ${type} ${id}...`);
        
        // L'ID de Stremio sol ser "tt1234567" (IMDb)
        // OpenSubtitles espera imdb_id sense "tt" normalment, o gestiona tots dos.
        
        const searchParams = {
            languages: 'ca', // Codi ISO per Català
        };

        if (id.startsWith('tt')) {
            searchParams.imdb_id = id.replace('tt', '');
        } else {
            // Si no és IMDb, potser és TMDB, però Stremio sol enviar IMDb per defecte
            // Per ara assumim IMDb
            console.log("[OpenSubtitles] ID no reconegut com IMDb, saltant...");
            return [];
        }

        const results = await os.search(searchParams);
        
        if (!results || !results.data) return [];

        // URL Base de l'addon (per defecte local, però a producció serà la de Vercel)
        const ADDON_URL = process.env.ADDON_URL || 'http://127.0.0.1:7000';

        return results.data.map(sub => ({
            id: sub.id, // ID del subtítol
            url: `${ADDON_URL}/download/opensubtitles/${sub.attributes.files[0].file_id}`,
            lang: 'cat',
            label: `OpenSubtitles - ${sub.attributes.release} (${sub.attributes.upload_date.split('T')[0]})`
        }));

    } catch (error) {
        console.error("[OpenSubtitles] Error:", error.message);
        return [];
    }
}

async function getDownloadLink(fileId) {
    try {
        // Necessitem fer login per descarregar? Normalment amb l'API Key n'hi ha prou per obtenir el link temporal
        const download = await os.download({ file_id: fileId });
        return download.link;
    } catch (error) {
        console.error("[OpenSubtitles] Error obtenint link de descàrrega:", error.message);
        return null;
    }
}

module.exports = { searchOpenSubtitles, getDownloadLink };
