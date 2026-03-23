'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchArticles } from '../lib/api';

const CATEGORIES = ['all', 'world', 'tech', 'finance', 'science', 'military', 'environment'];

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

export default function NewsPanel() {
    const [articles, setArticles] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const loadArticles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchArticles(activeCategory, 60);
            setArticles(data.articles || []);
            setCurrentPage(1);
        } catch (e) {
            console.error('Failed to load articles:', e);
            setError('Failed to load news feed');
        } finally {
            setLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        loadArticles();
        const interval = setInterval(loadArticles, 60000);
        return () => clearInterval(interval);
    }, [loadArticles]);

    const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pagedArticles = articles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="panel">
            <div className="panel-header">
                <div className="panel-title">
                    <span className="panel-title-icon">📰</span>
                    Live Intelligence Feed
                </div>
                <div className="panel-badge">{articles.length} items</div>
            </div>

            <div className="category-tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat === 'all' ? '⊕ All' : cat}
                    </button>
                ))}
            </div>

            <div className="panel-body">
                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">FETCHING INTELLIGENCE...</div>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">⚠️</div>
                        <div>{error}</div>
                        <button className="btn" onClick={loadArticles}>Retry</button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div>No articles yet. RSS feeds are being fetched...</div>
                    </div>
                ) : (
                    <>
                        <div className="news-list">
                            {pagedArticles.map((article, i) => (
                                <a
                                    key={article.id || i}
                                    className="news-item"
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className={`news-category-dot ${article.category || 'world'}`}></div>
                                    <div className="news-content">
                                        <div className="news-title">{article.title}</div>
                                        <div className="news-meta">
                                            <span className="news-source">{article.source_name}</span>
                                            <span>•</span>
                                            <span className="news-time">{timeAgo(article.published_at)}</span>
                                            <span>•</span>
                                            <span className="news-category-pill">
                                                {article.category}
                                            </span>
                                        </div>
                                        {article.description && (
                                            <div className="news-description">{article.description}</div>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>

                        <div className="news-pagination">
                            <button
                                className="pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                Previous
                            </button>

                            <div className="pagination-pages">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
