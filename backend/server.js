const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configurazione Dropbox
const DROPBOX_CONFIG = {
    clientId: 'x0wqoki16kjrof9',
    clientSecret: 'wgg0szbj31wghr1',
    refreshToken: 'h2RVRfOvP9EAAAAAAAAAAYsTtJeQK3khSamW0kDWaMd_Z8ptwLb7zewmqv-uOHKc'
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: '*/*', limit: '50mb' }));

// Variabili per gestire il token
let currentAccessToken = null;
let tokenExpiration = null;

// Funzione per ottenere/rinnovare il token
async function refreshAccessToken() {
    try {
        const authString = Buffer.from(`${DROPBOX_CONFIG.clientId}:${DROPBOX_CONFIG.clientSecret}`).toString('base64');
        
        const response = await axios.post(
            'https://api.dropbox.com/oauth2/token',
            `grant_type=refresh_token&refresh_token=${DROPBOX_CONFIG.refreshToken}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authString}`
                },
                timeout: 10000
            }
        );

        currentAccessToken = response.data.access_token;
        tokenExpiration = Date.now() + (response.data.expires_in - 300) * 1000;
        
        console.log('✅ Token rinnovato con successo');
        return currentAccessToken;

    } catch (error) {
        console.error('❌ ERRORE AGGIORNAMENTO TOKEN:', error.response?.data || error.message);
        throw new Error('Errore aggiornamento token');
    }
}

// Middleware di autenticazione
app.use(async (req, res, next) => {
    try {
        if (!currentAccessToken || Date.now() >= tokenExpiration) {
            await refreshAccessToken();
        }
        req.dropboxToken = currentAccessToken;
        next();
    } catch (error) {
        console.error('❌ MIDDLEWARE ERROR:', error.message);
        res.status(401).json({ error: 'Errore autenticazione' });
    }
});

// Endpoint di test
app.get('/', (req, res) => {
    res.send('🚀 Backend funzionante su Render');
});

// Endpoint per listare i file
app.post('/api/list-files', async (req, res) => {
    try {
        // Crea cartella se non esiste
        await axios.post(
            'https://api.dropboxapi.com/2/files/create_folder_v2',
            { path: '/app-x-galleria' },
            {
                headers: {
                    'Authorization': `Bearer ${req.dropboxToken}`,
                    'Content-Type': 'application/json'
                }
            }
        ).catch(() => {});

        const response = await axios.post(
            'https://api.dropboxapi.com/2/files/list_folder',
            { path: '/app-x-galleria', recursive: false },
            {
                headers: {
                    'Authorization': `Bearer ${req.dropboxToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        res.json(response.data.entries);
    } catch (error) {
        console.error('❌ ERRORE LISTA FILE:', error.message);
        res.status(500).json({ error: 'Errore lista file' });
    }
});

// Endpoint per caricare file
app.post('/api/upload', async (req, res) => {
    try {
        const { filename } = req.query;
        if (!filename) {
            return res.status(400).json({ error: 'Nome file mancante' });
        }

        const response = await axios.post(
            'https://content.dropboxapi.com/2/files/upload',
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${req.dropboxToken}`,
                    'Content-Type': 'application/octet-stream',
                    'Dropbox-API-Arg': JSON.stringify({
                        path: `/app-x-galleria/${filename}`,
                        mode: 'add',
                        autorename: true,
                        mute: false
                    })
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('❌ ERRORE UPLOAD:', error.message);
        res.status(500).json({ error: 'Errore upload file' });
    }
});

// Endpoint per thumbnail
app.get('/api/thumbnail', async (req, res) => {
    try {
        const { path } = req.query;
        if (!path) {
            return res.status(400).send('Percorso mancante');
        }

        const response = await axios.post(
            'https://content.dropboxapi.com/2/files/get_thumbnail_v2',
            null,
            {
                headers: {
                    'Authorization': `Bearer ${req.dropboxToken}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        resource: { '.tag': 'path', path: path },
                        format: 'jpeg',
                        size: 'w640h480',
                        mode: 'strict'
                    })
                },
                responseType: 'arraybuffer'
            }
        );

        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(response.data);
    } catch (error) {
        console.error('❌ ERRORE THUMBNAIL:', {
            path: req.query.path,
            error: error.message
        });
        
        const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
            <rect width="100%" height="100%" fill="#2a2a2a"/>
            <text x="50%" y="50%" fill="#fff" font-family="Arial" font-size="20" text-anchor="middle" dominant-baseline="middle">Anteprima non disponibile</text>
        </svg>`;
        res.set('Content-Type', 'image/svg+xml');
        res.send(placeholder);
    }
});

// Endpoint per download
app.get('/api/download', async (req, res) => {
    try {
        const { path } = req.query;
        if (!path) {
            return res.status(400).json({ error: 'Percorso mancante' });
        }

        const response = await axios.post(
            'https://content.dropboxapi.com/2/files/download',
            null,
            {
                headers: {
                    'Authorization': `Bearer ${req.dropboxToken}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        path: path
                    })
                },
                responseType: 'arraybuffer'
            }
        );

        const filename = path.split('/').pop();
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.send(response.data);
    } catch (error) {
        console.error('❌ ERRORE DOWNLOAD:', {
            path: req.query.path,
            error: error.message
        });
        res.status(500).json({ error: 'Errore download file' });
    }
});

// Avvio server
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
    console.log(`🚀 Server avviato su porta ${PORT}`);
    try {
        await refreshAccessToken();
        setInterval(refreshAccessToken, 3600000); // Rinnovo ogni ora
    } catch (error) {
        console.error('❌ AVVIO FALLITO:', error.message);
    }
});