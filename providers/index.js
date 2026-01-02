const { searchOpenSubtitles } = require('./opensubtitles');
const { searchYifySubtitles } = require('./yifysubtitles');
const { searchPodnapisi } = require('./podnapisi');

async function getAllSubtitles(type, id) {
    const results = [];
    
    // 1. YifySubtitles (Prioritari per pel·lícules)
    try {
        const yifyResults = await searchYifySubtitles(type, id);
        results.push(...yifyResults);
    } catch (e) {
        console.error("Error a YifySubtitles:", e);
    }

    // 2. Podnapisi (Prioritari per sèries i pel·lícules)
    try {
        const podnapisiResults = await searchPodnapisi(type, id);
        results.push(...podnapisiResults);
    } catch (e) {
        console.error("Error a Podnapisi:", e);
    }

    // 3. OpenSubtitles (Backup amb límit)
    try {
        const osResults = await searchOpenSubtitles(type, id);
        results.push(...osResults);
    } catch (e) {
        console.error("Error a OpenSubtitles:", e);
    }

    return results;
}

module.exports = { getAllSubtitles };
