const RssParser = require('rss-parser');
const { getDb } = require('../db');
const { insertArticle } = require('./dbService');

const parser = new RssParser({
    timeout: 10000,
    headers: {
        'User-Agent': 'WorldMonitor/1.0 (Intelligence Dashboard)',
    },
});

// Approximate country → lat/lon mapping for geo-tagging articles
const COUNTRY_COORDS = {
    US: { lat: 39.8283, lon: -98.5795 },
    UK: { lat: 55.3781, lon: -3.4360 },
    QA: { lat: 25.3548, lon: 51.1839 },
    DE: { lat: 51.1657, lon: 10.4515 },
    FR: { lat: 46.6034, lon: 1.8883 },
    JP: { lat: 36.2048, lon: 138.2529 },
    CN: { lat: 35.8617, lon: 104.1954 },
    IN: { lat: 20.5937, lon: 78.9629 },
    RU: { lat: 61.5240, lon: 105.3188 },
    BR: { lat: -14.2350, lon: -51.9253 },
    AU: { lat: -25.2744, lon: 133.7751 },
    KE: { lat: -0.0236, lon: 37.9062 },
};

function addJitter(val, range = 3) {
    return val + (Math.random() - 0.5) * range;
}

async function fetchFeed(feed) {
    try {
        const result = await parser.parseURL(feed.url);
        const coords = COUNTRY_COORDS[feed.country] || { lat: 0, lon: 0 };
        let inserted = 0;

        for (const item of (result.items || []).slice(0, 20)) {
            const article = {
                feed_id: feed.id,
                title: (item.title || '').trim().substring(0, 500),
                link: (item.link || '').trim(),
                description: (item.contentSnippet || item.content || '').trim().substring(0, 1000),
                source_name: feed.name,
                category: feed.category,
                published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                lat: addJitter(coords.lat),
                lon: addJitter(coords.lon),
                image_url: item.enclosure?.url || null,
            };

            if (!article.title || !article.link) continue;

            try {
                const result = insertArticle(article);
                if (result.changes > 0) inserted++;
            } catch (e) {
                // Duplicate link — skip
            }
        }

        // Update last_fetched_at
        const db = getDb();
        db.prepare('UPDATE feeds SET last_fetched_at = datetime("now") WHERE id = ?').run(feed.id);

        return { feed: feed.name, inserted, total: (result.items || []).length };
    } catch (err) {
        console.error(`[RSS] Failed to fetch ${feed.name}: ${err.message}`);
        return { feed: feed.name, inserted: 0, error: err.message };
    }
}

async function fetchAllFeeds() {
    const db = getDb();
    const feeds = db.prepare('SELECT * FROM feeds WHERE active = 1').all();
    console.log(`[RSS] Fetching ${feeds.length} feeds...`);

    const results = [];
    for (const feed of feeds) {
        const result = await fetchFeed(feed);
        results.push(result);
        // Small delay between requests to be polite
        await new Promise(r => setTimeout(r, 500));
    }

    const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
    console.log(`[RSS] Done. Inserted ${totalInserted} new articles`);
    return results;
}

module.exports = { fetchAllFeeds, fetchFeed };
