# 🐳 CTF Platform - Docker Version

## Quick Start

### One-click Start (Recommended)

```bash
./docker-start.sh
```

### Manual Start

```bash
# Build and start all services
docker compose up -d --build

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

## Access Platform

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Test Accounts

- **Judge**: `judge` / `judge123`
- **Player**: `team1` / `team123`

## Docker Commands

### Service Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# Check service status
docker compose ps

# View live logs
docker compose logs -f

# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend
```

### Data Management

```bash
# Clean all data (including database)
docker compose down -v

# Stop only, keep data
docker compose down

# Reinitialize database
docker compose exec backend node src/initDatabase.js
```

### Full Cleanup

```bash
# Use cleanup script
./docker-clean.sh

# Or manual cleanup
docker compose down -v
docker rmi blueteamctf-backend blueteamctf-frontend
```

## Data Persistence

Database files stored in Docker volume:
- Volume name: `blueteamctf_blueteam-data`
- Container path: `/app/database`

Data persists even after `docker compose down`.

## Development Mode

Code is mounted via volumes, changes auto-reload:
- Backend: `nodemon` auto-restart
- Frontend: Vite HMR hot reload

## Network Configuration

All services in the same Docker network:
- Network name: `blueteam-network`
- Backend container name: `blueteam-backend`
- Frontend container name: `blueteam-frontend`
- Frontend accesses backend via `http://backend:3000`

## Port Mapping

- `3001` -> Backend API (host port)
- `3000` -> Backend API (container port)
- `5173` -> Frontend web UI

## Troubleshooting

### Port Already in Use

Modify port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
  - "5174:5173"  # Change 5173 to 5174
```

### View Detailed Logs

```bash
# View backend errors
docker compose logs backend

# View frontend errors
docker compose logs frontend

# Real-time tracking of all logs
docker compose logs -f --tail=100
```

### Enter Container for Debugging

```bash
# Enter backend container
docker compose exec backend sh

# Enter frontend container
docker compose exec frontend sh
```

### Rebuild Images

```bash
# Force rebuild
docker compose build --no-cache

# Restart
docker compose up -d
```

## Production Deployment

For production, it is recommended to:

1. Change `JWT_SECRET` in `backend/.env`
2. Use `NODE_ENV=production`
3. Configure reverse proxy (Nginx)
4. Enable HTTPS
5. Set resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Advantages

✅ **One-click Start** - No need to manually install Node.js and dependencies  
✅ **Environment Isolation** - Does not pollute local environment  
✅ **Quick Cleanup** - Single command to clear all data  
✅ **Easy Deployment** - Deploy to any Docker-supported server  
✅ **Data Persistence** - Data does not disappear on container restart  
✅ **Dev Friendly** - Code changes auto hot-reload  

## System Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ available memory
- 5GB+ available disk space

## License

MIT