const express = require('express');
const router = express.Router();
const { getMapEvents } = require('../services/dbService');

// GET /api/map/events — geo-located events
router.get('/events', (req, res) => {
    try {
        const { type, limit = 100 } = req.query;
        const events = getMapEvents({
            type,
            limit: Math.min(parseInt(limit, 10) || 100, 500)
        });

        // Also extract articles with geo-data as additional markers
        const { getArticles } = require('../services/dbService');
        const recentArticles = getArticles({ limit: 50 });
        const geoArticles = recentArticles
            .filter(a => a.lat && a.lon && a.lat !== 0 && a.lon !== 0)
            .map(a => ({
                id: `article-${a.id}`,
                title: a.title,
                description: a.description,
                lat: a.lat,
                lon: a.lon,
                event_type: a.category || 'news',
                severity: 'low',
                source: a.source_name,
                source_url: a.link,
                created_at: a.published_at
            }));

        res.json({
            events: [...events, ...geoArticles],
            count: events.length + geoArticles.length
        });
    } catch (err) {
        console.error('[API] Error fetching map events:', err);
        res.status(500).json({ error: 'Failed to fetch map events' });
    }
});

module.exports = router;
