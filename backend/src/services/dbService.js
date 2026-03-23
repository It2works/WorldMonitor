const { getDb } = require('../db');

// ─── Feeds ──────────────────────────────────────────
function getAllFeeds() {
    const db = getDb();
    return db.prepare(`
    SELECT f.*, 
      (SELECT COUNT(*) FROM articles WHERE feed_id = f.id) as article_count
    FROM feeds f WHERE f.active = 1
    ORDER BY f.category, f.name
  `).all();
}

function getFeedsByCategory(category) {
    const db = getDb();
    return db.prepare('SELECT * FROM feeds WHERE category = ? AND active = 1').all(category);
}

// ─── Articles ───────────────────────────────────────
function getArticles({ category, limit = 50, offset = 0 } = {}) {
    const db = getDb();
    if (category && category !== 'all') {
        return db.prepare(`
      SELECT a.*, f.name as source_name, f.category 
      FROM articles a 
      JOIN feeds f ON a.feed_id = f.id 
      WHERE f.category = ?
      ORDER BY a.published_at DESC 
      LIMIT ? OFFSET ?
    `).all(category, limit, offset);
    }
    return db.prepare(`
    SELECT a.*, f.name as source_name, f.category 
    FROM articles a 
    JOIN feeds f ON a.feed_id = f.id 
    ORDER BY a.published_at DESC 
    LIMIT ? OFFSET ?
  `).all(limit, offset);
}

function insertArticle(article) {
    const db = getDb();
    return db.prepare(`
    INSERT OR IGNORE INTO articles (feed_id, title, link, description, source_name, category, published_at, lat, lon, image_url)
    VALUES (@feed_id, @title, @link, @description, @source_name, @category, @published_at, @lat, @lon, @image_url)
  `).run(article);
}

function getArticleCount() {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
}

function getRecentHeadlines(limit = 30) {
    const db = getDb();
    return db.prepare(`
    SELECT a.title, a.description, f.name as source_name, f.category, a.published_at
    FROM articles a
    JOIN feeds f ON a.feed_id = f.id
    ORDER BY a.published_at DESC
    LIMIT ?
  `).all(limit);
}

function getCategoryCounts() {
    const db = getDb();
    return db.prepare(`
    SELECT f.category, COUNT(a.id) as count
    FROM articles a
    JOIN feeds f ON a.feed_id = f.id
    GROUP BY f.category
    ORDER BY count DESC
  `).all();
}

// ─── Map Events ─────────────────────────────────────
function getMapEvents({ type, limit = 100 } = {}) {
    const db = getDb();
    if (type) {
        return db.prepare('SELECT * FROM map_events WHERE event_type = ? ORDER BY created_at DESC LIMIT ?').all(type, limit);
    }
    return db.prepare('SELECT * FROM map_events ORDER BY created_at DESC LIMIT ?').all(limit);
}

function insertMapEvent(event) {
    const db = getDb();
    return db.prepare(`
    INSERT INTO map_events (title, description, lat, lon, event_type, severity, source, source_url)
    VALUES (@title, @description, @lat, @lon, @event_type, @severity, @source, @source_url)
  `).run(event);
}

// ─── Briefs ─────────────────────────────────────────
function getLatestBrief(type = 'world') {
    const db = getDb();
    return db.prepare('SELECT * FROM briefs WHERE brief_type = ? ORDER BY created_at DESC LIMIT 1').get(type);
}

function insertBrief(brief) {
    const db = getDb();
    return db.prepare(`
    INSERT INTO briefs (content, brief_type, model, headline_count)
    VALUES (@content, @brief_type, @model, @headline_count)
  `).run(brief);
}

// ─── Stats ──────────────────────────────────────────
function getStats() {
    const db = getDb();
    const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
    const feedCount = db.prepare('SELECT COUNT(*) as count FROM feeds WHERE active = 1').get().count;
    const eventCount = db.prepare('SELECT COUNT(*) as count FROM map_events').get().count;
    const latestBrief = getLatestBrief();
    return {
        articleCount,
        feedCount,
        eventCount,
        lastBriefAt: latestBrief?.created_at || null
    };
}

module.exports = {
    getAllFeeds,
    getFeedsByCategory,
    getArticles,
    insertArticle,
    getArticleCount,
    getRecentHeadlines,
    getCategoryCounts,
    getMapEvents,
    insertMapEvent,
    getLatestBrief,
    insertBrief,
    getStats
};
