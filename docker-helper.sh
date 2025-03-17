#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Church Planner Docker Helper  ${NC}"
echo -e "${GREEN}================================${NC}"

# Help function
function show_help {
  echo -e "${YELLOW}Usage:${NC}"
  echo -e "  ${GREEN}./docker-helper.sh${NC} [command] [options]"
  echo ""
  echo -e "${YELLOW}Commands:${NC}"
  echo -e "  ${GREEN}start-dev${NC}           Start development environment"
  echo -e "  ${GREEN}stop-dev${NC}            Stop development environment"
  echo -e "  ${GREEN}start-prod${NC}          Start production environment"
  echo -e "  ${GREEN}stop-prod${NC}           Stop production environment"
  echo -e "  ${GREEN}start-monitoring${NC}    Start only monitoring infrastructure"
  echo -e "  ${GREEN}stop-monitoring${NC}     Stop only monitoring infrastructure"
  echo -e "  ${GREEN}build-dev${NC}           Build development containers"
  echo -e "  ${GREEN}build-prod${NC}          Build production containers"
  echo -e "  ${GREEN}logs${NC} [service]      View logs for a service (client, server, mongodb, mongo-express, prometheus, grafana, loki, promtail)"
  echo -e "  ${GREEN}clean${NC}               Remove all containers, volumes, and images"
  echo -e "  ${GREEN}status${NC}              Show container status"
  echo -e "  ${GREEN}help${NC}                Show this help message"
  echo ""
  echo -e "${YELLOW}Options:${NC}"
  echo -e "  ${GREEN}--monitoring${NC}        Include monitoring infrastructure (with start-dev or start-prod)"
  echo ""
}

# Check if Docker is running
function check_docker {
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running or not installed.${NC}"
    exit 1
  fi
}

# Start monitoring infrastructure
function start_monitoring {
  check_docker
  echo -e "${GREEN}Starting monitoring infrastructure...${NC}"
  
  # Create the network if it doesn't exist - use the exact name required
  # Note: We do NOT want docker-compose to prefix the name here
  if ! docker network ls | grep -q "^church-planner-network"; then
    echo -e "${YELLOW}Creating network church-planner-network...${NC}"
    docker network create church-planner-network
  fi
  
  # We need to ensure our compose setup uses the correct network
  export COMPOSE_PROJECT_NAME="monitoring"
  
  # Use the -p flag to set the project name to avoid network name conflicts
  docker-compose -p monitoring -f docker-compose.monitoring.yml up -d
  
  # Check if containers started successfully
  if [ "$(docker ps --format '{{.Names}}' | grep -E 'prometheus|grafana|loki|promtail')" ]; then
    echo -e "${GREEN}Monitoring infrastructure started.${NC}"
    echo -e "${YELLOW}Services:${NC}"
    echo -e "  - Prometheus: ${GREEN}http://localhost:9090${NC}"
    echo -e "  - Grafana: ${GREEN}http://localhost:3030${NC} (admin/church-planner-admin)"
    echo -e "  - Loki: ${GREEN}http://localhost:3100${NC}"
    echo -e "  - Portainer: ${GREEN}http://localhost:9000${NC}"
  else
    echo -e "${RED}Failed to start monitoring infrastructure. Check docker-compose.monitoring.yml for errors.${NC}"
    docker-compose -p monitoring -f docker-compose.monitoring.yml logs
  fi
}

# Stop monitoring infrastructure
function stop_monitoring {
  check_docker
  echo -e "${GREEN}Stopping monitoring infrastructure...${NC}"
  
  # Use the same project name when stopping
  export COMPOSE_PROJECT_NAME="monitoring"
  docker-compose -p monitoring -f docker-compose.monitoring.yml down
  
  # Check if we should remove the network (only if no other containers are using it)
  if [ -z "$(docker ps -q -f network=church-planner-network)" ]; then
    echo -e "${YELLOW}Removing network church-planner-network...${NC}"
    docker network rm church-planner-network 2>/dev/null || true
  fi
  
  echo -e "${GREEN}Monitoring infrastructure stopped.${NC}"
}

# Start development environment
function start_dev {
  check_docker
  echo -e "${GREEN}Starting development environment...${NC}"
  docker-compose -f docker-compose.dev.yml up -d
  echo -e "${GREEN}Development environment started.${NC}"
  echo -e "${YELLOW}Services:${NC}"
  echo -e "  - Client: ${GREEN}http://localhost:3030${NC}"
  echo -e "  - Server API: ${GREEN}http://localhost:8080/api${NC}"
  echo -e "  - MongoDB Express: ${GREEN}http://localhost:8081${NC}"
  
  # Check if monitoring flag is present
  if [ "$1" == "--monitoring" ]; then
    start_monitoring
  fi
}

# Stop development environment
function stop_dev {
  check_docker
  echo -e "${GREEN}Stopping development environment...${NC}"
  docker-compose -f docker-compose.dev.yml down
  echo -e "${GREEN}Development environment stopped.${NC}"
  
  # Check if monitoring flag is present
  if [ "$1" == "--monitoring" ]; then
    stop_monitoring
  fi
}

# Start production environment
function start_prod {
  check_docker
  echo -e "${GREEN}Starting production environment...${NC}"
  docker-compose up -d
  echo -e "${GREEN}Production environment started.${NC}"
  echo -e "${YELLOW}Services:${NC}"
  echo -e "  - Client: ${GREEN}http://localhost:80${NC}"
  echo -e "  - Server API: ${GREEN}http://localhost:8080/api${NC}"
  echo -e "  - MongoDB Express: ${GREEN}http://localhost:8081${NC}"
  
  # Check if monitoring flag is present
  if [ "$1" == "--monitoring" ]; then
    start_monitoring
  fi
}

# Stop production environment
function stop_prod {
  check_docker
  echo -e "${GREEN}Stopping production environment...${NC}"
  docker-compose down
  echo -e "${GREEN}Production environment stopped.${NC}"
  
  # Check if monitoring flag is present
  if [ "$1" == "--monitoring" ]; then
    stop_monitoring
  fi
}

# Build development containers
function build_dev {
  check_docker
  echo -e "${GREEN}Building development containers...${NC}"
  docker-compose -f docker-compose.dev.yml build
  echo -e "${GREEN}Development containers built.${NC}"
}

# Build production containers
function build_prod {
  check_docker
  echo -e "${GREEN}Building production containers...${NC}"
  docker-compose build
  echo -e "${GREEN}Production containers built.${NC}"
}

# View logs
function view_logs {
  check_docker
  if [ -z "$1" ]; then
    echo -e "${RED}Error: Please specify a service (client, server, mongodb, mongo-express, prometheus, grafana, loki, promtail).${NC}"
    exit 1
  fi
  
  # Define a variable to track if we found the service
  local service_found=false
  
  # Check service in monitoring environment
  if [[ "$1" == "prometheus" || "$1" == "grafana" || "$1" == "loki" || "$1" == "promtail" || "$1" == "node-exporter" || "$1" == "portainer" ]]; then
    if [ "$(docker-compose -f docker-compose.monitoring.yml ps -q)" ]; then
      echo -e "${GREEN}Viewing logs for $1 (monitoring)...${NC}"
      docker-compose -f docker-compose.monitoring.yml logs -f "$1"
      service_found=true
      return
    else
      echo -e "${YELLOW}Note: Monitoring environment is not running.${NC}"
    fi
  fi
  
  # Check service in development environment
  if [ "$(docker-compose -f docker-compose.dev.yml ps -q)" ]; then
    # Check if the service exists in dev environment
    if docker-compose -f docker-compose.dev.yml ps | grep -q "$1"; then
      echo -e "${GREEN}Viewing logs for $1 (development)...${NC}"
      docker-compose -f docker-compose.dev.yml logs -f "$1"
      service_found=true
      return
    fi
  fi
  
  # Check service in production environment
  if [ "$(docker-compose ps -q)" ]; then
    # Check if the service exists in production environment
    if docker-compose ps | grep -q "$1"; then
      echo -e "${GREEN}Viewing logs for $1 (production)...${NC}"
      docker-compose logs -f "$1"
      service_found=true
      return
    fi
  fi
  
  # If we got here and service_found is still false, service was not found in any running environment
  if [ "$service_found" = false ]; then
    if [[ "$1" == "prometheus" || "$1" == "grafana" || "$1" == "loki" || "$1" == "promtail" || "$1" == "node-exporter" || "$1" == "portainer" ]]; then
      echo -e "${RED}Service '$1' was not found. Make sure monitoring is running with 'start-monitoring' command.${NC}"
    elif [ "$(docker-compose -f docker-compose.dev.yml ps -q)" ] || [ "$(docker-compose ps -q)" ]; then
      echo -e "${RED}Service '$1' was not found in any running environment.${NC}"
    else
      echo -e "${RED}Error: No containers are running.${NC}"
    fi
    exit 1
  fi
}

# Clean up
function clean {
  check_docker
  echo -e "${YELLOW}Warning: This will remove all Church Planner containers, volumes, and images.${NC}"
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Stopping all containers...${NC}"
    docker-compose -f docker-compose.dev.yml down 2>/dev/null
    docker-compose down 2>/dev/null
    docker-compose -p monitoring -f docker-compose.monitoring.yml down 2>/dev/null
    
    echo -e "${GREEN}Removing volumes...${NC}"
    docker volume rm $(docker volume ls -q | grep church-planner) 2>/dev/null
    docker volume rm $(docker volume ls -q | grep monitoring) 2>/dev/null
    
    echo -e "${GREEN}Removing networks...${NC}"
    docker network rm church-planner-network 2>/dev/null || true
    
    echo -e "${GREEN}Removing images...${NC}"
    docker rmi $(docker images | grep church-planner | awk '{print $3}') 2>/dev/null
    docker rmi $(docker images | grep 'grafana\|prometheus\|loki\|promtail' | awk '{print $3}') 2>/dev/null
    
    echo -e "${GREEN}Cleanup completed.${NC}"
  else
    echo -e "${GREEN}Cleanup canceled.${NC}"
  fi
}

# Show container status
function status {
  check_docker
  
  echo -e "${GREEN}Development Containers:${NC}"
  # Use grep to filter container names to ensure we only get dev containers
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Command}}\t{{.Status}}\t{{.Ports}}" | grep "\-dev" || echo "No development containers running"
  echo
  
  echo -e "${GREEN}Production Containers:${NC}"
  # Use grep to filter container names to ensure we only get production containers (those without -dev suffix)
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Command}}\t{{.Status}}\t{{.Ports}}" | grep -v "\-dev" | grep "church-planner" | grep -v "prometheus\|grafana\|loki\|promtail\|node-exporter\|portainer" || echo "No production containers running"
  echo
  
  echo -e "${GREEN}Monitoring Containers:${NC}"
  # Look specifically for monitoring containers by name pattern
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Command}}\t{{.Status}}\t{{.Ports}}" | grep "prometheus\|grafana\|loki\|promtail\|node-exporter\|portainer" || echo "No monitoring containers running"
}

# Main script logic
case "$1" in
  start-dev)
    start_dev "$2"
    ;;
  stop-dev)
    stop_dev "$2"
    ;;
  start-prod)
    start_prod "$2"
    ;;
  stop-prod)
    stop_prod "$2"
    ;;
  start-monitoring)
    start_monitoring
    ;;
  stop-monitoring)
    stop_monitoring
    ;;
  build-dev)
    build_dev
    ;;
  build-prod)
    build_prod
    ;;
  logs)
    view_logs "$2"
    ;;
  clean)
    clean
    ;;
  status)
    status
    ;;
  help|*)
    show_help
    ;;
esac

exit 0 