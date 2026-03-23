const express = require('express');
const router = express.Router();
const { getArticles, getCategoryCounts } = require('../services/dbService');

// GET /api/articles — aggregated headlines
router.get('/', (req, res) => {
    try {
        const { category, limit = 50, offset = 0 } = req.query;
        const articles = getArticles({
            category,
            limit: Math.min(parseInt(limit, 10) || 50, 200),
            offset: parseInt(offset, 10) || 0
        });
        res.json({ articles, count: articles.length });
    } catch (err) {
        console.error('[API] Error fetching articles:', err);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// GET /api/articles/categories — category counts
router.get('/categories', (req, res) => {
    try {
        const categories = getCategoryCounts();
        res.json({ categories });
    } catch (err) {
        console.error('[API] Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router;
