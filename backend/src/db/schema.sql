-- World Monitor Database Schema

CREATE TABLE IF NOT EXISTS feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'world',
    country TEXT,
    language TEXT DEFAULT 'en',
    active INTEGER DEFAULT 1,
    last_fetched_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    link TEXT UNIQUE,
    description TEXT,
    source_name TEXT,
    category TEXT,
    published_at TEXT,
    lat REAL,
    lon REAL,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (feed_id) REFERENCES feeds(id)
);

CREATE TABLE IF NOT EXISTS briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    brief_type TEXT DEFAULT 'world',
    model TEXT,
    headline_count INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS map_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    event_type TEXT DEFAULT 'news',
    severity TEXT DEFAULT 'low',
    source TEXT,
    source_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_feed ON articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_map_events_type ON map_events(event_type);
CREATE INDEX IF NOT EXISTS idx_briefs_type ON briefs(brief_type);
CREATE INDEX IF NOT EXISTS idx_feeds_category ON feeds(category);
