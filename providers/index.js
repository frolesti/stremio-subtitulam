const { searchOpenSubtitles } = require('./opensubtitles');
const { searchYifySubtitles } = require('./yifysubtitles');

async function getAllSubtitles(type, id) {
    const results = [];
    
    // 1. YifySubtitles (Prioritari perquè és il·limitat)
    try {
        const yifyResults = await searchYifySubtitles(type, id);
        results.push(...yifyResults);
    } catch (e) {
        console.error("Error a YifySubtitles:", e);
    }

    // 2. OpenSubtitles (Backup)
    try {
        const osResults = await searchOpenSubtitles(type, id);
        results.push(...osResults);
    } catch (e) {
        console.error("Error a OpenSubtitles:", e);
    }

    return results;
}

module.exports = { getAllSubtitles };
