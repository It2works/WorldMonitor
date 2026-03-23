'use client';

import { useState, useEffect } from 'react';
import { fetchHealth, fetchOllamaStatus } from '../lib/api';

export default function StatsBar() {
    const [stats, setStats] = useState(null);
    const [llmStatus, setLlmStatus] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [healthData, ollamaData] = await Promise.all([
                    fetchHealth().catch(() => null),
                    fetchOllamaStatus().catch(() => ({ online: false, models: [] }))
                ]);
                setStats(healthData);
                setLlmStatus(ollamaData);
            } catch (e) {
                console.error('Failed to load stats:', e);
            }
        };
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    const items = [
        { icon: '📰', value: stats?.articleCount ?? '—', label: 'Articles', accent: '#00d4ff' },
        { icon: '📡', value: stats?.feedCount ?? '—', label: 'Active Feeds', accent: '#3b82f6' },
        { icon: '🗺️', value: stats?.eventCount ?? '—', label: 'Map Events', accent: '#a78bfa' },
        {
            icon: '🤖',
            value: llmStatus?.online ? 'Online' : 'Offline',
            label: 'LLM Status',
            accent: llmStatus?.online ? '#10d9a0' : '#f43f5e'
        },
        {
            icon: '⏱️',
            value: stats?.lastBriefAt ? new Date(stats.lastBriefAt).toLocaleTimeString() : 'N/A',
            label: 'Last Brief',
            accent: '#fbbf24'
        },
    ];

    return (
        <div className="stats-bar">
            {items.map((item, i) => (
                <div
                    className="stat-card"
                    key={i}
                    style={{ '--stat-accent': item.accent }}
                >
                    {/* Top accent bar per card */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: '15%', right: '15%',
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`,
                        borderRadius: '1px',
                        opacity: 0.7,
                    }} />
                    <div className="stat-icon" style={{
                        background: `linear-gradient(135deg, ${item.accent}18, ${item.accent}0d)`,
                        border: `1px solid ${item.accent}28`,
                    }}>
                        {item.icon}
                    </div>
                    <div>
                        <div className="stat-value" style={{ color: item.accent === '#f43f5e' ? '#f43f5e' : undefined }}>
                            {item.value}
                        </div>
                        <div className="stat-label">{item.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
