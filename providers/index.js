const { searchOpenSubtitles } = require('./opensubtitles');

async function getAllSubtitles(type, id) {
    const results = [];
    
    // 1. OpenSubtitles
    try {
        const osResults = await searchOpenSubtitles(type, id);
        results.push(...osResults);
    } catch (e) {
        console.error("Error a OpenSubtitles:", e);
    }

    // 2. Futurs proveïdors (Mecanoscrit, etc.)
    // ...

    return results;
}

module.exports = { getAllSubtitles };
