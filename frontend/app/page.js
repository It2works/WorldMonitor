'use client';

import Header from '../components/Header';
import StatsBar from '../components/StatsBar';
import NewsPanel from '../components/NewsPanel';
import MapView from '../components/MapView';
import BriefPanel from '../components/BriefPanel';

export default function Home() {
    return (
        <main className="app-shell">
            <Header />
            <StatsBar />
            <div className="dashboard">
                <NewsPanel />
                <MapView />
                <BriefPanel />
            </div>
        </main>
    );
}
