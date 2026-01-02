const OS = require('opensubtitles-api');
const OpenSubtitles = new OS({
    useragent: 'OSTestUserAgent', // Try the test user agent
    ssl: true
});

async function test() {
    try {
        console.log("Attempting to login anonymously...");
        const login = await OpenSubtitles.login();
        console.log("Login result:", login);

        console.log("Attempting to search for a movie (The Matrix)...");
        const search = await OpenSubtitles.search({
            sublanguageid: 'cat', // Catalan
            query: 'The Matrix'
        });
        
        console.log("Search result keys:", Object.keys(search));
        if (search.ca) {
            console.log("Found Catalan subtitles:", search.ca.length);
            console.log("First result:", search.ca[0]);
        } else {
            console.log("No Catalan subtitles found (or 'ca' key missing).");
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

test();
