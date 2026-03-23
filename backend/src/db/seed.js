const { getDb } = require('./index');
const feeds = require('../data/feeds.json');

function seed() {
    const db = getDb();

    const insert = db.prepare(`
    INSERT OR IGNORE INTO feeds (name, url, category, country, language)
    VALUES (@name, @url, @category, @country, @language)
  `);

    const insertMany = db.transaction((items) => {
        for (const item of items) {
            insert.run(item);
        }
    });

    insertMany(feeds);
    console.log(`[Seed] Inserted ${feeds.length} feeds`);

    // Seed some initial map events for demo
    const mapEvents = [
        { title: 'UN Security Council Session', description: 'Emergency session on regional conflict', lat: 40.749, lon: -73.968, event_type: 'political', severity: 'high', source: 'UN News' },
        { title: 'Earthquake Alert — Pacific Ring', description: 'Seismic activity detected in the Pacific Ring of Fire', lat: 35.6762, lon: 139.6503, event_type: 'disaster', severity: 'critical', source: 'USGS' },
        { title: 'EU Summit — Brussels', description: 'European leaders discuss energy policy', lat: 50.8503, lon: 4.3517, event_type: 'political', severity: 'medium', source: 'Reuters' },
        { title: 'Tech Conference — Silicon Valley', description: 'Major AI announcements expected', lat: 37.3861, lon: -122.0839, event_type: 'tech', severity: 'low', source: 'TechCrunch' },
        { title: 'Oil Pipeline Disruption', description: 'Supply concerns in the Middle East region', lat: 26.0667, lon: 50.5577, event_type: 'economic', severity: 'high', source: 'Bloomberg' },
        { title: 'Military Exercise — South China Sea', description: 'Naval exercises reported in disputed waters', lat: 14.5995, lon: 120.9842, event_type: 'military', severity: 'high', source: 'Defense One' },
        { title: 'Climate Summit — Nairobi', description: 'African nations discuss climate adaptation', lat: -1.2921, lon: 36.8219, event_type: 'environment', severity: 'medium', source: 'UN News' },
        { title: 'Space Launch — Cape Canaveral', description: 'New satellite deployment mission', lat: 28.3922, lon: -80.6077, event_type: 'science', severity: 'low', source: 'NASA' },
        { title: 'Financial Markets Volatility', description: 'Major indexes show significant movement', lat: 51.5074, lon: -0.1278, event_type: 'economic', severity: 'medium', source: 'Financial Times' },
        { title: 'Humanitarian Crisis — Horn of Africa', description: 'Aid agencies report worsening conditions', lat: 8.0, lon: 46.0, event_type: 'humanitarian', severity: 'critical', source: 'Al Jazeera' },
        { title: 'Cyberattack on Infrastructure', description: 'Critical systems targeted in Eastern Europe', lat: 50.4501, lon: 30.5234, event_type: 'cyber', severity: 'critical', source: 'Ars Technica' },
        { title: 'Trade Negotiations — Singapore', description: 'ASEAN trade deal discussions', lat: 1.3521, lon: 103.8198, event_type: 'economic', severity: 'medium', source: 'CNBC' }
    ];

    const insertEvent = db.prepare(`
    INSERT OR IGNORE INTO map_events (title, description, lat, lon, event_type, severity, source)
    VALUES (@title, @description, @lat, @lon, @event_type, @severity, @source)
  `);

    const insertEvents = db.transaction((events) => {
        for (const event of events) {
            insertEvent.run(event);
        }
    });

    insertEvents(mapEvents);
    console.log(`[Seed] Inserted ${mapEvents.length} map events`);
}

seed();
console.log('[Seed] Done');
