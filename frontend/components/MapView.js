'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { fetchMapEvents } from '../lib/api';

// Leaflet must be loaded client-side only
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

const EVENT_TYPES = ['all', 'political', 'military', 'economic', 'disaster', 'tech', 'science', 'environment', 'humanitarian', 'cyber'];

const SEVERITY_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#10b981',
};

const TYPE_COLORS = {
    political: '#3b82f6',
    military: '#ef4444',
    economic: '#10b981',
    disaster: '#f97316',
    tech: '#8b5cf6',
    science: '#06b6d4',
    environment: '#22c55e',
    humanitarian: '#ec4899',
    cyber: '#a855f7',
    news: '#64748b',
};

export default function MapView() {
    const [events, setEvents] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [leafletReady, setLeafletReady] = useState(false);

    useEffect(() => {
        // Import Leaflet CSS client-side
        import('leaflet/dist/leaflet.css');
        setLeafletReady(true);
    }, []);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                const data = await fetchMapEvents(activeFilter === 'all' ? undefined : activeFilter);
                setEvents(data.events || []);
            } catch (e) {
                console.error('Failed to load map events:', e);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
        const interval = setInterval(loadEvents, 120000);
        return () => clearInterval(interval);
    }, [activeFilter]);

    const filteredEvents = useMemo(() => {
        if (activeFilter === 'all') return events;
        return events.filter(e => e.event_type === activeFilter);
    }, [events, activeFilter]);

    return (
        <div className="panel">
            <div className="panel-header">
                <div className="panel-title">
                    <span className="panel-title-icon">🗺️</span>
                    Global Situational Map
                </div>
                <div className="panel-badge">{filteredEvents.length} events</div>
            </div>

            <div className="map-controls">
                {EVENT_TYPES.map((type) => (
                    <button
                        key={type}
                        className={`map-layer-btn ${activeFilter === type ? 'active' : ''}`}
                        onClick={() => setActiveFilter(type)}
                    >
                        {type === 'all' ? '⊕ All' : type}
                    </button>
                ))}
            </div>

            <div className="panel-body" style={{ padding: 0 }}>
                {!leafletReady || loading ? (
                    <div className="loading" style={{ minHeight: 300 }}>
                        <div className="loading-spinner"></div>
                        <div className="loading-text">LOADING MAP...</div>
                    </div>
                ) : (
                    <div className="map-container" style={{ height: 400 }}>
                        <div className="map-legend">
                            <span className="map-legend-label">Severity</span>
                            <span className="legend-dot critical"></span>
                            <span>Critical</span>
                            <span className="legend-dot high"></span>
                            <span>High</span>
                            <span className="legend-dot medium"></span>
                            <span>Medium</span>
                            <span className="legend-dot low"></span>
                            <span>Low</span>
                        </div>
                        <MapContainer
                            center={[25, 10]}
                            zoom={2}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={true}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            {filteredEvents.map((event, i) => (
                                <CircleMarker
                                    key={event.id || i}
                                    center={[event.lat, event.lon]}
                                    radius={event.severity === 'critical' ? 10 : event.severity === 'high' ? 8 : 6}
                                    pathOptions={{
                                        color: TYPE_COLORS[event.event_type] || '#64748b',
                                        fillColor: SEVERITY_COLORS[event.severity] || '#64748b',
                                        fillOpacity: 0.6,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="event-popup">
                                            <h3>{event.title}</h3>
                                            {event.description && <p>{event.description}</p>}
                                            <p>
                                                <span
                                                    className="severity-badge"
                                                    style={{
                                                        background: SEVERITY_COLORS[event.severity] || '#64748b',
                                                        color: 'white',
                                                    }}
                                                >
                                                    {event.severity}
                                                </span>
                                                {' '}
                                                <span style={{ fontSize: '10px', color: '#64748b' }}>
                                                    {event.event_type} • {event.source}
                                                </span>
                                            </p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
