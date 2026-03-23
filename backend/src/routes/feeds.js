const express = require('express');
const router = express.Router();
const { getAllFeeds, getFeedsByCategory } = require('../services/dbService');

// GET /api/feeds — list all active feeds with article counts
router.get('/', (req, res) => {
    try {
        const { category } = req.query;
        const feeds = category ? getFeedsByCategory(category) : getAllFeeds();
        res.json({ feeds, count: feeds.length });
    } catch (err) {
        console.error('[API] Error fetching feeds:', err);
        res.status(500).json({ error: 'Failed to fetch feeds' });
    }
});

module.exports = router;
