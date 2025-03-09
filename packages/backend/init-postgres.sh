#!/bin/bash
# //packages/backend/init-postgres.sh
set -e

max_attempts=30
attempt=1
sleep_time=3

# Wait for Postgres to be ready using increased timeout
until pg_isready -U "$POSTGRES_USER" -p 5432; do
  if [ $attempt -gt $max_attempts ]; then
    echo "Postgres did not become ready in time. Exiting."
    exit 1
  fi
  echo "Waiting for Postgres... (attempt $attempt/$max_attempts)"
  sleep $sleep_time
  attempt=$((attempt + 1))
done

# Wait for Postgres to accept connections
echo "Waiting for Postgres to be available..."
attempt=0
max_attempts=30
until pg_isready -p 5432; do
  attempt=$((attempt+1))
  echo "Port 5432 - no response (attempt $attempt/$max_attempts)"
  if [ "$attempt" -ge "$max_attempts" ]; then
      echo "Postgres did not become available in time."
      exit 1
  fi
  sleep 1
done
echo "Postgres is up - proceeding with initialization."

# Check if the database exists. If not, create it.
RESULT=$(psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -w "$POSTGRES_DB" | wc -l)
if [ "$RESULT" -eq "0" ]; then
  echo "Database $POSTGRES_DB does not exist. Creating..."
  psql -U "$POSTGRES_USER" -c "CREATE DATABASE $POSTGRES_DB"
else
  echo "Database $POSTGRES_DB already exists. Running migrations..."
fi

# Create basic tables (idempotent via IF NOT EXISTS)
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

echo "Basic tables checked/created successfully."

# Run migration: alter users table to add timestamps if missing
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
  -- Alter users table: add created_at and last_login if they don't exist
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
EOSQL

echo "Users table altered successfully (timestamps verified)."

# Run migration: create permissions tables if missing
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
  -- Create permissions table
  CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
  );

  -- Create user_permissions table
  CREATE TABLE IF NOT EXISTS user_permissions (
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
  );
EOSQL

echo "Permissions tables checked/created successfully."
echo "Database schema initialized successfully."