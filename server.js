const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("./addon");
const { getDownloadLink } = require("./providers/opensubtitles");
const express = require('express');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const app = express();

// Servim el logo estàticament
app.get('/logo.svg', (req, res) => {
    res.sendFile(path.join(__dirname, 'logo.svg'));
});

// Ruta de descàrrega per a YifySubtitles (ZIP -> SRT)
app.get('/download/yify/:base64Url', async (req, res) => {
    try {
        const { base64Url } = req.params;
        const zipUrl = Buffer.from(base64Url, 'base64').toString('utf-8');
        
        console.log(`[Server] Descarregant i extraient ZIP de: ${zipUrl}`);

        const response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
        const zip = new AdmZip(response.data);
        const zipEntries = zip.getEntries();

        // Busquem el primer fitxer .srt
        const srtEntry = zipEntries.find(entry => entry.entryName.endsWith('.srt'));

        if (srtEntry) {
            const srtContent = zip.readAsText(srtEntry);
            
            // Servim el fitxer com a SRT
            res.setHeader('Content-Type', 'application/x-subrip');
            res.setHeader('Content-Disposition', `attachment; filename="${srtEntry.entryName}"`);
            res.send(srtContent);
        } else {
            res.status(404).send('No s\'ha trobat cap fitxer .srt dins del ZIP.');
        }

    } catch (error) {
        console.error("[Server] Error processant Yify ZIP:", error.message);
        res.status(500).send('Error processant el subtítol.');
    }
});

// Ruta de descàrrega per a OpenSubtitles
app.get('/download/opensubtitles/:fileId', async (req, res) => {
    const { fileId } = req.params;
    console.log(`[Server] Sol·licitud de descàrrega per al fitxer ${fileId}`);
    
    const link = await getDownloadLink(fileId);
    
    if (link) {
        res.redirect(link);
    } else {
        res.status(404).send('Subtítol no trobat o error en obtenir l\'enllaç.');
    }
});

// Servim l'addon utilitzant el middleware de l'SDK
const addonMiddleware = getRouter(addonInterface);
app.use('/', addonMiddleware);

// Pàgina d'inici personalitzada
app.get('/', (req, res) => {
    const host = req.headers.host;
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const manifestUrl = `${protocol}://${host}/manifest.json`;
    const stremioUrl = `stremio://${host}/manifest.json`;
    
    res.send(`
        <!DOCTYPE html>
        <html lang="ca">
        <head>
            <meta charset="UTF-8">
            <title>Stremio Subtitula'm</title>
            <link rel="icon" href="/logo.svg" type="image/svg+xml">
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background: #111;
                    color: #fff; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    margin: 0; 
                }
                h1 { color: #fff; margin-bottom: 10px; }
                .logo { width: 120px; margin-bottom: 20px; }
                .btn { background: #8a5aab; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; display: inline-block; transition: background 0.3s; }
                .btn:hover { background: #9b6bc0; }
                code { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; display: block; margin-top: 10px; word-break: break-all; }
                .description { max-width: 600px; text-align: center; line-height: 1.6; margin-bottom: 20px; color: #ddd; }
            </style>
        </head>
        <body>
            <img src="/logo.svg" alt="Logo" class="logo">
            <h1>Stremio Subtitula'm</h1>
            <div class="description">
                <p>Aquest addon cerca subtítols en català per a pel·lícules i sèries.</p>
            </div>
            
            <a href="${stremioUrl}" class="btn">Instal·lar a Stremio</a>
            
            <p style="margin-top: 30px; font-size: 0.9em; color: #aaa;">
                Si el botó no funciona, copia aquest enllaç a la barra de cerca de Stremio:<br>
                <code>${manifestUrl}</code>
            </p>
        </body>
        </html>
    `);
});

const port = process.env.PORT || 7000;

module.exports = app;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Addon actiu a http://127.0.0.1:${port}/`);
    });
}
