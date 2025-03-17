#!/bin/bash

# Script to generate API traffic for metrics demonstration
echo "Generating traffic for Church Planner API metrics..."

# Base URL
API_URL="http://localhost:8080"

# Function to make API requests
make_request() {
  local endpoint=$1
  local method=${2:-GET}
  local data=$3
  local status_code=0
  
  echo "Making $method request to $endpoint"
  
  if [ "$method" = "GET" ]; then
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
  elif [ "$method" = "POST" ]; then
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
  elif [ "$method" = "PUT" ]; then
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X PUT -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
  elif [ "$method" = "DELETE" ]; then
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL$endpoint")
  fi
  
  echo "  -> Status: $status_code"
  sleep 0.5
}

# Function to generate random strings (Mac-compatible)
random_string() {
  openssl rand -hex 5
}

# 1. Make requests to different endpoints (Public)
echo "Making requests to different endpoints..."

# Root path (should return 200)
make_request "/" "GET"

# Metrics endpoint
make_request "/metrics" "GET"

# Non-existent paths (to generate 404 errors)
make_request "/api/nonexistent" "GET"
make_request "/unknown-path" "GET"
make_request "/bad-route" "GET"

# 2. Make multiple API requests in a loop to build up metrics
echo "Making repeated API requests..."

# Define endpoints to hit in a loop
endpoints=(
  "/metrics"
  "/api/nonexistent"
  "/"
  "/unknown"
  "/api/auth/login"
)

# Generate many requests to build up metrics
for i in {1..30}; do
  # Select a random endpoint from the array
  index=$((RANDOM % ${#endpoints[@]}))
  endpoint=${endpoints[$index]}
  
  make_request "$endpoint" "GET"
  sleep 0.1
done

# 3. Make some POST requests with invalid data to generate errors
echo "Generating bad requests to trigger errors..."

# Invalid JSON to trigger parsing errors
make_request "/api/auth/login" "POST" "{bad json}"
make_request "/api/auth/register" "POST" "{missing: fields}"

# Try a valid login with incorrect credentials
make_request "/api/auth/login" "POST" '{"email":"nonexistent@example.com","password":"wrong"}'

echo "Traffic generation complete!"
echo "Check your Grafana dashboard to see the metrics." 