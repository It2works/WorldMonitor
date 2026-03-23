# 🚀 Running World Monitor with Docker

This project is fully dockerized for easy deployment and sharing. Follow these steps to get the entire intelligence dashboard running on your machine.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Setup & Launch

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd worldmonitor
   ```

2. **Launch with Docker Compose**:
   ```bash
   docker compose up -d
   ```

3. **Wait for Services**:
   - The **Backend** will be available at `http://localhost:3001`.
   - The **Frontend** will be available at `http://localhost:3000`.
   - The **Ollama** service will pull the necessary AI model (`qwen2:1.5b`) automatically in the background.

## Persistence

- The project uses Docker volumes to ensure your data stays safe:
  - `backend-data`: Stores the SQLite database (`worldmonitor.db`).
  - `ollama-data`: Stores the downloaded AI models.

## Monitoring & Logs

To see what's happening inside the containers:
```bash
docker compose logs -f
```

To stop the project:
```bash
docker compose down
```

## Troubleshooting

### Database Seeding
If you need to seed the database with initial data, you can run:
```bash
docker compose exec backend npm run seed
```

### Changing AI Model
If you want to use a different Ollama model, update the `OLLAMA_MODEL` environment variable in `docker-compose.yml` and restart the services.
