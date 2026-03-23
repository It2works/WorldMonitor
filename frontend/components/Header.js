'use client';

import { useState, useEffect } from 'react';

export default function Header() {
    const [time, setTime] = useState('');
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const check = async () => {
            try {
                const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API}/api/health`);
                setOnline(res.ok);
            } catch {
                setOnline(false);
            }
        };
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="header">
            <div className="header-brand">
                {/* SVG Globe Logo */}
                <div className="header-logo" title="World Monitor">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9.5" stroke="#00d4ff" strokeWidth="1.4" opacity="0.95" />
                        <ellipse cx="12" cy="12" rx="9.5" ry="3.5" stroke="#00d4ff" strokeWidth="1.2" opacity="0.6" />
                        <ellipse cx="12" cy="12" rx="4.5" ry="9.5" stroke="#00d4ff" strokeWidth="1.1" opacity="0.5" />
                        <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="#00d4ff" strokeWidth="1" opacity="0.35" />
                        <circle cx="12" cy="12" r="1.8" fill="#00d4ff" opacity="0.95" />
                    </svg>
                </div>
                <div>
                    <div className="header-title">World Monitor</div>
                    <div className="header-subtitle">Intelligence Dashboard · Global Ops</div>
                </div>
            </div>
            <div className="header-status">
                <div className="status-indicator">
                    <span className={`status-dot ${online ? '' : 'offline'}`}></span>
                    {online ? 'SYSTEMS ONLINE' : 'API OFFLINE'}
                </div>
                <div className="status-indicator">
                    <span>📡</span>
                    LIVE FEED
                </div>
                <div className="status-chip">CLASSIFIED</div>
                <div className="header-time">{time}</div>
            </div>
        </header>
    );
}
