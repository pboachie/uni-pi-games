#!/bin/bash
# //packages/backend/init-postgres.sh
set -e

# Wait for Postgres to be ready
until pg_isready -U "$POSTGRES_USER" -h localhost -p 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

# Check if the database exists. If not, create it.
RESULT=$(psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -w "$POSTGRES_DB" | wc -l)
if [ "$RESULT" -eq "0" ]; then
  echo "Database $POSTGRES_DB does not exist. Creating..."
  psql -U "$POSTGRES_USER" -c "CREATE DATABASE $POSTGRES_DB"
else
  echo "Database $POSTGRES_DB already exists."
fi