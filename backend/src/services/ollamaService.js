const { getLatestBrief, insertBrief, getRecentHeadlines } = require('./dbService');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2:1.5b';

const BRIEF_PROMPT = `You are a world intelligence analyst working for a situational awareness dashboard called "World Monitor". 

Given the following recent headlines from around the world, produce a concise, professional intelligence brief. The brief should:
1. Start with a one-line executive summary of the most significant development
2. Group developments by region or theme (2-4 groups)
3. Highlight any escalation signals or critical developments with ⚠️
4. End with a short "outlook" sentence

Keep the language formal but clear. Use bullet points. Keep the total brief under 400 words.

HEADLINES:
`;

async function checkOllamaStatus() {
    try {
        const resp = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(5000) });
        if (resp.ok) {
            const data = await resp.json();
            return { online: true, models: (data.models || []).map(m => m.name) };
        }
        return { online: false, models: [] };
    } catch {
        return { online: false, models: [] };
    }
}

async function generateBrief(briefType = 'world') {
    const headlines = getRecentHeadlines(30);

    if (headlines.length === 0) {
        return {
            content: '⏳ No headlines available yet. Waiting for RSS feed ingestion to complete.',
            model: 'system',
            headline_count: 0
        };
    }

    const headlineText = headlines.map((h, i) =>
        `${i + 1}. [${h.source_name} — ${h.category}] ${h.title}`
    ).join('\n');

    // Try Ollama first
    try {
        const status = await checkOllamaStatus();
        if (status.online) {
            const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    prompt: BRIEF_PROMPT + headlineText,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 600,
                    }
                }),
                signal: AbortSignal.timeout(120000),
            });

            if (response.ok) {
                const data = await response.json();
                const brief = {
                    content: data.response,
                    brief_type: briefType,
                    model: OLLAMA_MODEL,
                    headline_count: headlines.length,
                };
                insertBrief(brief);
                return brief;
            }
        }
    } catch (err) {
        console.error(`[Ollama] Generation failed: ${err.message}`);
    }

    // Fallback: generate a structured summary without LLM
    const fallbackBrief = generateFallbackBrief(headlines);
    const brief = {
        content: fallbackBrief,
        brief_type: briefType,
        model: 'fallback-system',
        headline_count: headlines.length,
    };
    insertBrief(brief);
    return brief;
}

function generateFallbackBrief(headlines) {
    const categories = {};
    for (const h of headlines) {
        if (!categories[h.category]) categories[h.category] = [];
        categories[h.category].push(h);
    }

    let brief = `## 🌍 World Monitor Intelligence Brief\n`;
    brief += `**Generated:** ${new Date().toUTCString()}\n`;
    brief += `**Sources analyzed:** ${headlines.length} headlines across ${Object.keys(categories).length} categories\n\n`;

    // Executive summary from first headline
    brief += `### Executive Summary\n`;
    brief += `Top development: **${headlines[0].title}** (${headlines[0].source_name})\n\n`;

    // Group by category
    for (const [cat, items] of Object.entries(categories)) {
        brief += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`;
        for (const item of items.slice(0, 3)) {
            const severity = item.category === 'military' ? '⚠️ ' : '';
            brief += `- ${severity}**${item.title}** — _${item.source_name}_\n`;
        }
        brief += '\n';
    }

    brief += `### Outlook\nMultiple developments across ${Object.keys(categories).length} domains require continued monitoring. `;
    brief += `Priority signals identified in ${headlines.filter(h => h.category === 'military' || h.category === 'world').length} items.\n`;

    return brief;
}

module.exports = { generateBrief, checkOllamaStatus };
