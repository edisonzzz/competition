#!/bin/bash

echo "🧹 Cleaning CTF Platform"
echo "================================"
echo ""

read -p "Are you sure you want to clean all data? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Stopping services..."
    docker compose down

    echo "Deleting containers and volumes..."
    docker compose down -v

    echo "Cleaning images..."
    docker rmi blueteamctf-backend blueteamctf-frontend 2>/dev/null || true

    echo ""
    echo "Cleanup complete!"
    echo ""
    echo "Next startup will rebuild and initialize the database"
else
    echo "Cleanup cancelled"
fi