const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { getDb, closeDb } = require('./db');
const { fetchAllFeeds } = require('./services/rssService');
const { getStats } = require('./services/dbService');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────
app.use('/api/feeds', require('./routes/feeds'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/map', require('./routes/mapEvents'));
app.use('/api/brief', require('./routes/brief'));

// Health / stats endpoint
app.get('/api/health', (req, res) => {
    const stats = getStats();
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        ...stats
    });
});

// ─── Initialization ─────────────────────────────────
async function init() {
    // Initialize database
    getDb();
    console.log('[Server] Database initialized');

    // Run seed if tables are empty
    const stats = getStats();
    if (stats.feedCount === 0) {
        console.log('[Server] Running seed...');
        require('./db/seed');
    }

    // Initial RSS fetch
    console.log('[Server] Starting initial RSS fetch...');
    fetchAllFeeds().catch(err => {
        console.error('[Server] Initial RSS fetch error:', err.message);
    });

    // Schedule RSS fetching every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('[Cron] Fetching RSS feeds...');
        fetchAllFeeds().catch(err => {
            console.error('[Cron] RSS fetch error:', err.message);
        });
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`\n╔══════════════════════════════════════════╗`);
        console.log(`║     🌍 WORLD MONITOR — API Server        ║`);
        console.log(`╠══════════════════════════════════════════╣`);
        console.log(`║  Port:    ${PORT}                            ║`);
        console.log(`║  Health:  http://localhost:${PORT}/api/health  ║`);
        console.log(`║  Feeds:   http://localhost:${PORT}/api/feeds   ║`);
        console.log(`║  News:    http://localhost:${PORT}/api/articles ║`);
        console.log(`║  Map:     http://localhost:${PORT}/api/map/events ║`);
        console.log(`║  Brief:   http://localhost:${PORT}/api/brief/latest ║`);
        console.log(`╚══════════════════════════════════════════╝\n`);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('[Server] Shutting down...');
    closeDb();
    process.exit(0);
});

init();
