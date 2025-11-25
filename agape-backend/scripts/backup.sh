#!/bin/bash

# Database backup script
# Schedule with cron: 0 2 * * * /path/to/backup.sh

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="agape_looks_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "📦 Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
if [ -n "$DATABASE_URL" ]; then
  # Use DATABASE_URL if available
  pg_dump $DATABASE_URL > "${BACKUP_DIR}/${BACKUP_FILE}"
else
  # Use individual connection parameters
  PGPASSWORD=$DB_PASSWORD pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d $DB_NAME \
    > "${BACKUP_DIR}/${BACKUP_FILE}"
fi

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup created: ${COMPRESSED_FILE}"

# Calculate size
SIZE=$(du -h "${BACKUP_DIR}/${COMPRESSED_FILE}" | cut -f1)
echo "📊 Backup size: ${SIZE}"

# Remove old backups
echo "🗑️  Removing backups older than ${RETENTION_DAYS} days..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Count remaining backups
COUNT=$(ls -1 $BACKUP_DIR/*.sql.gz 2>/dev/null | wc -l)
echo "📁 Total backups: ${COUNT}"

echo "✅ Backup completed successfully!"

# Optional: Upload to cloud storage
# aws s3 cp "${BACKUP_DIR}/${COMPRESSED_FILE}" s3://your-bucket/backups/
