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

# Create all necessary tables
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
  );

  -- Games table (e.g., for managing game pools or sessions)
  CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(255) UNIQUE NOT NULL,
    pool_amount FLOAT NOT NULL DEFAULT 0,
    num_players INTEGER NOT NULL DEFAULT 0,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Transactions table (e.g., for tracking user actions like bets or payments)
  CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    game_id INTEGER REFERENCES games(id),
    amount FLOAT NOT NULL,
    type VARCHAR(50) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Refresh tokens table for secure storage and rotation
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
EOSQL

echo "Database schema initialized successfully."