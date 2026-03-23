const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchArticles(category = 'all', limit = 50) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    params.set('limit', String(limit));

    const res = await fetch(`${API_URL}/api/articles?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
}

export async function fetchFeeds() {
    const res = await fetch(`${API_URL}/api/feeds`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch feeds');
    return res.json();
}

export async function fetchMapEvents(type) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);

    const res = await fetch(`${API_URL}/api/map/events?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch map events');
    return res.json();
}

export async function fetchLatestBrief(type = 'world') {
    const res = await fetch(`${API_URL}/api/brief/latest?type=${type}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch brief');
    return res.json();
}

export async function generateBrief(type = 'world') {
    const res = await fetch(`${API_URL}/api/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error('Failed to generate brief');
    return res.json();
}

export async function fetchHealth() {
    const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
}

export async function fetchOllamaStatus() {
    const res = await fetch(`${API_URL}/api/brief/status`, { cache: 'no-store' });
    if (!res.ok) return { online: false, models: [] };
    return res.json();
}

export { API_URL };
