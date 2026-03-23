const express = require('express');
const router = express.Router();
const { generateBrief, checkOllamaStatus } = require('../services/ollamaService');
const { getLatestBrief } = require('../services/dbService');

// POST /api/brief — generate new AI brief
router.post('/', async (req, res) => {
    try {
        const { type = 'world' } = req.body || {};
        console.log(`[Brief] Generating ${type} brief...`);
        const brief = await generateBrief(type);
        res.json({ brief });
    } catch (err) {
        console.error('[API] Error generating brief:', err);
        res.status(500).json({ error: 'Failed to generate brief' });
    }
});

// GET /api/brief/latest — get most recent cached brief
router.get('/latest', (req, res) => {
    try {
        const { type = 'world' } = req.query;
        const brief = getLatestBrief(type);
        if (brief) {
            res.json({ brief });
        } else {
            res.json({ brief: null, message: 'No brief generated yet. Use POST /api/brief to generate one.' });
        }
    } catch (err) {
        console.error('[API] Error fetching brief:', err);
        res.status(500).json({ error: 'Failed to fetch brief' });
    }
});

// GET /api/brief/status — check Ollama status
router.get('/status', async (req, res) => {
    try {
        const status = await checkOllamaStatus();
        res.json(status);
    } catch (err) {
        res.json({ online: false, models: [] });
    }
});

module.exports = router;
