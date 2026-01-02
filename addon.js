const { addonBuilder } = require("stremio-addon-sdk");

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
    // Aquí implementarem la lògica de cerca de subtítols
    // id sol ser l'IMDb ID (tt1234567) o altres formats
    
    return Promise.resolve({ subtitles: [] });
});

module.exports = builder.getInterface();
