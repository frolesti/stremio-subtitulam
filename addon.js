const { addonBuilder } = require("stremio-addon-sdk");
const { getAllSubtitles } = require("./providers");

const manifest = {
    "id": "org.stremio.subtitulam",
    "version": "1.0.0",
    "name": "Subtitul'am",
    "description": "Subtítols en català per a pel·lícules i sèries.",
    "resources": [
        "subtitles"
    ],
    "types": [
        "movie",
        "series"
    ],
    "catalogs": []
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(async ({ type, id, extra }) => {
    console.log("request for subtitles: " + type + " " + id);
    
    try {
        const subtitles = await getAllSubtitles(type, id);
        return Promise.resolve({ subtitles: subtitles });
    } catch (error) {
        console.error("Error general cercant subtítols:", error);
        return Promise.resolve({ subtitles: [] });
    }
});

module.exports = builder.getInterface();
