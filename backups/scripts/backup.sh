#!/bin/bash

BACKUP_DIR="$(dirname "$0")/../dumps"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p "$BACKUP_DIR"

echo "Starting backup at $DATE..."

docker exec postgres pg_dump -U ${POSTGRES_USER:-user} ${POSTGRES_DB:-transcendence} > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
else
    echo "Backup failed!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Keep only last 7 days
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete
echo "Old backups cleaned up"
