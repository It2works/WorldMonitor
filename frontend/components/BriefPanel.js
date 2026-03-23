'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchLatestBrief, generateBrief } from '../lib/api';

export default function BriefPanel() {
    const [brief, setBrief] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const briefRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchLatestBrief('world');
                if (data.brief) {
                    setBrief(data.brief);
                    setDisplayedText(data.brief.content);
                }
            } catch (e) {
                console.error('Failed to load brief:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!isTyping || !brief?.content) return;
        let index = 0;
        const content = brief.content;
        setDisplayedText('');
        const interval = setInterval(() => {
            if (index < content.length) {
                const nextChunk = content.substring(index, Math.min(index + 4, content.length));
                setDisplayedText(prev => prev + nextChunk);
                index += 4;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 12);
        return () => clearInterval(interval);
    }, [isTyping, brief]);

    useEffect(() => {
        if (!briefRef.current) return;
        briefRef.current.scrollTop = briefRef.current.scrollHeight;
    }, [displayedText]);

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const data = await generateBrief('world');
            if (data.brief) {
                setBrief(data.brief);
                setIsTyping(true);
            }
        } catch (e) {
            console.error('Failed to generate brief:', e);
        } finally {
            setGenerating(false);
        }
    };

    const renderBrief = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            if (line.startsWith('## ')) {
                return <h2 key={i} style={{ marginTop: i > 0 ? 16 : 0 }}>{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={i}>{line.slice(4)}</h3>;
            }
            if (line.startsWith('- ')) {
                const content = line.slice(2)
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/_(.*?)_/g, '<em>$1</em>');
                return <p key={i} className="brief-bullet" dangerouslySetInnerHTML={{ __html: content }} />;
            }
            if (line.includes('**')) {
                const content = line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/_(.*?)_/g, '<em>$1</em>');
                return <p key={i} dangerouslySetInnerHTML={{ __html: content }} style={{ marginBottom: 4 }} />;
            }
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} style={{ marginBottom: 4 }}>{line}</p>;
        });
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <div className="panel-title">
                    <span className="panel-title-icon">⚡</span>
                    Intelligence Brief — AI Analysis
                </div>
                <div className="brief-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <div className="loading-spinner"></div>
                                Generating...
                            </>
                        ) : (
                            <>✦ Generate Brief</>
                        )}
                    </button>
                </div>
            </div>

            <div className="panel-body">
                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">LOADING INTELLIGENCE BRIEF...</div>
                    </div>
                ) : !brief ? (
                    <div className="empty-state" style={{ padding: 40 }}>
                        <div className="empty-state-icon">⚡</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7 }}>
                            No intelligence brief generated yet.<br />
                            Click <strong style={{ color: 'var(--accent-cyan)' }}>Generate Brief</strong> to create one using AI.
                        </div>
                    </div>
                ) : (
                    <div className="brief-content" ref={briefRef}>
                        <div className="brief-markdown">{renderBrief(displayedText)}</div>
                        {isTyping && <span className="typing-cursor"></span>}
                    </div>
                )}
            </div>

            {brief && (
                <div className="brief-meta">
                    <span>Model: {brief.model || 'N/A'}</span>
                    <span>Headlines: {brief.headline_count || 0}</span>
                    <span>{brief.created_at ? new Date(brief.created_at).toLocaleString() : ''}</span>
                </div>
            )}
        </div>
    );
}
