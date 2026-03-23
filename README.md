# 🌍 World Monitor — Intelligence Dashboard

Real-time global intelligence dashboard with AI-powered news aggregation, interactive situational awareness map, and AI-synthesized intelligence briefs.

Inspired by [koala73/worldmonitor](https://github.com/koala73/worldmonitor).

![Dashboard Preview](https://img.shields.io/badge/Status-Live-00d4ff?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────┐
│                   Frontend                        │
│   Next.js 14 · Leaflet.js · Premium Dark Theme   │
│   ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│   │ News     │ │ Map View │ │ AI Brief Panel   │ │
│   │ Panel    │ │ (Leaflet)│ │ (Ollama/Qwen)    │ │
│   └────▲─────┘ └────▲─────┘ └──────▲───────────┘ │
│        │             │              │             │
└────────┼─────────────┼──────────────┼─────────────┘
         │ REST API    │              │
┌────────▼─────────────▼──────────────▼─────────────┐
│                   Backend                          │
│   Express.js · Node-Cron · RSS Parser             │
│   ┌───────────┐ ┌────────────┐ ┌───────────────┐ │
│   │ /api/     │ │ RSS        │ │ Ollama        │ │
│   │ articles  │ │ Ingestion  │ │ LLM Client    │ │
│   │ feeds     │ │ Service    │ │ Service       │ │
│   │ map       │ │ (15-min)   │ │               │ │
│   │ brief     │ │            │ │               │ │
│   └─────▲─────┘ └──────▲─────┘ └──────▲────────┘ │
│         │              │              │           │
└─────────┼──────────────┼──────────────┼───────────┘
          │              │              │
┌─────────▼──────┐  ┌────▼────┐  ┌──────▼──────────┐
│   SQLite DB    │  │ RSS     │  │  Ollama Server  │
│   (4 tables)   │  │ Feeds   │  │  (qwen2:1.5b)   │
└────────────────┘  │ (20+)   │  └─────────────────┘
                    └─────────┘
```

### Database Schema

| Table | Purpose |
|-------|---------|
| `feeds` | RSS feed sources (name, url, category, country) |
| `articles` | Parsed headlines with geo-coordinates |
| `briefs` | AI-generated intelligence summaries |
| `map_events` | Geo-located events for map display |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status + stats |
| GET | `/api/feeds` | List all RSS sources |
| GET | `/api/articles?category=&limit=` | Aggregated headlines |
| GET | `/api/articles/categories` | Article counts by category |
| GET | `/api/map/events?type=` | Geo-located map events |
| GET | `/api/brief/latest?type=` | Latest cached AI brief |
| POST | `/api/brief` | Generate new AI brief |
| GET | `/api/brief/status` | Ollama LLM health check |

---

## 🚀 Quick Start (Local)

### Prerequisites

- **Node.js 18+** (recommended: 20 LTS)
- **npm** 9+
- **Ollama** (optional — app works without it via fallback)

### 1. Clone & Install

```bash
git clone https://github.com/It2works/WorldMonitor.git
cd worldmonitor

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 3. Start Backend

```bash
cd backend
npm start
# Server starts on http://localhost:3001
# RSS feeds begin fetching automatically
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
# Opens on http://localhost:3000
```

### 5. (Optional) Set Up Ollama

```bash
# Install Ollama: https://ollama.ai
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a lightweight model
ollama pull qwen2:1.5b

# Ollama runs on http://localhost:11434 by default
# The backend auto-detects it
```

---

## 🐳 Docker Deployment

```bash
# Start all services (backend + frontend + ollama)
docker-compose up -d

# Pull the LLM model into Ollama container
docker exec -it worldmonitor-ollama-1 ollama pull qwen2:1.5b

# Access the dashboard
open http://localhost:3000
```

---

## ☁️ VPS Deployment (Production)

### Deploy Backend + Ollama on VPS

```bash
# 1. SSH into your VPS
ssh user@your-vps-ip

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull qwen2:1.5b

# 4. Clone and set up
git clone https://github.com/It2works/WorldMonitor.git
cd worldmonitor/backend
npm install

# 5. Configure
export PORT=3001
export OLLAMA_HOST=http://localhost:11434
export OLLAMA_MODEL=qwen2:1.5b
export DATABASE_PATH=./worldmonitor.db

# 6. Run with PM2 (recommended)
npm install -g pm2
pm2 start src/server.js --name worldmonitor-api
pm2 save
pm2 startup
```

### Deploy Frontend on Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-vps-ip:3001
```

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Map | Leaflet.js + react-leaflet, CARTO dark tiles |
| Styling | Vanilla CSS, glassmorphism, CSS variables |
| Backend | Express.js, Node.js 20 |
| Database | SQLite (better-sqlite3), WAL mode |
| RSS | rss-parser (20 curated sources) |
| LLM | Ollama (qwen2:1.5b / llama3.2) |
| Scheduling | node-cron (15-min RSS refresh) |

---

## 📡 RSS Feed Categories

| Category | Sources |
|----------|---------|
| 🌍 World | Reuters, BBC, Al Jazeera, AP, NPR, UN News |
| 💻 Tech | TechCrunch, Ars Technica, The Verge, Hacker News |
| 💰 Finance | CNBC, Financial Times, Bloomberg |
| 🔬 Science | NASA, Science Daily, Nature |
| ⚔️ Military | Defense One, Jane's Defence |
| 🌱 Environment | Reuters Environment, The Guardian |

---

## 📄 License

MIT

---

## 👤 Author

Built as a course project — World Monitor Intelligence Dashboard.
